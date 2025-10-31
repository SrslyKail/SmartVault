namespace SmartVaultClient.Models;

public class User
{
    public required string Id { get; set; }
    public required string Username { get; set; }
    public int TokenLimit { get; set; }
    public int TokensUsed { get; set; }
    public bool IsAdmin { get; set; }
    public string? Token { get; set; }
    public bool IsDeleting { get; set; }
}
