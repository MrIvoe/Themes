# Changelog

## 0.0.001

- Added required docs scaffolding for theme-platform roadmap alignment.
- Established canonical documentation entrypoints for schema, authoring, backgrounds, import, and fallback behavior.
- Added machine-readable preset schema (`theme-preset.schema.json`) and sample preset artifact for import/export alignment.
- Added optional background metadata support to the preset model and schema (`background` block, preserved on round-trip).
- Added serializer round-trip tests covering optional background metadata and backward-compatible presets without background data.
- Added runtime preset validation with structured diagnostics and bootstrapper-side import gating before theme activation.
- Added canonical `ThemeManager` helper APIs for validated preset JSON/file import and one-step initialize-from-import flows.

## Notes

- Repository remains in unstable track while platform interfaces continue to mature.
