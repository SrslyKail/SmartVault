namespace SmartVaultClient.Models.Chat
{
    public class ChatRequestDTO
    {
        public string Prompt { get; set; } = string.Empty;
    }

    public class ChatResponseDTO
    {
        public string PromptResponse { get; set; } = string.Empty;
        public bool ApiCallLimitExceeded { get; set; }
        public string? ApiCallLimitExceededMessage { get; set; }
    }
}
