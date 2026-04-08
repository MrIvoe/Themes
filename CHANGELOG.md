# Changelog

## 0.0.002

- Reworked Themes into a universal token-first architecture with three layers: raw tokens, semantic mapping, and adapters.
- Added starter universal theme at themes/midnight (theme.json + semantic.json).
- Added schema contracts for universal tokens and semantic references.
- Added token resolver and validation utilities in src/.
- Added exporters for CSS, JSON, Python, C, and C++ plus build pipeline output into dist/.
- Updated repository documentation for token naming rules, adapter separation, and single-source export flow.

## 0.0.001

- Added required docs scaffolding for theme-platform roadmap alignment.
- Established canonical documentation entrypoints for schema, authoring, backgrounds, import, and fallback behavior.
- Added machine-readable preset schema (`theme-preset.schema.json`) and sample preset artifact for import/export alignment.
- Added optional background metadata support to the preset model and schema (`background` block, preserved on round-trip).
- Added serializer round-trip tests covering optional background metadata and backward-compatible presets without background data.
- Added runtime preset validation with structured diagnostics and bootstrapper-side import gating before theme activation.
- Added canonical `ThemeManager` helper APIs for validated preset JSON/file import and one-step initialize-from-import flows.
- Added `ThemePresetBackgroundBrushFactory` and bootstrapper runtime rendering for optional preset background metadata.
- Added default background metadata generation for built-in theme exports and demo parity for shared preset background rendering.

## Notes

- Repository remains in unstable track while platform interfaces continue to mature.
