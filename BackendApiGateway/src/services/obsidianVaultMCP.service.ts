import axios from 'axios'
import { HttpError } from '../errors/httpError.ts';
// import * as signalR from "@microsoft/signalr";

export class ObsidianVaultMCPService {

  // The key in axios response data for request error
  private static readonly ERROR_MESSAGE_KEY: string = "title";

  public constructor() {}

  public async createPromptAndGetResponse(prompt: string) {

    // TODO: check if tokens used has exceeded the maximum amount, if so, add rate limit warning to response but continue to provide services

    const chatEndpointUrl = `${process.env.OBSIDIAN_MCP_SERVER_DOMAIN!}/Chat`;

    try {
      const obsMcpPromptResponse = await axios.post(chatEndpointUrl,
        prompt,
        {
          headers: {
            "Content-Type": "application/json" // mcp server accepts raw string
          }
        }
        //todo later - add api key to authorization header (if time)
      );

      const promptResponseMessage = obsMcpPromptResponse.data;
      
      return promptResponseMessage;
    }
    catch (error) {
      // extract the error message from the microservice error chat endpoint response
      const { code, message } = HttpError.extractErrorCodeAndMessage(error, ObsidianVaultMCPService.ERROR_MESSAGE_KEY);
      throw new HttpError(code, message);
    }
  }
}
