import jwt from "jsonwebtoken";
const { JsonWebTokenError } = jwt;
import type { AccessTokenClaims, AuthTokens, RefreshTokenClaims } from "../types/index.ts";
import { HttpError } from "../errors/httpError.ts";
import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { AUTH_ERRORS, HTTP_ERRORS } from "../lang/en.ts";
import type { UserService } from "./user.service.ts";
import { prisma } from "../data/db.ts";
import type { RefreshTokenInfo, User } from "../data/models/generated/prisma/client.ts";
import { logger } from "./logger.service.ts";

export class AuthTokenService {

  public static readonly  ACCESS_TOKEN_EXPIRY_TIME_MINS   = 5;
  public static readonly  ACCESS_TOKEN_EXPIRY_TIME_UNITS  = "minutes";

  private static readonly ACCESS_TOKEN_EXPIRY_TIME_JWT_FORMATTED  = "5min";
  private static readonly REFRESH_TOKEN_EXPIRY_TIME_JWT_FORMATTED = "30d";

  private static readonly JWT_TOKEN_EXPIRED_MSG = "jwt expired";

  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /***
   * Creates an access token with applicable claims from the user, and a refresh token with a user id.
   * The access token is short lived (minutes) and the refresh token is long lived (days).
   * Access token is recreated on the next request that requires authentication (short lived) if the refresh token is not expired.
   * Refresh token preserves the user's login time period, and can be revoked when the user logs out.
   * Once all of the access tokens expire (on all devices that are signed in to the same account), the user is logged out.
   */
  public async createAuthTokens(user: User): Promise<AuthTokens> {

    // get refresh token version from refreshTokenInfo db table
    const refreshTokenInfo: RefreshTokenInfo | null = await prisma.refreshTokenInfo.findUnique({
      where: { userId: user.id }
    });

    if (!refreshTokenInfo) {
      // should never get here if the User was created correctly and linked with RefreshTokenInfo
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.USER_NO_ASSOCIATED_REFRESH_TOKEN_INFO_ERROR);
    }
    
    const { refreshTokenVersion } = refreshTokenInfo;
    
    const refreshTokenClaims: RefreshTokenClaims = {
      userId: user.id,
      refreshTokenVersion: refreshTokenVersion
    };

    // for both tokens 
    // - hash the header and payload using the refresh token signing secret key to produce signature
    // - combine header, payload, and signature
    // - encode the token
    const refreshToken = jwt.sign(
      refreshTokenClaims,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        issuer: process.env.API_GATEWAY_ISSUER,
        audience: process.env.API_GATEWAY_AUDIENCE,
        expiresIn: AuthTokenService.REFRESH_TOKEN_EXPIRY_TIME_JWT_FORMATTED,
      }
    );

    const accessToken = AuthTokenService.createNewAccessToken(user);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }

  /***
   * Validates the access token to ensure that it was created and issued by this server, and is not expired.
   * If the access token is from this server and is expired, the refresh token is validated in the same way.
   * If either token is not created or issued by this server, then the user is unauthorized (unexpected behaviour).
   * If both are from this server and are both expired, then the user is unauthorized (expected behaviour - user login expired).
   * 
   * If access token is invalid, but refresh token is valid, a new access token will be created.
   * Returns AccessTokenClaims and new or current non-expired access token.
   * 
   * @returns AccessTokenClaims and the new or current access token (string) on successful authentication.
   * @throws HttpError on unsuccessful authentication.
   */
  public async checkAuthTokens(authTokens: AuthTokens): Promise<{
    claims: AccessTokenClaims,
    accessToken: string
  }> {
    const { accessToken, refreshToken } = authTokens;

    try {
      // verify access token (the signature and token expiration)

      // - parse the jwt token into header, payload, and token signature
      // - hash the header and payload using the token signing secret key
      // - if the hashed value from the header and payload values is equal to the token signature,
      //   then the jwt token is valid

      const accessTokenClaims = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as AccessTokenClaims;

      // succesfully authenticated
      return {
        claims: accessTokenClaims,
        accessToken: accessToken
      }
    }
    catch (error) {
      AuthTokenService.checkAndHandleJWTVerifyError(error);

      // continue if access token has valid signature but is expired
    }

    // --- if access token expired ---

    // verify refresh token (the signature and token expiration)

    let refreshTokenClaims: RefreshTokenClaims;

    try {
      refreshTokenClaims = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as RefreshTokenClaims;
    }
    catch (error) {
      AuthTokenService.checkAndHandleJWTVerifyError(error);

      // --- user login session has expired (refresh token expired) ---

      throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, AUTH_ERRORS.SESSION_EXPIRED_ERROR);
    }

    // check database to see if user is still allowed to be logged in
    const user = await this.userService.getUserById(refreshTokenClaims.userId);
    
    if (!user) {
      // general unauthorized error (should never get here if user account and refresh token were created/issued by this server)
      throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, HTTP_ERRORS.UNAUTHORIZED_ERROR);
    }

    // get refresh token version from refreshTokenInfo db table
    const refreshTokenInfo: RefreshTokenInfo | null = await prisma.refreshTokenInfo.findUnique({
      where: { userId: user.id }
    });

    if (!refreshTokenInfo) {
      // should never get here if the User was created correctly and linked with RefreshTokenInfo
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.USER_NO_ASSOCIATED_REFRESH_TOKEN_INFO_ERROR);
    }

    const { refreshTokenVersion: dbRefreshTokenVersion } = refreshTokenInfo;

    logger.info(`dbRefreshTokenVersion: ${dbRefreshTokenVersion}`);
    logger.info(`jwtRefreshTokenVersion: ${refreshTokenClaims.refreshTokenVersion}`);

    // compare the db refreshTokenVersion with the request refreshTokenVersion to check if the versions match
    
    // if they don't match, the user's session has expired (they logged out before their refresh token expired)
    if (dbRefreshTokenVersion !== refreshTokenClaims.refreshTokenVersion) {
      throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, AUTH_ERRORS.SESSION_EXPIRED_ERROR);
    }

    // create a new access token
    const newAccessToken = AuthTokenService.createNewAccessToken(user);

    const newAccessTokenClaims: AccessTokenClaims = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      apiServiceCallLimit: user.apiServiceCallLimit,
    };

    return {
      claims: newAccessTokenClaims,
      accessToken: newAccessToken
    }
  }

  // (For logout)
  /***
   * Invalidates all current refresh tokens (on all devices) 
   * for a user account with a matching user id.
   * A device will only be signed out once its access token expires (a few minutes) 
   * Takes a few minutes for logout to take effect on all devices
   */
  public async invalidateAllCurrentRefreshTokensWithUserId(userId: string): Promise<void> {
    
    const foundUser: User | null = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!foundUser) {
      throw new HttpError(HTTP_STATUS_CODES.NOT_FOUND, AUTH_ERRORS.USER_NOT_FOUND_WITH_ID_ERROR)
    }
  
    // increment the current refresh token version in RefreshTokenInfo entity with matching userId, 
    // which invalidates all refreshTokens associated with this user
    await prisma.refreshTokenInfo.update({
      where: { userId: foundUser.id },
      data: {
        refreshTokenVersion: {
          increment: 1
        }
      }
    });
  }

  // hashes the header and payload using the access token signing secret key
  private static createNewAccessToken(user: User) {

    const accessTokenClaims: AccessTokenClaims = {
      userId:     user.id,
      email:      user.email,
      userType:    user.userType,
      apiServiceCallLimit: user.apiServiceCallLimit,
    };

    const accessToken = jwt.sign(
      accessTokenClaims,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        issuer: process.env.API_GATEWAY_ISSUER,
        audience: process.env.API_GATEWAY_AUDIENCE,
        expiresIn: AuthTokenService.ACCESS_TOKEN_EXPIRY_TIME_JWT_FORMATTED,
      }
    );

    return accessToken;
  }

  private static checkAndHandleJWTVerifyError(error: unknown) {

    if (!(error instanceof Error)) {
      throw new HttpError(HTTP_STATUS_CODES.SERVER_ERROR, HTTP_ERRORS.SERVER_ERROR);
    }

    const errorMessage = error.message;

    // if the jwt token expired but has valid signature (expected behaviour)
    if (errorMessage === AuthTokenService.JWT_TOKEN_EXPIRED_MSG) {
      return;
    }
    // if any of these token errors occured - https://www.npmjs.com/package/jsonwebtoken#jsonwebtokenerror
    // notably invalid signature
    else if (error instanceof JsonWebTokenError) {
      throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, error.message);
    }
    else {
      logger.info(`internal server error while attempting to verify jwt - ${error.message}`);
      throw new HttpError(HTTP_STATUS_CODES.SERVER_ERROR, HTTP_ERRORS.SERVER_ERROR);
    }

    // if (error instanceof JsonWebTokenError) {
    //   throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, error.message);
    // }
    // // if the jwt token expired but has valid signature (expected behaviour)
    // else if (error instanceof TokenExpiredError) {
    //   return;
    // }
    // else {
    //   throw new HttpError(HTTP_STATUS_CODES.SERVER_ERROR, HTTP_ERRORS.SERVER_ERROR);
    // }
  }
}
