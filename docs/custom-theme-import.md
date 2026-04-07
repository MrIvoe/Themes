# Custom Theme Import

Import flow expectations:

- validate package before activation
- reject malformed or unsafe payloads
- preserve currently valid active theme on failure
- provide diagnostics suitable for user troubleshooting

Current preset import contract:

- schema file: `theme-preset.schema.json`
- example file: `docs/examples/signal-night.preset.json`
- serializer implementation: `Win32ThemeStudio.Themes/ThemePresetSerializer.cs`
- runtime validator: `Win32ThemeStudio.Themes/ThemePresetValidator.cs`
- canonical import helper: `Win32ThemeStudio.Themes/ThemeManager.cs` (`ImportValidatedPresetJson`, `ImportValidatedPresetFile`)
- optional background metadata is preserved during serialize/deserialize round-trips

Current validation behavior:

- required `Brush.*` palette keys are checked before activation
- palette and background color values must use `#RRGGBB` or `#AARRGGBB`
- invalid `background.mode`, `background.sizingMode`, and missing mode-specific fields are rejected before activation
- `ThemeManager` now exposes validated preset import helpers and one-step initialize-from-import APIs
- bootstrapper sample now validates imported presets before applying them

Current import shape is driven by `ThemePreset` and `ThemePresetDescriptor` in the theme library.

Future direction includes export and round-trip compatibility checks.
