using System.ComponentModel.DataAnnotations;

namespace SmartVaultClient.Models.Account;

/// <summary>
/// Data model for a registration form.
/// </summary>
public class Registration
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    [MinLength(6, ErrorMessage = "Passwords must have 6 characters or more")]
    public string Password { get; set; } = "";

    public override string ToString()
    {
        var strReturn = $"Email: {Email}\nPassword: {Password}";
        return strReturn;
    }
}
