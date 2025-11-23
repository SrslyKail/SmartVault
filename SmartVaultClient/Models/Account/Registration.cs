using System.ComponentModel.DataAnnotations;

namespace SmartVaultClient.Models.Account;

/// <summary>
/// Request DTO model for signup endpoint.
/// </summary>
public class RegistrationRequestDTO
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    [MinLength(6, ErrorMessage = "Passwords must have 6 characters or more")]
    public string Password { get; set; } = "";
}


/// <summary>
/// Response DTO model for signup endpoint.
/// </summary>
public class RegistrationResponseDTO
{
    [Required]
    public string Message { get; set; } = "";
}
