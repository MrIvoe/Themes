# Theme Schema

Current machine-readable preset schema:

- `theme-preset.schema.json`

Current implemented preset contract:

- `formatVersion` = `1.0`
- `theme.id`
- `theme.displayName`
- `theme.appearance`
- `theme.category`
- `theme.accentFamily`
- `theme.description`
- `theme.tags`
- optional `theme.sourceThemeUri`
- `paletteValues` map of brush token name to hex color

Example preset:

- `docs/examples/signal-night.preset.json`

Schema direction:

- stable id and metadata section
- extensible token namespaces
- compatibility metadata for host integration
- background and appearance variant support

Validation goals:

- required keys enforced
- type validation for token values
- actionable diagnostics for rejected themes
