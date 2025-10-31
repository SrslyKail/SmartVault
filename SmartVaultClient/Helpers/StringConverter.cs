using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartVaultClient.Helpers;

/// <summary>
/// Custom JSON converter that converts integers to strings.
/// This allows the client to work with a backend that uses either integer IDs and string IDs
/// </summary>
public class StringConverter : JsonConverter<string>
{
    public override string Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        // deserialize numbers as strings.
        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.GetInt32().ToString();
        }
        else if (reader.TokenType == JsonTokenType.String)
        {
            return reader.GetString() ?? "";
        }

        throw new JsonException();
    }

    public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value);
    }
}
