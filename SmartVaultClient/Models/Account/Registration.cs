using System.ComponentModel.DataAnnotations;

namespace SmartVaultClient.Models.Account;

/// <summary>
/// Data model for a registration form.
/// </summary>
public class Registration
{
    [Required]
    public string Username { get; set; } = "";

    [Required]
    [MinLength(6, ErrorMessage = "Passwords must have 6 characters or more")]
    public string Password { get; set; } = "";
}
