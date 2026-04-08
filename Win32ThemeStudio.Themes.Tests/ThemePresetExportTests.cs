using Microsoft.VisualStudio.TestTools.UnitTesting;
using Win32ThemeStudio.Themes;

namespace Win32ThemeStudio.Themes.Tests;

[TestClass]
public class ThemePresetExportTests
{
    [TestMethod]
    public void CreatePreset_IncludesDefaultBackgroundMetadata()
    {
        var descriptor = new ThemeDescriptor(
            "signal-night",
            "Signal Night",
            "pack://application:,,,/Win32ThemeStudio.Themes;component/Themes/SignalNight.xaml",
            ThemeAppearance.Dark,
            "Office",
            "Amber",
            "Dark operations preset.",
            ["custom", "signal"]);

        var palette = new ThemePaletteSnapshot(ThemePresetTestData.CreateCompletePalette());
        var preset = ThemePresetSerializer.CreatePreset(descriptor, palette);

        Assert.IsNotNull(preset.Background);
        Assert.AreEqual("gradient", preset.Background.Mode);
        Assert.AreEqual("fill", preset.Background.SizingMode);
        Assert.IsFalse(string.IsNullOrWhiteSpace(preset.Background.PrimaryColor));
        Assert.IsFalse(string.IsNullOrWhiteSpace(preset.Background.SecondaryColor));
    }
}