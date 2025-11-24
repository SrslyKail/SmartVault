import { HTTP_STATUS_CODES } from "../../constants/httpResponse.ts";
import { HttpError } from "../../errors/httpError.ts";
import { OBS_MCP_PROMPT_ERRORS } from "../../lang/en.ts";

export class ObsidianVaultMCPValidator {
  constructor() {}

  //todo: use joi schema evaluation instead
  public tryValidateMcpPrompt(prompt: string) {
    if (!prompt) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, OBS_MCP_PROMPT_ERRORS.EMPTY_PROMPT_ERROR);
    }
    const promptOnlyWhiteSpace = prompt.trim().length === 0;

    if (promptOnlyWhiteSpace) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, OBS_MCP_PROMPT_ERRORS.EMPTY_PROMPT_ERROR);
    }
  }
}
