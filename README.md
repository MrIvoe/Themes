# @mrivoe/themes

`@mrivoe/themes` is a universal design token and UI system for software projects that use a UI or GUI. It supports reusable theme foundations for colors, icons, controls, surfaces, layout primitives, semantic component styling, and motion contracts across web, desktop, plugins, and cross-language software projects. The repository is intended to become the full appearance system for Spaces and Spaces-Plugins while keeping rendering and behavior in the consuming apps.

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

Extended rule: Themes owns appearance and motion contracts; consuming apps own control behavior and message handling.

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

The recommended next contract layers are:
- foundation tokens: color, size, space, radius, border, font, shadow, motion, opacity, layer
- semantic roles: `toggle.track.on`, `dropdown.itemHoverBg`, `fence.titlebar.bg`, `tray.itemText`
- component contracts: `toggle.default`, `slider.default`, `dropdown.default`, `tray.default`, `fence.default`
- style presets/resources: icon packs, button families, control defaults

## UI Resource Selection

`themes/<theme-id>/resources.json` is the user-facing selection catalog for runtime UI choices:

- `ui.icons.defaultPack`: default icon pack for the theme
- `ui.icons.availablePacks`: allowed icon packs users can pick
- `ui.buttons.families`: style families users can switch between (`compact`, `soft`, `outlined`, `high-contrast`)
- `ui.buttons.styles`: named button style presets mapped to `components.json` variants
- `ui.controls`: optional named presets for other control groups (input/select/menu/etc)
- `ui.controls`: control defaults for toggle, slider, select, dropdown, menu, tray, tab, card, and fence shells

Build output includes `dist/json/<theme-id>.resources.json` so app/plugin hosts can load the same validated options at runtime.

Runtime resolution helper:

- `npm run resolve:ui` resolves defaults for `themes/midnight`
- `npm run resolve:ui:sample` resolves explicit selection (`tabler` + `softPrimary`)

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

## Inspiration and Reference Sources

`@mrivoe/themes` is inspired by and references external UI kits and design systems to inform component patterns, naming conventions, and interaction design. **No code from external sources is embedded in our core theme files.** All inspiration is transformed into our own semantic contracts and token system.

### External Design Systems and UI Kits

We study and learn from:

**Design Systems**
- Material Design (Google)
- Fluent Design System (Microsoft)
- Radix Primitives
- shadcn/ui
- Ant Design

**UI Libraries & Kits**
- Bootstrap
- Tabler UI
- MDB UI Kit
- Flutter UI Kit
- React Native UI Kitten

**Aesthetic & Component References**
- FlatUI (flat minimalism)
- Kitten Tricks (mobile patterns)
- Aragon UI (compositional architecture)
- Bevypunk (cyberpunk aesthetics)
- Discord Cyberpunk Theme (neon/high-contrast)

**Dashboard & Admin Patterns**
- Tabler (admin templates)
- Element UI (enterprise components)

**Architecture & Layout**
- SnapKit (constraint/layout hierarchies)
- Tamagui (cross-platform tokens)
- Awesome WinUI (Win32/desktop patterns)

See `references/ui-libraries.json` for the complete list with licenses and usage notes.

### How We Use References

1. **Study**: We research external system documentation, component hierarchies, and interaction patterns
2. **Extract**: We identify universal patterns (button states, accessibility, visual hierarchy)
3. **Translate**: We convert patterns into our own semantic tokens and component contracts
4. **Implement**: We code using our semantic system, not external names or embeddings
5. **Document**: We record inspiration sources in our reference collections

### Component Style Families

Our five component style families are **inspired by but not copied from** these systems:

| Family | Primary Inspiration | Pattern |
|--------|-------------------|---------|
| **desktop-fluent** | Microsoft Fluent, WinUI | Layered depth, command bars, ribbon layouts |
| **dashboard-modern** | Tabler, Ant Design, Element | Data-dense layouts, metric cards, responsive grids |
| **flat-minimal** | FlatUI, shadcn | Flat edges, subtle shadows, restrained colors |
| **soft-mobile** | Flutter UI Kit, Kitten Tricks | Rounded corners, soft shadows, touch-friendly sizes |
| **cyber-futuristic** | Bevypunk, Discord Cyberpunk | Neon accents, high contrast, sci-fi typography |

Each family is a **semantic design direction**, not a port or copy of any external system.

### Reference Documentation

- [`references/ui-libraries.json`](references/ui-libraries.json) — All external sources with licenses
- [`references/inspiration-catalog.json`](references/inspiration-catalog.json) — Mapping of sources to component areas
- [`references/style-families.json`](references/style-families.json) — Style family definitions and inspirations
- [`references/component-patterns.json`](references/component-patterns.json) — Component state machines and contracts
- [`docs/inspiration-policy.md`](docs/inspiration-policy.md) — Full policy on how we use external references
- [`docs/style-family-guide.md`](docs/style-family-guide.md) — Detailed guide to each component family
- [`docs/resource-system.md`](docs/resource-system.md) — How runtime-selectable resources work

### Attribution

When `@mrivoe/themes` transitions from private to public release, full attribution will be added to the README and generated artifacts for all inspiration sources.

### Why This Approach

✅ Learn from the best UI/UX research available  
✅ Maintain independence in our design system  
✅ Respect external projects' intellectual property  
✅ Stay transparent about our inspirations  
✅ Build something that's genuinely Spaces' own  

The external systems are teachers and reference materials. Our components, tokens, and families are our own.

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
