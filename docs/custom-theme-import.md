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
- optional background metadata is preserved during serialize/deserialize round-trips

Current import shape is driven by `ThemePreset` and `ThemePresetDescriptor` in the theme library.

Future direction includes export and round-trip compatibility checks.
