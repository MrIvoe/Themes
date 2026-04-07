namespace Win32ThemeStudio.Themes;

public sealed class ThemePreset
{
    public const string CurrentFormatVersion = "1.0";

    public string FormatVersion { get; init; } = CurrentFormatVersion;

    public ThemePresetDescriptor Theme { get; init; } = new();

    public ThemeBackgroundPreset? Background { get; init; }

    public Dictionary<string, string> PaletteValues { get; init; } = new(StringComparer.OrdinalIgnoreCase);

    public ThemeDescriptor ToThemeDescriptor() => Theme.ToThemeDescriptor();

    public ThemePaletteSnapshot ToPaletteSnapshot() => new(PaletteValues);
}