using System.ComponentModel.DataAnnotations;

namespace SmartVaultClient.Models.Account;

/// <summary>
/// Data model for a login form.
/// </summary>
public class Login
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}
