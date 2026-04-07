namespace Win32ThemeStudio.Themes;

public sealed class ThemeBackgroundPreset
{
    public string Mode { get; init; } = "solid";

    public string? PrimaryColor { get; init; }

    public string? SecondaryColor { get; init; }

    public string? ImageUri { get; init; }

    public string SizingMode { get; init; } = "fill";

    public string? TintColor { get; init; }

    public double Opacity { get; init; } = 1.0;

    public bool BlurEnabled { get; init; }

    public ThemeBackgroundPreset Normalize()
    {
        var normalizedMode = string.IsNullOrWhiteSpace(Mode) ? "solid" : Mode.Trim().ToLowerInvariant();
        var normalizedSizing = string.IsNullOrWhiteSpace(SizingMode) ? "fill" : SizingMode.Trim().ToLowerInvariant();
        var normalizedOpacity = Opacity;
        if (normalizedOpacity < 0.0)
        {
            normalizedOpacity = 0.0;
        }
        else if (normalizedOpacity > 1.0)
        {
            normalizedOpacity = 1.0;
        }

        return new ThemeBackgroundPreset
        {
            Mode = normalizedMode,
            PrimaryColor = string.IsNullOrWhiteSpace(PrimaryColor) ? null : PrimaryColor,
            SecondaryColor = string.IsNullOrWhiteSpace(SecondaryColor) ? null : SecondaryColor,
            ImageUri = string.IsNullOrWhiteSpace(ImageUri) ? null : ImageUri,
            SizingMode = normalizedSizing,
            TintColor = string.IsNullOrWhiteSpace(TintColor) ? null : TintColor,
            Opacity = normalizedOpacity,
            BlurEnabled = BlurEnabled
        };
    }
}
