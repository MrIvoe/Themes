using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Win32ThemeStudio.Themes;

public static class ThemePresetSerializer
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public static ThemePreset ExportTheme(string themeName)
    {
        var descriptor = ThemeCatalog.GetTheme(themeName);
        var palette = ThemePaletteSnapshot.FromTheme(themeName);

        return CreatePreset(descriptor, palette);
    }

    public static ThemePreset CreatePreset(ThemeDescriptor descriptor, ThemePaletteSnapshot palette)
    {
        ArgumentNullException.ThrowIfNull(descriptor);
        ArgumentNullException.ThrowIfNull(palette);

        return new ThemePreset
        {
            FormatVersion = ThemePreset.CurrentFormatVersion,
            Theme = ThemePresetDescriptor.FromThemeDescriptor(descriptor),
            PaletteValues = palette.BrushValues.ToDictionary(static entry => entry.Key, static entry => entry.Value, StringComparer.OrdinalIgnoreCase)
        };
    }

    public static string Serialize(ThemePreset preset)
    {
        ArgumentNullException.ThrowIfNull(preset);

        return JsonSerializer.Serialize(NormalizePreset(preset), SerializerOptions);
    }

    public static ThemePreset Deserialize(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            throw new InvalidOperationException("Preset JSON cannot be empty.");
        }

        var preset = JsonSerializer.Deserialize<ThemePreset>(json, SerializerOptions)
            ?? throw new InvalidOperationException("Preset JSON could not be deserialized.");

        return NormalizePreset(preset);
    }

    public static void SaveToFile(ThemePreset preset, string filePath)
    {
        ArgumentNullException.ThrowIfNull(preset);
        ArgumentException.ThrowIfNullOrWhiteSpace(filePath);

        var directory = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        File.WriteAllText(filePath, Serialize(preset));
    }

    public static ThemePreset LoadFromFile(string filePath)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(filePath);

        return Deserialize(File.ReadAllText(filePath));
    }

    private static ThemePreset NormalizePreset(ThemePreset preset)
    {
        ArgumentNullException.ThrowIfNull(preset);

        var descriptor = preset.Theme.ToThemeDescriptor();
        var palette = preset.ToPaletteSnapshot();

        return new ThemePreset
        {
            FormatVersion = string.IsNullOrWhiteSpace(preset.FormatVersion)
                ? ThemePreset.CurrentFormatVersion
                : preset.FormatVersion,
            Theme = ThemePresetDescriptor.FromThemeDescriptor(descriptor),
            Background = preset.Background?.Normalize(),
            PaletteValues = palette.BrushValues.ToDictionary(static entry => entry.Key, static entry => entry.Value, StringComparer.OrdinalIgnoreCase)
        };
    }
}