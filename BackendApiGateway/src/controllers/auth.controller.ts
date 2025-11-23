import type { CookieOptions, NextFunction, Request, Response } from 'express'
import type { AuthTokenService } from '../services/authToken.service.ts';
import { HttpError } from '../errors/httpError.ts';
import { logger } from '../services/logger.service.ts';
import type { UserService } from '../services/user.service.ts';
import type { AccessTokenClaims, AuthTokens } from '../types/index.ts';
import { HTTP_STATUS_CODES } from '../constants/httpResponse.ts';
import type { UserValidator } from '../validation/user/user.validator.ts';
import { AUTH_ERRORS, AUTH_MESSAGES } from '../lang/en.ts';
import type { User } from '../data/models/generated/prisma/client.ts';
import { ACCESS_TOKEN_COOKIE_KEY, REFRESH_TOKEN_COOKIE_KEY } from '../constants/authTokens.ts';
import { isProd } from '../constants/isProd.ts';

export class AuthController {

  //jwt token generator and issuer
  private readonly authTokenService: AuthTokenService;
  private readonly userService:      UserService;
  private readonly userValidator:    UserValidator;

  constructor(
    authTokenService: AuthTokenService,
    userService:      UserService,
    userValidator:    UserValidator
  ) {
    this.authTokenService = authTokenService;
    this.userService      = userService;
    this.userValidator    = userValidator;
  }

  public async login(req: Request, res: Response) {
    try {
      const { email, password, } = req.body;

      //TODO: add login validation here
      
      const user: User = await this.userService.tryFindUserByEmailAndPassword(email, password);

      const authTokens: AuthTokens = await this.authTokenService.createAuthTokens(user);

      logger.info(
        `User signed in with: ${user.id}, email: ${email}`
      );

      AuthController.storeAuthTokensInHttpOnlyCookie(res, authTokens);

      const resData = {
        message: AUTH_MESSAGES.SUCCESSFUL_LOGIN
      }

      res.status(HTTP_STATUS_CODES.OK).json(resData);
    }
    catch (error) {
      const { code, message } = HttpError.extractErrorCodeAndMessage(error);
      logger.error(
        `Email: ${req.body.email}, hashed password: ${req.body.password}, ${code}, ${message}`
      );
      const resData = { message: message };

      res.status(code).json(resData);
    }
  }

  public async signup(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      //todo: validate email and password using joi
      this.userValidator.tryValidateEmailAndPassword(email, password);

      const existingUser = await this.userService.findUserByEmail(email);

      // if the email is already associated with an existing user
      if (existingUser) {
        throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.EMAIL_ALREADY_EXISTS_ERROR);
      }
      
      const newUser: User = await this.userService.createNewUser(email, password);

      const authTokens: AuthTokens = await this.authTokenService.createAuthTokens(newUser);

      logger.info(
        `User created with id: ${newUser.id}, email: ${newUser.email}, hashed password: ${newUser.hashedPassword}`
      );

      // AuthController.storeAuthTokensInHttpOnlyCookie(res, authTokens);

      const resData = {
        message: AUTH_MESSAGES.SUCCESSFUL_SIGNUP
      }

      res.status(HTTP_STATUS_CODES.CREATED).json(resData);
    }
    catch (error) {
      const { code, message } = HttpError.extractErrorCodeAndMessage(error);
      logger.error(
        `Email: ${req.body.email}, Password: ${req.body.password}, ${code}, ${message}`
      );
      const resData = { message: message };

      res.status(code).json(resData);
    }
  }

  /***
   * Controller method for handling the checking of authenticated requests. 
   * Call this as the first handler on every endpoint that requires auth
   */
  public async authenticate(req: Request, res: Response, next: NextFunction) {

    try {
      const reqAccessToken = req.cookies[ACCESS_TOKEN_COOKIE_KEY];
      const reqRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY];

      if (!reqAccessToken || !reqRefreshToken) {
        throw new HttpError(HTTP_STATUS_CODES.UNAUTHORIZED, AUTH_ERRORS.MISSING_AUTH_TOKENS_ERROR);
      }

      const authTokens: AuthTokens = {
        accessToken: reqAccessToken,
        refreshToken: reqRefreshToken
      };

      const { claims, accessToken } = await this.authTokenService.checkAuthTokens(authTokens);

      // Attach user data to the request object for use in subsequent request handlers
      req.accessTokenClaims = claims;
      req.accessToken = accessToken;

      // go to next handler
      next();
    }
    catch (error) {
      const { code, message } = HttpError.extractErrorCodeAndMessage(error);
      logger.error(
        `code: ${code}, message: ${message}`
      );
      const resData = { message: message };

      res.status(code).json(resData);
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const accessTokenClaims = AuthController.tryToExtractAccessTokenClaimsFromReq(req);

      const userId = accessTokenClaims.userId;

      await this.authTokenService.invalidateAllCurrentRefreshTokensWithUserId(userId);

      const resData = {
        message: AUTH_MESSAGES.SUCCESSFUL_LOGOUT
      };

      res.status(HTTP_STATUS_CODES.OK).json(resData);
    }
    catch (error) {
      const { code, message } = HttpError.extractErrorCodeAndMessage(error);
      logger.error(
        `code: ${code}, message: ${message}`
      );
      const resData = { message: message };

      res.status(code).json(resData);
    }
  }

  private static storeAuthTokensInHttpOnlyCookie(res: Response, authTokens: AuthTokens) {

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      domain: isProd ? `.${process.env.DOMAIN}` : "", //TODO
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
    };

    // Store the access token and refresh tokens in browser httpOnly cookie
    res.cookie(ACCESS_TOKEN_COOKIE_KEY, authTokens.accessToken, cookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE_KEY, authTokens.refreshToken, cookieOptions);
  }

  /***
   * Extracts the accessTokenClaims field from the Express Request object.
   * @throws HttpError if the req object does not contain accessTokenClaims
   */
  public static tryToExtractAccessTokenClaimsFromReq(req: Request): AccessTokenClaims {
    const accessTokenClaims = req.accessTokenClaims;

    if (!accessTokenClaims) {
      // might need different error msg for if trying to log out with no active login 
      // but this is fine for now
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.MISSING_AUTH_TOKENS_ERROR);
    }

    return accessTokenClaims;
  }
}
