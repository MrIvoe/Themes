using System.Windows;

namespace Win32ThemeStudio.Themes;

public static class ThemeManager
{
    public static IReadOnlyDictionary<string, string> AvailableThemes => ThemeCatalog.ThemeUris;

    public static IReadOnlyDictionary<string, string> AvailableThemesById => ThemeCatalog.ThemeUrisById;

    public static IReadOnlyList<ThemeDescriptor> AvailableThemeDescriptors => ThemeCatalog.Themes;

    public static ResourceDictionary CreateBaseStylesDictionary()
    {
        return new ResourceDictionary
        {
            Source = ThemeResourceLocator.BaseResources
        };
    }

    public static ResourceDictionary CreateThemeDictionary(string themeNameOrId)
    {
        return CreateThemeDictionary(ThemeCatalog.GetTheme(themeNameOrId));
    }

    public static ResourceDictionary CreateThemeDictionary(ThemeDescriptor theme)
    {
        ArgumentNullException.ThrowIfNull(theme);

        var resourceDictionary = new ResourceDictionary
        {
            [ThemePaletteKeys.ThemeIsPaletteKey] = "True",
            [ThemePaletteKeys.ThemeDisplayNameKey] = theme.DisplayName,
            [ThemePaletteKeys.ThemeIdKey] = theme.Id
        };

        resourceDictionary.MergedDictionaries.Add(new ResourceDictionary
        {
            Source = new Uri(theme.ResourceUri, UriKind.Absolute)
        });

        return resourceDictionary;
    }

    public static ResourceDictionary CreateThemeDictionary(ThemePreset preset)
    {
        ArgumentNullException.ThrowIfNull(preset);

        var resourceDictionary = new ResourceDictionary
        {
            [ThemePaletteKeys.ThemeIsPaletteKey] = "True",
            [ThemePaletteKeys.ThemeDisplayNameKey] = preset.Theme.DisplayName,
            [ThemePaletteKeys.ThemeIdKey] = string.IsNullOrWhiteSpace(preset.Theme.Id)
                ? ThemeIds.CreateStableId(preset.Theme.DisplayName)
                : preset.Theme.Id
        };

        foreach (var (resourceKey, colorHex) in preset.ToPaletteSnapshot().BrushValues)
        {
            resourceDictionary[resourceKey] = ThemePaletteSnapshot.CreateBrush(colorHex);
        }

        return resourceDictionary;
    }

    public static ThemePreset ImportValidatedPresetJson(string json)
    {
        var preset = ThemePresetSerializer.Deserialize(json);
        ThemePresetValidator.EnsureValid(preset);
        return preset;
    }

    public static ThemePreset ImportValidatedPresetFile(string filePath)
    {
        var preset = ThemePresetSerializer.LoadFromFile(filePath);
        ThemePresetValidator.EnsureValid(preset);
        return preset;
    }

    public static void EnsureBaseStyles(Application application)
    {
        ArgumentNullException.ThrowIfNull(application);

        ThemeResourceLocator.EnsureBaseResources(application.Resources);
    }

    public static void InitializeApplicationTheme(string themeNameOrId)
    {
        var application = Application.Current
            ?? throw new InvalidOperationException("Application.Current is unavailable.");

        InitializeApplicationTheme(application, themeNameOrId);
    }

    public static void InitializeApplicationTheme(Application application, string themeNameOrId)
    {
        ArgumentNullException.ThrowIfNull(application);

        EnsureBaseStyles(application);
        ApplyTheme(application, themeNameOrId);
    }

    public static void InitializeApplicationTheme(ThemeDescriptor theme)
    {
        var application = Application.Current
            ?? throw new InvalidOperationException("Application.Current is unavailable.");

        InitializeApplicationTheme(application, theme);
    }

    public static void InitializeApplicationTheme(Application application, ThemeDescriptor theme)
    {
        ArgumentNullException.ThrowIfNull(application);
        ArgumentNullException.ThrowIfNull(theme);

        EnsureBaseStyles(application);
        ApplyTheme(application, theme);
    }

    public static void InitializeApplicationTheme(ThemePreset preset)
    {
        var application = Application.Current
            ?? throw new InvalidOperationException("Application.Current is unavailable.");

        InitializeApplicationTheme(application, preset);
    }

    public static void InitializeApplicationTheme(Application application, ThemePreset preset)
    {
        ArgumentNullException.ThrowIfNull(application);

        EnsureBaseStyles(application);
        ApplyTheme(application, preset);
    }

    public static ThemePreset InitializeApplicationThemeFromPresetJson(Application application, string json)
    {
        ArgumentNullException.ThrowIfNull(application);

        var preset = ImportValidatedPresetJson(json);
        InitializeApplicationTheme(application, preset);
        return preset;
    }

    public static ThemePreset InitializeApplicationThemeFromPresetJson(string json)
    {
        var application = Application.Current
            ?? throw new InvalidOperationException("Application.Current is unavailable.");

        return InitializeApplicationThemeFromPresetJson(application, json);
    }

    public static ThemePreset InitializeApplicationThemeFromPresetFile(Application application, string filePath)
    {
        ArgumentNullException.ThrowIfNull(application);

        var preset = ImportValidatedPresetFile(filePath);
        InitializeApplicationTheme(application, preset);
        return preset;
    }

    public static ThemePreset InitializeApplicationThemeFromPresetFile(string filePath)
    {
        var application = Application.Current
            ?? throw new InvalidOperationException("Application.Current is unavailable.");

        return InitializeApplicationThemeFromPresetFile(application, filePath);
    }

    public static void ApplyTheme(string themeNameOrId)
    {
        var app = Application.Current
            ?? throw new InvalidOperationException("Application.Current is unavailable.");

        ApplyTheme(app, themeNameOrId);
    }

    public static void ApplyTheme(Application application, string themeNameOrId)
    {
        ArgumentNullException.ThrowIfNull(application);

        ThemeResourceLocator.ReplaceThemeResources(application.Resources, CreateThemeDictionary(themeNameOrId));
    }

    public static void ApplyTheme(ThemeDescriptor theme)
    {
        var application = Application.Current
            ?? throw new InvalidOperationException("Application.Current is unavailable.");

        ApplyTheme(application, theme);
    }

    public static void ApplyTheme(Application application, ThemeDescriptor theme)
    {
        ArgumentNullException.ThrowIfNull(application);
        ArgumentNullException.ThrowIfNull(theme);

        ThemeResourceLocator.ReplaceThemeResources(application.Resources, CreateThemeDictionary(theme));
    }

    public static void ApplyTheme(ThemePreset preset)
    {
        var application = Application.Current
            ?? throw new InvalidOperationException("Application.Current is unavailable.");

        ApplyTheme(application, preset);
    }

    public static void ApplyTheme(Application application, ThemePreset preset)
    {
        ArgumentNullException.ThrowIfNull(application);
        ArgumentNullException.ThrowIfNull(preset);

        ThemeResourceLocator.ReplaceThemeResources(application.Resources, CreateThemeDictionary(preset));
    }
}
