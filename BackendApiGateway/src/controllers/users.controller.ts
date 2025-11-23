import type { User } from "../data/models/generated/prisma/client.ts";
import { UserService } from "../services/user.service.ts";
import type { AccessTokenClaims, GetUserResponse } from "../types/index.ts";
import { AuthTokenService } from "../services/authToken.service.ts";
import { logger } from "../services/logger.service.ts";
import { HttpError } from "../errors/httpError.ts";
import { AuthController } from "./auth.controller.ts";
import type { Request, Response } from 'express'
import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { AUTH_ERRORS } from "../lang/en.ts";

export class UsersController {

  private readonly userService: UserService;

  public constructor(userService: UserService) 
  {
    this.userService = userService;
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
        isAdmin: user.isAdmin,
        obsVaultMcpTokenLimit: user.obsVaultMcpTokenLimit,
        obsVaultMcpTokensUsed: user.obsVaultMcpTokensUsed,
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
}
