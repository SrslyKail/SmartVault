import type { ObsidianVaultMCPService } from "../services/obsidianVaultMCP.service.ts";
import type { Request, Response } from 'express'
import type { ObsidianVaultMCPValidator } from "../validation/mcpPrompt/mcpPrompt.validator.ts";
import { logger } from "../services/logger.service.ts";
import { HttpError } from "../errors/httpError.ts";
import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import type { APICallLimiter } from "../lib/apiCallLimit.ts";
import { API_CALL_LIMIT_MESSAGES } from "../lang/en.ts";

export class ObsVaultController {
  
    private readonly obsVaultService: ObsidianVaultMCPService;
    private readonly obsVaultMcpPromptValidator: ObsidianVaultMCPValidator;
    private readonly apiCallLimiter: APICallLimiter;
    
    constructor(
      obsVaultService: ObsidianVaultMCPService,
      mcpPromptValidator: ObsidianVaultMCPValidator,
      apiCallLimiter: APICallLimiter
    ) {
      this.obsVaultService            = obsVaultService;
      this.obsVaultMcpPromptValidator = mcpPromptValidator;
      this.apiCallLimiter             = apiCallLimiter;
    }

    public async createPromptAndGetResponse(req: Request, res: Response)
    {
      try {
        // Check if api call limit exceeded first. 
        // If it is exceeded, still allow the request to go through, 
        // but append to the response a warning message
        const apiCallLimitExceeded = this.apiCallLimiter.isApiCallLimitExceeded(req)//todo: await this

        const apiCallLimitExceededMessage = apiCallLimitExceeded
          ? API_CALL_LIMIT_MESSAGES.EXCEEDED_LIMIT_WARNING
          : null;

        const { prompt } = req.body;

        this.obsVaultMcpPromptValidator.tryValidateMcpPrompt(prompt);

        const promptResponse = await this.obsVaultService.createPromptAndGetResponse(prompt);

        const resData = {
          promptResponse: promptResponse,
          apiCallLimitExceeded: apiCallLimitExceeded, // false or true
          apiCallLimitExceededMessage: apiCallLimitExceededMessage // null or string
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
