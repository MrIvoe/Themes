# @mrivoe/themes

`@mrivoe/themes` is a universal design token and UI system for software projects that use a UI or GUI. It supports reusable theme foundations for colors, icons, buttons, controls, layout primitives, and semantic component styling across web, desktop, plugins, and cross-language software projects. The repository also maintains optional compatibility references for free/open icon packs and UI libraries while keeping the core theme source framework-agnostic.

## Version

Current working baseline: 0.0.003

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
  - components.schema.json
  - icons.schema.json
  - resources.schema.json
  - references.schema.json
- themes/
  - midnight/theme.json
  - midnight/semantic.json
  - midnight/components.json
  - midnight/icons.json
  - midnight/resources.json
- references/
  - icon-packs.json
  - ui-libraries.json
  - licenses-to-verify.md
- adapters/
  - css/export-css.js
  - json/export-json.js
  - python/export-python.js
  - c/export-c.js
  - cpp/export-cpp.js
  - java/export-java.js
  - scss/export-scss.js
  - tailwind/export-tailwind.js
  - qt/export-qt.js
  - tkinter/export-tkinter.js
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
  - java/
  - scss/
  - tailwind/
  - qt/
  - tkinter/
- docs/
  - token-system.md
  - adapter-guide.md
  - create-theme.md
  - icon-system.md
  - component-token-guide.md
  - third-party-references.md

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
- icon.default
- icon.interactive
- icon.muted
- icon.warning
- icon.danger
- icon.info

Non-color structural values live in `theme.scale.*`:

- scale.size.icon.md
- scale.space.md
- scale.radius.md
- scale.font.size.md
- scale.stroke.thin
- scale.motion.duration.normal
- scale.layer.modal

Avoid implementation-specific names such as htmlBlue, cppErrorRed, pythonWindowBg.

## Validation Rules

- meta.id, meta.name, meta.version, and meta.mode are required.
- Required token groups: background, surface, text, accent, border, state, syntax.
- Every token color must be a valid hex color (#RRGGBB or #RRGGBBAA).
- Non-color scale values (size, space, radius, font, motion, …) live in `theme.scale` and are not hex-validated.
- Semantic references must resolve to an existing token path.
- Component token refs must resolve to an existing token in `theme.tokens` or `theme.scale`.
- Icon role color refs must resolve to an existing color role in `icons.icon.color`.
- `resources.json` (if present) validates selectable icon packs and button/control style references.

## UI Resource Selection

`themes/<theme-id>/resources.json` is the user-facing selection catalog for runtime UI choices:

- `ui.icons.defaultPack`: default icon pack for the theme
- `ui.icons.availablePacks`: allowed icon packs users can pick
- `ui.buttons.styles`: named button style presets mapped to `components.json` variants
- `ui.controls`: optional named presets for other control groups (input/select/menu/etc)

Build output includes `dist/json/<theme-id>.resources.json` so app/plugin hosts can load the same validated options at runtime.

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

| Adapter | Status |
|---|---|
| CSS variables | implemented |
| Flattened JSON | implemented |
| Python dict module | implemented |
| C header defines | implemented |
| C++ constexpr header | implemented |
| Java constants | implemented |
| SCSS variables | implemented |
| Tailwind config | implemented |
| Qt stylesheet | implemented |
| Tkinter palette | implemented |

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
    "version": "0.0.003",
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

## Third-Party References

Icon packs and UI design systems are referenced for **inspiration and optional compatibility mapping only**. No third-party code or assets are embedded in the core theme source files. All pack references are marked `license_verification_pending` until verified.

See:
- `references/icon-packs.json` — tracked icon pack sources
- `references/ui-libraries.json` — UI library and design system references
- `references/licenses-to-verify.md` — verification checklist
- `docs/third-party-references.md` — policy and usage rules

## Token Governance

- Reuse existing tokens before adding new ones.
- Add new tokens only when a semantic need cannot be expressed with existing paths.
- Never add tokens named after frameworks, languages, or specific controls unless they are semantic aliases.

## Example Starter Theme

The starter universal theme is available at themes/midnight/theme.json with semantic mappings at themes/midnight/semantic.json.
