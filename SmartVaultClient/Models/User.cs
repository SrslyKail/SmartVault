namespace SmartVaultClient.Models;

/// <summary>
/// Data model for a user.
/// </summary>
public class User
{
    public required string Id { get; set; }
    public required string Username { get; set; }
    public int TokenLimit { get; set; }
    public int TokensUsed { get; set; }
    public bool IsAdmin { get; set; }

    /// <summary>
    /// Token used for JWT authentication.
    /// </summary>
    public string? Token { get; set; }

    /// <summary>
    /// Just used to show a loading bar when deleting a user.
    /// </summary>
    public bool IsDeleting { get; set; }
}
