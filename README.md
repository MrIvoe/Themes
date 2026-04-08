# @mrivoe/themes

Universal single-source design token system for cross-language theming.

## Version

Current working baseline: 0.0.002

## Package Visibility

This package is currently internal-only and intentionally marked private.

## Architecture

The repo is intentionally split into three layers:

1. Raw universal tokens
2. Semantic mappings
3. Target adapters/exporters

Core rule: a theme defines what a color means, not where it is used.

## Repository Layout

- schema/
  - theme.schema.json
  - semantic.schema.json
- themes/
  - midnight/theme.json
  - midnight/semantic.json
- adapters/
  - css/export-css.js
  - json/export-json.js
  - python/export-python.js
  - c/export-c.js
  - cpp/export-cpp.js
- src/
  - resolve-token-path.js
  - validate-theme.js
  - build-all.js
- dist/
  - css/
  - json/
  - python/
  - c/
  - cpp/
- docs/
  - token-system.md
  - adapter-guide.md
  - create-theme.md

## Canonical Token Paths

Use dot notation with semantic meaning:

- background.primary
- background.secondary
- surface.panel
- surface.card
- text.primary
- text.secondary
- text.muted
- accent.primary
- accent.success
- accent.warning
- accent.danger
- border.default
- border.subtle
- state.hover
- state.active
- state.focus
- syntax.keyword
- syntax.string
- syntax.comment

Avoid implementation-specific names such as htmlBlue, cppErrorRed, pythonWindowBg.

## Validation Rules

- meta.id, meta.name, meta.version, and meta.mode are required.
- Required token groups: background, surface, text, accent, border, state, syntax.
- Every token color must be a valid hex color (#RRGGBB or #RRGGBBAA).
- Semantic references must resolve to an existing token path.

## Build And Export

Run from the Themes repo root:

```bash
npm run validate
npm run build
```

Generated files are written to dist/ as:

- CSS variables
- Flattened JSON token + semantic bundles
- Python dictionary modules
- C header defines
- C++ constexpr header

## Export Compatibility Matrix

- CSS exporter: implemented
- JSON exporter: implemented
- Python exporter: implemented
- C exporter: implemented
- C++ exporter: implemented
- Java adapter: planned
- Qt adapter: planned
- Tkinter adapter: planned

## Integration Contract

- Spaces and Spaces-Plugins consume exported token outputs from Themes.
- App/plugin repos should not define direct palette values unless app-specific overrides are required.
- Adapters own framework/language-specific mapping logic.
- Cross-repo compatibility and fallback policy is documented in `docs/THEME_CONTRACT.md`.

## Minimal Schema Example

Example theme file shape:

```json
{
  "meta": {
    "id": "midnight",
    "name": "Midnight",
    "version": "0.0.002",
    "mode": "dark"
  },
  "tokens": {
    "background": { "primary": "#0F1115" },
    "text": { "primary": "#E8EDF5" }
  }
}
```

Example semantic mapping shape:

```json
{
  "semantic": {
    "window.background": "background.primary",
    "window.foreground": "text.primary"
  }
}
```

Example generated output snippet (JSON export):

```json
{
  "window.background": "#0F1115",
  "window.foreground": "#E8EDF5"
}
```

## Token Governance

- Reuse existing tokens before adding new ones.
- Add new tokens only when a semantic need cannot be expressed with existing paths.
- Never add tokens named after frameworks, languages, or specific controls unless they are semantic aliases.

## Example Starter Theme

The starter universal theme is available at themes/midnight/theme.json with semantic mappings at themes/midnight/semantic.json.
