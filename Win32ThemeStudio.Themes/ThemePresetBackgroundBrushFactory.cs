using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace Win32ThemeStudio.Themes;

public static class ThemePresetBackgroundBrushFactory
{
    public static Brush CreateBrush(ThemeBackgroundPreset background, string fallbackColorHex)
    {
        ArgumentNullException.ThrowIfNull(background);

        var normalized = background.Normalize();
        var fallbackColor = ParseColorOrFallback(fallbackColorHex, Colors.Black);

        Brush brush = normalized.Mode switch
        {
            "gradient" => CreateGradientBrush(normalized, fallbackColor),
            "image" => CreateImageBrush(normalized, fallbackColor),
            _ => CreateSolidBrush(normalized.PrimaryColor, normalized.TintColor, fallbackColor)
        };

        brush.Opacity = normalized.Opacity;
        if (brush.CanFreeze)
        {
            brush.Freeze();
        }

        return brush;
    }

    private static Brush CreateGradientBrush(ThemeBackgroundPreset background, Color fallbackColor)
    {
        var primary = ParseColorOrFallback(background.PrimaryColor, fallbackColor);
        var secondary = ParseColorOrFallback(background.SecondaryColor, primary);
        var tint = ParseOptionalColor(background.TintColor);

        if (tint is not null)
        {
            primary = BlendColors(primary, tint.Value);
            secondary = BlendColors(secondary, tint.Value);
        }

        return new LinearGradientBrush(primary, secondary, 135.0);
    }

    private static Brush CreateImageBrush(ThemeBackgroundPreset background, Color fallbackColor)
    {
        if (string.IsNullOrWhiteSpace(background.ImageUri))
        {
            return CreateSolidBrush(background.PrimaryColor, background.TintColor, fallbackColor);
        }

        try
        {
            var imageUri = Uri.TryCreate(background.ImageUri, UriKind.RelativeOrAbsolute, out var parsedUri)
                ? parsedUri
                : throw new InvalidOperationException("Image URI is invalid.");

            var bitmap = new BitmapImage();
            bitmap.BeginInit();
            bitmap.UriSource = imageUri;
            bitmap.CacheOption = BitmapCacheOption.OnLoad;
            bitmap.EndInit();

            var brush = new ImageBrush(bitmap)
            {
                Stretch = ParseStretch(background.SizingMode),
                AlignmentX = AlignmentX.Center,
                AlignmentY = AlignmentY.Center
            };

            if (string.Equals(background.SizingMode, "tile", StringComparison.OrdinalIgnoreCase))
            {
                brush.TileMode = TileMode.Tile;
                brush.ViewportUnits = BrushMappingMode.RelativeToBoundingBox;
                brush.Viewport = new System.Windows.Rect(0, 0, 0.25, 0.25);
            }

            return brush;
        }
        catch (Exception)
        {
            return CreateSolidBrush(background.PrimaryColor, background.TintColor, fallbackColor);
        }
    }

    private static Brush CreateSolidBrush(string? primaryColor, string? tintColor, Color fallbackColor)
    {
        var color = ParseColorOrFallback(primaryColor, fallbackColor);
        var tint = ParseOptionalColor(tintColor);
        if (tint is not null)
        {
            color = BlendColors(color, tint.Value);
        }

        return new SolidColorBrush(color);
    }

    private static Color ParseColorOrFallback(string? candidateColor, Color fallbackColor)
    {
        if (string.IsNullOrWhiteSpace(candidateColor))
        {
            return fallbackColor;
        }

        return ColorConverter.ConvertFromString(candidateColor) is Color color
            ? color
            : fallbackColor;
    }

    private static Color? ParseOptionalColor(string? candidateColor)
    {
        if (string.IsNullOrWhiteSpace(candidateColor))
        {
            return null;
        }

        return ColorConverter.ConvertFromString(candidateColor) is Color color
            ? color
            : null;
    }

    private static Color BlendColors(Color baseColor, Color tintColor)
    {
        var tintAlpha = tintColor.A / 255.0;
        byte Blend(byte baseChannel, byte tintChannel)
        {
            return (byte)Math.Round((baseChannel * (1.0 - tintAlpha)) + (tintChannel * tintAlpha));
        }

        return Color.FromArgb(
            0xFF,
            Blend(baseColor.R, tintColor.R),
            Blend(baseColor.G, tintColor.G),
            Blend(baseColor.B, tintColor.B));
    }

    private static Stretch ParseStretch(string? sizingMode)
    {
        if (string.IsNullOrWhiteSpace(sizingMode))
        {
            return Stretch.Fill;
        }

        return sizingMode.Trim().ToLowerInvariant() switch
        {
            "fit" => Stretch.Uniform,
            "stretch" => Stretch.Fill,
            "tile" => Stretch.None,
            "center" => Stretch.None,
            _ => Stretch.UniformToFill
        };
    }
}