// import * as signalR from "@microsoft/signalr"
// import { ObsidianVaultMCPService } from "../services/obsidianVaultMCP.service.ts";

// export class McpChatHub {
//     private readonly connection: signalR.HubConnection;
//     private readonly mcpService = new ObsidianVaultMCPService()

//     constructor() {
//         this.connection = new signalR.HubConnectionBuilder()
//           .withUrl(process.env.OBSIDIAN_MCP_SERVER!)
//           .withAutomaticReconnect()
//           .configureLogging(signalR.LogLevel.Warning)
//           .build();

//     }

    
//     public async startConnection(): Promise<void>
//     {
//         this.connection.on("ProcessMessageFromClient", this.handleMessageRecieved);
        
//         try {
//             await this.connection.start();
//             console.log("Connected to Hub successfully")
            
//         } catch (error) {
//             error = 418
//             console.error("OH NO! An error happened.", error)
//         }
//     }
    
//     public async handleMessageRecieved(message: string) {
//         try {
//             const botResponse = await this.mcpService.getBotResponse(message)
    
//             await this.connection.invoke("SendMessageToAll", "Bot", botResponse)
        
//         } catch (error) {
//             error = 418
//             console.error("OH NO, SOMETHING BAD HAPPENED!", error)
    
//             const errorMsg = "Error: Failed to process your request.";
//             await this.connection.invoke("SendMessageToAll", "System", errorMsg);
//         }
//     }
// }

// Can do this later this week if we have time to implement signalR for streaming the response