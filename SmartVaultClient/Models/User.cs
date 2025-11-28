using System.Text.Json.Serialization;

namespace SmartVaultClient.Models;

/// <summary>
/// Data model for a user.
/// </summary>
public class User
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public UserType UserType { get; set; }
    public int ApiServiceCallLimit { get; set; }

    // /// <summary>
    // /// Just used to show a loading bar when deleting a user.
    // /// </summary>
    // public bool IsDeleting { get; set; }
}

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum UserType
    {
        REG_USER,
        ADMIN
    }
