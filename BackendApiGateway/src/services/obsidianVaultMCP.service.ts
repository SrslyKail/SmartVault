import axios from 'axios'
import * as signalR from "@microsoft/signalr";
//todo: store obsVaultMcpTokensUsed in redis storage with the userId for faster access 

//todo: check current num tokens used on every request to obsidian vault service
// obsVaultMcpTokensUsed: number;

export class ObsidianVaultMCPService {
  public static readonly SERVICE_API_CALL_LIMIT_REGULAR_USER = 20;
  public static readonly INITIAL_NUM_SERVICE_API_CALLS = 0;
  // private readonly MCP_URL = process.env.OBSIDIAN_MCP_SERVER
  
  public async getBotResponse(prompt: string) {

    try {
      const mcpResponse: string = await axios.post(process.env.OBSIDIAN_MCP_SERVER!,
        { message: prompt }
      );
      //todo later - add api key to authorization header

      // const botResponse = 

      return mcpResponse
    }
    catch (error) {
      console.error("UH OH BIG BAD BOO", error)
    }

  }

}
