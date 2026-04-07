using Microsoft.VisualStudio.TestTools.UnitTesting;
using Win32ThemeStudio.Themes;

namespace Win32ThemeStudio.Themes.Tests;

[TestClass]
public class ThemePresetSerializerTests
{
    [TestMethod]
    public void SerializeDeserialize_PreservesBackgroundMetadata()
    {
        var preset = new ThemePreset
        {
            FormatVersion = ThemePreset.CurrentFormatVersion,
            Theme = new ThemePresetDescriptor
            {
                Id = "signal-night",
                DisplayName = "Signal Night",
                Appearance = ThemeAppearance.Dark,
                Category = "Office",
                AccentFamily = "Amber",
                Description = "Dark operations preset with amber accents.",
                Tags = ["custom", "signal"],
                SourceThemeUri = "theme-preset://custom/signal-night"
            },
            Background = new ThemeBackgroundPreset
            {
                Mode = "gradient",
                PrimaryColor = "#FF13171C",
                SecondaryColor = "#FF1D232C",
                SizingMode = "fill",
                TintColor = "#40171C23",
                Opacity = 0.92,
                BlurEnabled = true
            },
            PaletteValues = BuildCompletePalette()
        };

        var json = ThemePresetSerializer.Serialize(preset);
        var roundTrip = ThemePresetSerializer.Deserialize(json);

        Assert.IsNotNull(roundTrip.Background);
        Assert.AreEqual("gradient", roundTrip.Background.Mode);
        Assert.AreEqual("#FF13171C", roundTrip.Background.PrimaryColor);
        Assert.AreEqual("#FF1D232C", roundTrip.Background.SecondaryColor);
        Assert.AreEqual("fill", roundTrip.Background.SizingMode);
        Assert.AreEqual("#40171C23", roundTrip.Background.TintColor);
        Assert.AreEqual(0.92, roundTrip.Background.Opacity, 0.0001);
        Assert.IsTrue(roundTrip.Background.BlurEnabled);
    }

    [TestMethod]
    public void Deserialize_WithoutBackground_RemainsSupported()
    {
                var json = """
{
    "formatVersion": "1.0",
    "theme": {
        "id": "signal-night",
        "displayName": "Signal Night",
        "appearance": "dark",
        "category": "Office",
        "accentFamily": "Amber",
        "description": "Dark operations preset with amber accents.",
        "tags": ["custom", "signal"],
        "sourceThemeUri": "theme-preset://custom/signal-night"
    },
    "paletteValues": {
        "Brush.Background": "#FF13171C",
        "Brush.Surface": "#FF1D232C",
        "Brush.SurfaceAlt": "#FF252C36",
        "Brush.WindowGlass": "#CC171C23",
        "Brush.TransparentLayer": "#66252C36",
        "Brush.TextPrimary": "#FFE8EDF4",
        "Brush.TextSecondary": "#FF9CA9B8",
        "Brush.TextDisabled": "#FF6D7986",
        "Brush.Accent": "#FFF5AE42",
        "Brush.AccentSecondary": "#FFFFC968",
        "Brush.AccentTertiary": "#FF826C41",
        "Brush.AccentHover": "#FFF8BF63",
        "Brush.AccentPressed": "#FFD89524",
        "Brush.AccentForeground": "#FF251907",
        "Brush.SelectionFill": "#40F5AE42",
        "Brush.FocusStroke": "#FFFFC968",
        "Brush.Border": "#FF323A45",
        "Brush.ScrollbarThumb": "#FF4D5866",
        "Brush.TooltipBackground": "#FF1C2028",
        "Brush.MenuBackground": "#FF181C22",
        "Brush.MenuHover": "#FF252C36",
        "Brush.DisabledSurface": "#FF1C2026",
        "Brush.Danger": "#FFC97A74",
        "Brush.DangerForeground": "#FF260F0D",
        "Brush.Warning": "#FFD1A255",
        "Brush.WarningForeground": "#FF31220A",
        "Brush.Success": "#FF6CA288",
        "Brush.SuccessForeground": "#FF102119",
        "Brush.Shadow": "#48070A10"
    }
}
""";

        var preset = ThemePresetSerializer.Deserialize(json);

        Assert.IsNotNull(preset);
        Assert.IsNull(preset.Background);
        Assert.AreEqual("signal-night", preset.Theme.Id);
        Assert.AreEqual("#FF13171C", preset.PaletteValues["Brush.Background"]);
    }

    private static Dictionary<string, string> BuildCompletePalette()
    {
        return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Brush.Background"] = "#FF13171C",
            ["Brush.Surface"] = "#FF1D232C",
            ["Brush.SurfaceAlt"] = "#FF252C36",
            ["Brush.WindowGlass"] = "#CC171C23",
            ["Brush.TransparentLayer"] = "#66252C36",
            ["Brush.TextPrimary"] = "#FFE8EDF4",
            ["Brush.TextSecondary"] = "#FF9CA9B8",
            ["Brush.TextDisabled"] = "#FF6D7986",
            ["Brush.Accent"] = "#FFF5AE42",
            ["Brush.AccentSecondary"] = "#FFFFC968",
            ["Brush.AccentTertiary"] = "#FF826C41",
            ["Brush.AccentHover"] = "#FFF8BF63",
            ["Brush.AccentPressed"] = "#FFD89524",
            ["Brush.AccentForeground"] = "#FF251907",
            ["Brush.SelectionFill"] = "#40F5AE42",
            ["Brush.FocusStroke"] = "#FFFFC968",
            ["Brush.Border"] = "#FF323A45",
            ["Brush.ScrollbarThumb"] = "#FF4D5866",
            ["Brush.TooltipBackground"] = "#FF1C2028",
            ["Brush.MenuBackground"] = "#FF181C22",
            ["Brush.MenuHover"] = "#FF252C36",
            ["Brush.DisabledSurface"] = "#FF1C2026",
            ["Brush.Danger"] = "#FFC97A74",
            ["Brush.DangerForeground"] = "#FF260F0D",
            ["Brush.Warning"] = "#FFD1A255",
            ["Brush.WarningForeground"] = "#FF31220A",
            ["Brush.Success"] = "#FF6CA288",
            ["Brush.SuccessForeground"] = "#FF102119",
            ["Brush.Shadow"] = "#48070A10"
        };
    }
}
