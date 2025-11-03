import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import type { AccessTokenClaims, AuthTokens, RefreshTokenClaims, User } from "../types/index.ts";
import * as jwt from "jsonwebtoken";
import { HttpError } from "../errors/httpError.ts";
import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { AUTH_ERRORS, HTTP_ERRORS } from "../lang/en.ts";
import type { UserService } from "./user.service.ts";

export class AuthTokenService {

  private static readonly ACCESS_TOKEN_EXPIRY_TIME = "5min";
  private static readonly REFRESH_TOKEN_EXPIRY_TIME = "30d";

  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /***
   * Creates an access token with applicable claims from the user, and a refresh token with a user id.
   * The access token is short lived (minutes) and the refresh token is long (days).
   * Access token is recreated on the next request that requires authentication (short lived) if the refresh token is not expired.
   * Refresh token preserves the user's login time period, and can be revoked when the user logs out.
   * Once all of the access tokens expire (on all devices that are signed in to the same account), the user is logged out.
   */
  public async createAuthTokens(user: User): Promise<AuthTokens> {

    //TODO: get refresh token version from user refresh token db table
    const userRefreshTokenVersion = 1;//await prismaClient.
    
    const refreshTokenClaims: RefreshTokenClaims = {
      userId: user.id,
      refreshTokenVersion: userRefreshTokenVersion
    };

    // for both tokens - hash the header and payload using the refresh token signing secret key
    const refreshToken = jwt.sign(
      refreshTokenClaims,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        issuer: process.env.API_GATEWAY_ISSUER,
        audience: process.env.API_GATEWAY_AUDIENCE,
        expiresIn: AuthTokenService.REFRESH_TOKEN_EXPIRY_TIME,
      }
    );

    const accessToken = AuthTokenService.createNewAccessToken(user);

    //TODO: store user id and the current refresh token version in db (UserRefreshToken table)

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

    // verify access token (the signature and token expiration)
    try {

      // - parse the jwt token into header, paylaod, and token signature
      // - hash the header and payload using the token signing secret key
      // - if the hashed value from the header and payload values is equal to the token signature,
      //   then the jwt token is valid

      const accessTokenClaims = <AccessTokenClaims>(
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
      );

      // succesfully authenticated
      return {
        claims: accessTokenClaims,
        accessToken: accessToken
      }
    }
    catch (error) {
      AuthTokenService.checkAndHandleJWTVerifyError(error);
    }

    // --- if access token expired ---

    // verify refresh token (the signature and token expiration)
    try {
      const refreshTokenClaims = <RefreshTokenClaims>(
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!)
      );

      // check database to see if user is still allowed to be logged in
      const user = await this.userService.getUserById(refreshTokenClaims.userId);

      if (!user) {
        // general unauthorized error (should never get here if request came from client app)
        throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, HTTP_ERRORS.UNAUTHORIZED_ERROR);
      }

      //TODO: get refresh token version from user refresh token db table
      const userRefreshTokenVersion = 1;//await prismaClient.

      // check if the refresh token version matches
      // if they don't match, the user's session has expired
      if (userRefreshTokenVersion !== refreshTokenClaims.refreshTokenVersion) {
        throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, AUTH_ERRORS.SESSION_EXPIRED_ERROR);
      }

      // create a new access token
      const newAccessToken = AuthTokenService.createNewAccessToken(user);

      const newAccessTokenClaims: AccessTokenClaims = {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        obsVaultMcpTokenLimit: user.obsVaultMcpTokenLimit,
      };

      return {
        claims: newAccessTokenClaims,
        accessToken: newAccessToken
      }
    }
    catch (error) {
      AuthTokenService.checkAndHandleJWTVerifyError(error);
      throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, AUTH_ERRORS.SESSION_EXPIRED_ERROR);
    }
  }

  // (For logout)
  /***
   * Invalidates all current refresh tokens (on all devices) 
   * for a user account with a matching user id.
   * A device will only be signed out once its access token expires (a few minutes) 
   * Takes a few minutes for logout to take effect on all devices
   */
  public async invalidateAllCurrentRefreshTokensWithUserId(userId: string) {
    //TODO increment by 1 refreshTokenVersion (via set) after finding UserRefreshToken row with UserRefreshToken.userId == userId
    // await prismaClient.set(refreshTokenVersion: refreshTokenVersion) where
  }

  // hashes the header and payload using the access token signing secret key
  private static createNewAccessToken(user: User) {

    const accessTokenClaims: AccessTokenClaims = {
      userId:     user.id,
      email:      user.email,
      isAdmin:    user.isAdmin,
      obsVaultMcpTokenLimit: user.obsVaultMcpTokenLimit,
    };

    const accessToken = jwt.sign(
      accessTokenClaims,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        issuer: process.env.API_GATEWAY_ISSUER,
        audience: process.env.API_GATEWAY_AUDIENCE,
        expiresIn: AuthTokenService.ACCESS_TOKEN_EXPIRY_TIME,
      }
    );

    return accessToken;
  }

  private static checkAndHandleJWTVerifyError(error: unknown) {
    // if any of these token errors occured - https://www.npmjs.com/package/jsonwebtoken#jsonwebtokenerror
    // notably invalid signature
    if (error instanceof JsonWebTokenError) {
      throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, error.message);
    }
    // if the jwt token expired (expected behaviour)
    else if (error instanceof TokenExpiredError) {
      return;
    }
    else {
      throw new HttpError(HTTP_STATUS_CODES.SERVER_ERROR, HTTP_ERRORS.SERVER_ERROR);
    }
  }

}
