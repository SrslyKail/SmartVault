using System.ComponentModel.DataAnnotations;

namespace SmartVaultClient.Models.Account;

/// <summary>
/// Request DTO model for login endpoint.
/// </summary>
public class LoginRequestDTO
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}

/// <summary>
/// Response DTO model for login endpoint.
/// </summary>
public class LoginResponseDTO
{
    [Required]
    public string Message { get; set; } = "";
}
