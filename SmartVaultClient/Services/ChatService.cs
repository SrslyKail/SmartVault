using Microsoft.AspNetCore.Components;
using SmartVaultClient.Models;
using SmartVaultClient.Models.Account;
using SmartVaultClient.Models.Chat;

namespace SmartVaultClient.Services;

public interface IChatService
{
    Task Initialize();
    Task<ChatResponseDTO?> ChatAndGetResponse(ChatRequestDTO model);
}

public class ChatService(IHttpService httpService) : IChatService
{
    private readonly IHttpService _httpService = httpService;
  public async Task Initialize()
  {}

  public async Task<ChatResponseDTO?> ChatAndGetResponse(ChatRequestDTO model)
  {
      var response = await _httpService.Post<ChatResponseDTO>("/api/obs-vault/chat", model);
      return response;
  }
}