import type { User } from "../data/models/generated/prisma/client.ts";
import { UserService } from "../services/user.service.ts";
import type { AccessTokenClaims, GetUserResponse, UpdateUserRequestDTO } from "../types/index.ts";
import { AuthTokenService } from "../services/authToken.service.ts";
import { logger } from "../services/logger.service.ts";
import { HttpError } from "../errors/httpError.ts";
import { AuthController } from "./auth.controller.ts";
import type { Request, Response } from 'express'
import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { AUTH_ERRORS, USER_ERRORS, USER_MESSAGES } from "../lang/en.ts";
import { z } from "zod";
import { UpdateUserSchema } from "../validation/user/user.validationSchema.ts";

export class UsersController {

  private readonly userService: UserService;
  private readonly authTokenService: AuthTokenService;

  public constructor(
    userService: UserService,
    authTokenService: AuthTokenService
  ) 
  {
    this.userService = userService;
    this.authTokenService = authTokenService;
  }

  public async getCurrentUser(req: Request, res: Response) {
    try {
      const accessTokenClaims: AccessTokenClaims = AuthController.tryToExtractAccessTokenClaimsFromReq(req);
      
      // get user id from accessTokenClaims
      const userId = accessTokenClaims.userId;
      
      const user: User | null = await this.userService.getUserById(userId);

      if (!user) {
        throw new HttpError(HTTP_STATUS_CODES.NOT_FOUND, AUTH_ERRORS.USER_NOT_FOUND_WITH_ID_ERROR);
      }

      // remove the hashed password from the user response
      const userResDto: GetUserResponse = {
        id: user.id,
        email: user.email,
        userType: user.userType,
        apiServiceCallLimit: user.apiServiceCallLimit,
      }
      res.status(HTTP_STATUS_CODES.OK).json(userResDto);
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

  public async updateCurrentUser(req: Request, res: Response) {
    try {
      const accessTokenClaims: AccessTokenClaims = AuthController.tryToExtractAccessTokenClaimsFromReq(req);
      const userId = accessTokenClaims.userId;
      await this.tryPatchUpdateUser(req, res, userId);
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

  // === Should require ADMIN type user authorization ===
  public async updateUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;

      if (!userId) {
        throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, USER_ERRORS.MISSING_USER_ID);
      }

      await this.tryPatchUpdateUser(req, res, userId);
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

  private async tryPatchUpdateUser(req: Request, res: Response, userId: string) {
    // try {
      // const accessTokenClaims: AccessTokenClaims = AuthController.tryToExtractAccessTokenClaimsFromReq(req);

      const updateUserDTO = req.body;

      const parseUpdateUserResult = UpdateUserSchema.safeParse(updateUserDTO);

      if (!parseUpdateUserResult.success) {
        const errorMsgs = parseUpdateUserResult.error.issues.map(err => err.message);;
        const errorMsgsString = JSON.stringify(errorMsgs);

        throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, errorMsgsString);
      }

      const updateUserValues: UpdateUserRequestDTO = {
        id: userId,
        ...parseUpdateUserResult.data
      }

      const updatedUser = await this.userService.updateUser(updateUserValues);

      // make user have to sign in again after access token expires (short period of time)
      await this.authTokenService.invalidateAllCurrentRefreshTokensWithUserId(updatedUser.id);

      const resData = updatedUser;

      res.status(HTTP_STATUS_CODES.OK).json(resData);
    // }
    // catch (error) {
    //   const { code, message } = HttpError.extractErrorCodeAndMessage(error);
    //   logger.error(
    //     `code: ${code}, message: ${message}`
    //   );
    //   const resData = { message: message };

    //   res.status(code).json(resData);
    // }
  }

  public async deleteUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;

      if (!userId) {
        throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, USER_ERRORS.MISSING_USER_ID);
      }

      await this.userService.deleteUserWithId(userId);

      const resData = {
        message: `${USER_MESSAGES.DELETED_USER} ${userId}`
      }

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
}
