using System.Text.Json;

namespace TabPlayer.Hubs;
    public class LowerCaseNamingPolicy : JsonNamingPolicy {
        public override string ConvertName(string name) {
            if (string.IsNullOrEmpty(name) || !char.IsUpper(name[0]))
                return name;

            return name.ToLower();
        }
    }


    public class Int32Converter : System.Text.Json.Serialization.JsonConverter<int> {
        public override int Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
            if (reader.TokenType == JsonTokenType.String) {
                string? stringValue = reader.GetString();
                if (int.TryParse(stringValue, out int value)) {
                    return value;
                }
            }
            else if (reader.TokenType == JsonTokenType.Number) {
                return reader.GetInt32();
            }

            throw new System.Text.Json.JsonException();
        }

        public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options) {
            writer.WriteNumberValue(value);
        }
    }

