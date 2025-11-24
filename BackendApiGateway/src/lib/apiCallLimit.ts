import type { Request } from "express";
import { AuthController } from "../controllers/auth.controller.ts";
import type { AccessTokenClaims } from "../types/index.ts";
import type { UserApiUsageService } from "../services/userApiUsageService.service.ts";


export class APICallLimiter {

  // all users for now but would have different limits for different user types
  public static readonly SERVICE_API_CALL_LIMIT_ALL_USERS = 20;

  public readonly userApiUsageService: UserApiUsageService;

  public constructor(
    userApiUsageService: UserApiUsageService
  ) {
    this.userApiUsageService = userApiUsageService;
  }
  
  /**
   * Checks the request object access token claims, to see if the api service call limit has been exceeded.
   * 
   * **Request must be AUTHENTICATED first**
   * 
   * Call this from one of the controller methods to check api call limits.
   * @param req express Request object.
   * @throws HttpError if the req object does not contain accessTokenClaims.
   */
  public isApiCallLimitExceeded = async (req: Request) => {
    const accessTokenClaims: AccessTokenClaims = AuthController.tryToExtractAccessTokenClaimsFromReq(req);
    const apiServiceCallLimit: number = accessTokenClaims.apiServiceCallLimit;
    
    const currentNumApiCallsUsed: number = 
      await this.userApiUsageService.getNumberOfApiCallsUsedByUserId(accessTokenClaims.userId);

    // compare current num api calls made to obsidian vault 
    // service to the limit value stored in the user's token
    return currentNumApiCallsUsed > apiServiceCallLimit;
  }
}
