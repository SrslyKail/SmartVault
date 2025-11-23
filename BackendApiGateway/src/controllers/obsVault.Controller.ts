import type { ObsidianVaultMCPService } from "../services/obsidianVaultMCP.service.ts";
import * as signalR from "@microsoft/signalr"
import type { Request, Response } from 'express'

export class ObsVaultController {
  
    private readonly obsVaultService: ObsidianVaultMCPService;
    
    constructor(obsVaultService: ObsidianVaultMCPService) {
      this.obsVaultService = obsVaultService
    }

    public async createNewPrompt(req: Request, res: Response)
    {
      try {
        const test = req.accessTokenClaims;
        test?.email
        
      }
      catch (error) {
        
      }
    }
}
