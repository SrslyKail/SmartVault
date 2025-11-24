import type { ObsidianVaultMCPService } from "../services/obsidianVaultMCP.service.ts";
import type { Request, Response } from 'express'
import type { ObsidianVaultMCPValidator } from "../validation/mcpPrompt/mcpPrompt.validator.ts";
import { logger } from "../services/logger.service.ts";
import { HttpError } from "../errors/httpError.ts";
import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import type { APICallLimiter } from "../lib/apiCallLimit.ts";
import { API_SERVICE_USAGE_MESSAGES } from "../lang/en.ts";
import type { UserApiUsageService } from "../services/userApiUsageService.service.ts";
import { AuthController } from "./auth.controller.ts";

export class ObsVaultController {
  
    private readonly obsVaultService: ObsidianVaultMCPService;
    private readonly obsVaultMcpPromptValidator: ObsidianVaultMCPValidator;
    private readonly apiCallLimiter: APICallLimiter;
    private readonly userApiUsageService: UserApiUsageService;
    
    constructor(
      obsVaultService: ObsidianVaultMCPService,
      mcpPromptValidator: ObsidianVaultMCPValidator,
      apiCallLimiter: APICallLimiter,
      userApiUsageService: UserApiUsageService
    ) {
      this.obsVaultService            = obsVaultService;
      this.obsVaultMcpPromptValidator = mcpPromptValidator;
      this.apiCallLimiter             = apiCallLimiter;
      this.userApiUsageService        = userApiUsageService;
    }

    public async createPromptAndGetResponse(req: Request, res: Response)
    {
      try {
        const accessTokenClaims = AuthController.tryToExtractAccessTokenClaimsFromReq(req);

        // Increment api call usage count (before checking num service calls made)
        await this.userApiUsageService.incrementNumberOfApiCallsUsed(accessTokenClaims.userId);

        // Check if api call limit exceeded first. 
        // If it is exceeded, still allow the request to go through, 
        // but append to the response a warning message
        const apiCallLimitExceeded = await this.apiCallLimiter.isApiCallLimitExceeded(req);

        const apiCallLimitExceededMessage = apiCallLimitExceeded
          ? API_SERVICE_USAGE_MESSAGES.EXCEEDED_CALL_LIMIT_WARNING
          : null;

        const { prompt } = req.body;

        this.obsVaultMcpPromptValidator.tryValidateMcpPrompt(prompt);

        const promptResponse = await this.obsVaultService.createPromptAndGetResponse(prompt);

        // apiCallLimitExceeded, apiCallLimitExceededMessage pair is either:
        // (false and null), or (true and string)
        const resData = {
          promptResponse: promptResponse,
          apiCallLimitExceeded: apiCallLimitExceeded, 
          apiCallLimitExceededMessage: apiCallLimitExceededMessage
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
}
