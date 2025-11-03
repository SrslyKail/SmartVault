//todo: store obsVaultMcpTokensUsed in redis storage with the userId for faster access 

//todo: check current num tokens used on every request to obsidian vault service
// obsVaultMcpTokensUsed: number;

export class ObsidianVaultMCPService {
  public static readonly SERVICE_API_CALL_LIMIT_REGULAR_USER = 20;
  public static readonly INITIAL_NUM_SERVICE_API_CALLS = 0;
}
