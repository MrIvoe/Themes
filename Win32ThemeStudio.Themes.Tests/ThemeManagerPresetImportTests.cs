using Microsoft.VisualStudio.TestTools.UnitTesting;
using Win32ThemeStudio.Themes;

namespace Win32ThemeStudio.Themes.Tests;

[TestClass]
public class ThemeManagerPresetImportTests
{
    [TestMethod]
    public void ImportValidatedPresetJson_ValidPreset_ReturnsPreset()
    {
        var json = ThemePresetSerializer.Serialize(ThemePresetTestData.CreateValidPreset());

        var preset = ThemeManager.ImportValidatedPresetJson(json);

        Assert.AreEqual("signal-night", preset.Theme.Id);
        Assert.IsNotNull(preset.Background);
    }

    [TestMethod]
    public void ImportValidatedPresetJson_InvalidPreset_Throws()
    {
        var json = ThemePresetSerializer.Serialize(ThemePresetTestData.CreateValidPreset())
            .Replace("\"Brush.Accent\": \"#FFF5AE42\",\r\n", string.Empty, StringComparison.Ordinal);

        var exception = Assert.ThrowsException<InvalidOperationException>(() => ThemeManager.ImportValidatedPresetJson(json));

        StringAssert.Contains(exception.Message, ThemePaletteKeys.Accent);
    }
}