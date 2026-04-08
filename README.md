# Win32ThemeStudio

A reusable WPF theme repository for Windows apps, with 20 ready-to-use palettes, runtime theme switching, filterable theme metadata, and package-friendly bootstrap APIs.

## Included Theme Families

1. Amber Terminal
2. Arctic Glass
3. Aurora Light
4. Brass Steampunk
5. Copper Foundry
6. Emerald Ledger
7. Forest Organic
8. Graphite Office
9. Harbor Blue
10. Ivory Bureau
11. Mono Minimal
12. Neon Cyberpunk
13. Nocturne Dark
14. Nova Futuristic
15. Olive Terminal
16. Pop Colorburst
17. Rose Paper
18. Storm Steel
19. Sunset Retro
20. Tape Lo-Fi

## What Is Themed

- Window and transparent glass-like background layers
- Buttons and hover/pressed states
- Tooltips
- Menus and menu item highlight state
- Text and input surfaces
- Border and elevation-friendly surfaces

## Project Structure

- `Win32ThemeStudio.Themes` - reusable theme library
- `Win32ThemeStudio.Demo` - preview application with runtime theme switcher
- `Win32ThemeStudio.BootstrapperSample` - sample third-party host app using the public theme bootstrap API

## Usage

1. Add a reference to `Win32ThemeStudio.Themes`.
2. Initialize the application theme once during startup.
3. Switch palettes at runtime with a stable theme id, a `ThemeDescriptor`, or a preset.

### Recommended App Startup

```csharp
using System.Windows;
using Win32ThemeStudio.Themes;

public partial class App : Application
{
	protected override void OnStartup(StartupEventArgs e)
	{
		ThemeManager.InitializeApplicationTheme(this, ThemeCatalog.DefaultLightTheme);
		base.OnStartup(e);
	}
}
```

For direct resource-dictionary control, the library also exposes a package-style locator similar to mature WPF theme toolkits:

```csharp
ThemeResourceLocator.EnsureBaseResources(Application.Current.Resources);
ThemeResourceLocator.SetTheme(Application.Current.Resources, ThemeCatalog.DefaultDarkThemeId);
```

### Theme Discovery And Filtering

The library now exposes metadata so importing apps can present only the themes that fit a specific use case:

```csharp
var darkThemes = ThemeCatalog.GetThemesByAppearance(ThemeAppearance.Dark);
var retroThemes = ThemeCatalog.GetThemesByCategory(ThemeCategories.Retro);
var terminalThemes = ThemeCatalog.GetThemesByCategory(ThemeCategories.Terminal);
var amberThemes = ThemeCatalog.GetThemesByAccentFamily(ThemeAccentFamilies.Amber);

ThemeDescriptor activeTheme = ThemeCatalog.GetTheme("graphite-office");
string description = activeTheme.Description;
```

Each `ThemeDescriptor` includes:

- `Id`
- `DisplayName`
- `Appearance`
- `Category`
- `AccentFamily`
- `Description`
- `Tags`
- `ResourceUri`

## JSON Presets

The library can export a built-in theme to a JSON preset, or import a custom preset shipped outside the assembly.

```csharp
ThemePreset preset = ThemePresetSerializer.ExportTheme("graphite-office");
string json = ThemePresetSerializer.Serialize(preset);

ThemePreset importedPreset = ThemeManager.ImportValidatedPresetJson(json);
ThemeManager.InitializeApplicationTheme(app, importedPreset);
```

File-based shipping is supported directly:

```csharp
ThemePresetSerializer.SaveToFile(preset, @"Presets\SignalNight.json");
ThemePreset filePreset = ThemeManager.ImportValidatedPresetFile(@"Presets\SignalNight.json");
ThemeManager.ApplyTheme(app, filePreset);
```

You can also use one-step initialization from imported presets:

```csharp
ThemePreset importedFromJson = ThemeManager.InitializeApplicationThemeFromPresetJson(app, json);
ThemePreset importedFromFile = ThemeManager.InitializeApplicationThemeFromPresetFile(app, @"Presets\SignalNight.json");
```

When presets include optional `background` metadata, consumers can render it directly:

```csharp
var fallbackColor = importedFromJson.PaletteValues[ThemePaletteKeys.Background];
Brush backgroundBrush = ThemePresetBackgroundBrushFactory.CreateBrush(importedFromJson.Background!, fallbackColor);
rootDockPanel.Background = backgroundBrush;
```

Each preset document contains:

- `formatVersion`
- theme descriptor metadata
- `background` metadata for solid/gradient/image presentation (defaulted for built-in theme exports)
- `paletteValues` with hex values for every required brush token

Both the bootstrapper sample and demo app use this shared runtime background rendering path.

The bootstrapper sample includes a shipped file preset in [Win32ThemeStudio.BootstrapperSample/Presets/SignalNight.json](Win32ThemeStudio.BootstrapperSample/Presets/SignalNight.json).

Repository-level schema and sample artifacts:

- `theme-preset.schema.json`
- `docs/examples/signal-night.preset.json`
- `docs/theme-schema.md`

## Contrast Validation

You can validate either built-in themes or imported presets before exposing them to users:

```csharp
IReadOnlyList<ThemeContrastIssue> builtInIssues = ThemeContrastValidator.ValidateTheme("amber-terminal");
IReadOnlyList<ThemeContrastIssue> presetIssues = ThemeContrastValidator.ValidatePreset(importedPreset);
```

The validator checks key foreground/background pairs used by the included styles, including:

- primary text on window and surface backgrounds
- secondary text on primary surfaces
- primary text on accent, success, and danger buttons
- menu and tooltip readability

### Manual Resource Merge

If you need explicit control over merged dictionaries in another program, use the published URIs/API instead of hardcoding file paths:

```csharp
ThemeResourceLocator.EnsureBaseResources(application.Resources);
ThemeResourceLocator.SetTheme(application.Resources, "storm-steel");
```

The base styles URI is exposed as `ThemeCatalog.BaseStylesUri`, stable default scheme URIs are exposed as `ThemeCatalog.DefaultLightThemeUri` and `ThemeCatalog.DefaultDarkThemeUri`, and any palette URI is available through `ThemeCatalog.GetThemeUri(themeNameOrId)`.

## Packaging

The theme library project now includes NuGet metadata and can be packed from the repository root with:

```powershell
dotnet pack .\Win32ThemeStudio.Themes\Win32ThemeStudio.Themes.csproj -c Release
```

## Design Direction

These improvements follow the same practical ideas used by established theming projects:

- a reference/sample host app that consumes the public theming API
- package-oriented onboarding instead of demo-only wiring
- richer theme metadata so consuming apps can present curated choices instead of raw dictionary names

## Inspiration and Research Sources

This repo is an original implementation inspired by the design systems, galleries, and style showcases listed below.
No third-party source code or assets were copied into this project.

- https://github.com/lepoco/wpfui
- https://github.com/spicetify/spicetify-themes
- https://github.com/kikipoulet/SukiUI
- https://github.com/Carlos487/awesome-wpf
- https://uiverse.io/
- https://uihut.com/icons
