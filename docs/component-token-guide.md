# Component Token Guide

Component tokens define structural properties of reusable UI components: heights, paddings, radii, border widths, etc. They reference scale tokens rather than raw values, so a single `components.json` works across any theme as long as the scale tokens are defined.

## Why Component Tokens

Color tokens (in `semantic.json`) answer "what color should this thing be?". Component tokens (in `components.json`) answer "how big and how spaced should this thing be?". Separating the two lets you:

- Swap color themes without touching layout
- Change density/sizing presets without changing colors
- Generate accurate native code (Win32, Qt, CSS) from a single source

## File Structure

`themes/<id>/components.json` — top-level keys are component names. Values are either:

- A **token reference** string (dot-notation path into `theme.scale.*`)
- A **raw number** (pixel value, used for values with no named scale slot)
- A **nested object** for grouped properties (e.g. per-size variants)

```json
{
  "button": {
    "sizes": {
      "md": {
        "height":  "size.control.md",
        "paddingX": "space.md",
        "paddingY": "space.sm",
        "fontSize": "font.size.md",
        "radius":   "radius.md"
      }
    },
    "borderWidth": "stroke.thin",
    "iconGap":     "space.xs"
  }
}
```

## Scale Token Reference

All token refs must resolve in `theme.scale`. The midnight theme provides:

### Size

| Token | Value | Use |
|---|---|---|
| `size.icon.xs` | 12 | Tiny icon |
| `size.icon.sm` | 14 | Small icon |
| `size.icon.md` | 16 | Default icon |
| `size.icon.lg` | 20 | Large icon |
| `size.icon.xl` | 24 | XL icon |
| `size.control.sm` | 28 | Compact control |
| `size.control.md` | 36 | Default control |
| `size.control.lg` | 44 | Large control |

### Space

| Token | px | Use |
|---|---|---|
| `space.xs` | 4 | Tight gap |
| `space.sm` | 8 | Close spacing |
| `space.md` | 12 | Default spacing |
| `space.lg` | 16 | Comfortable spacing |
| `space.xl` | 24 | Generous padding |
| `space.xxl` | 40 | Section separation |

### Radius

| Token | px | Shape |
|---|---|---|
| `radius.sm` | 4 | Subtle rounding |
| `radius.md` | 6 | Default |
| `radius.lg` | 10 | Pronounced rounding |
| `radius.xl` | 14 | Strongly rounded |
| `radius.pill` | 999 | Pill/capsule |

### Border

| Token | px |
|---|---|
### Stroke

| Token | px | Use |
|---|---|---|
| `stroke.thin` | 1 | Default border width |
| `stroke.medium` | 2 | Emphasized border |
| `stroke.thick` | 3 | Strong border |
### Font

| Token | Value |
|---|---|
| `font.size.xs` | 11 |
| `font.size.sm` | 12 |
| `font.size.md` | 13 |
| `font.size.lg` | 14 |
| `font.size.xl` | 16 |
| `font.size.heading` | 20 |
| `font.weight.regular` | 400 |
| `font.weight.medium` | 500 |
| `font.weight.semibold` | 600 |
| `font.weight.bold` | 700 |
| `font.family.base` | Segoe UI, Inter, … |
| `font.family.mono` | Consolas, Cascadia Code, … |

## Components Defined

### `button`

Sizes: `xs`, `sm`, `md`, `lg`. Fields per size: `height`, `paddingX`, `paddingY`, `fontSize`, `radius`.  
Shared: `borderWidth`, `iconGap`.

### `input`

Sizes: `sm`, `md`, `lg`. Fields per size: `height`, `paddingX`, `fontSize`, `radius`.  
Shared: `borderWidth`.

### `checkbox` / `radio`

Sizes: `sm`, `md`, `lg`. Fields per size: `size` (square dimension), `radius` (checkbox only).  
Shared: `borderWidth`.

### `toggle`

Sizes: `sm`, `md`, `lg`. Fields per size: `trackWidth`, `trackHeight`, `thumbSize` (raw px numbers).  
Shared: `radius` (applies to track), `borderWidth`.

### `card`

Single size. Fields: `radius`, `borderWidth`, `padding`, `headerPadding`, `gap`.

### `modal`

Single size. Fields: `radius`, `borderWidth`, `padding`, `headerPadding`, `footerPadding`, `maxWidth`, `gap`.

### `tooltip`

Single size. Fields: `radius`, `borderWidth`, `padding`, `fontSize`, `maxWidth`.

### `badge`

Single size. Fields: `radius`, `paddingX`, `paddingY`, `fontSize`, `fontWeight`.

### `tab`

Single size. Fields: `borderWidth`, `paddingX`, `paddingY`, `indicatorHeight`, `radius`, `gap`.

### `table`

Single size. Fields: `rowHeight`, `headerHeight`, `cellPaddingX`, `borderWidth`, `radius`.

### `titlebar`

Single size. Fields: `height`, `buttonSize`, `buttonRadius`, `iconSize`, `paddingX`.

### `sidebar`

Single size. Fields: `width` (expanded), `collapsedWidth`, `itemHeight`, `itemPaddingX`, `itemRadius`, `indent`, `iconSize`, `iconGap`.

### `settings`

Single size. Fields: `sidebarWidth`, `contentPadding`, `rowHeight`, `rowPaddingX`, `sectionGap`, `rowGap`.

### `tray`

Single size. Fields: `itemHeight`, `itemPaddingX`, `iconSize`, `iconGap`, `dividerHeight`, `radius`.

### `plugin`

Two sub-components:
- `card`: `radius`, `padding`, `iconSize`, `gap`
- `summaryPanel`: `padding`, `sectionRadius`, `iconSize`, `gap`

## Adapter Usage

The standard build pipeline (`npm run build`) does not yet generate per-component outputs — components are used by adapter authors who parse `components.json` at build time. You can load and resolve them programmatically:

```js
const components = require("themes/midnight/components.json");
const theme = require("themes/midnight/theme.json");
const { flattenTokens } = require("src/resolve-token-path");

const flatScale = flattenTokens(theme.scale);

function resolveRef(value) {
  if (typeof value === "string" && flatScale[value] !== undefined) {
    return flatScale[value];
  }
  return value;
}

// Example: resolve button.md height → 36
const buttonMdHeight = resolveRef(components.button.sizes.md.height);
```

### C++ (Win32)

```cpp
// Read from parsed components JSON and scale
int buttonHeight = theme.ResolveScaleInt("size.control.md"); // 36
int buttonRadius = theme.ResolveScaleInt("radius.md");       // 6
int buttonPadX   = theme.ResolveScaleInt("space.md");        // 12
```

## Validation

`npm run validate` includes component token validation. All string values that match a dot-notation pattern are checked against `theme.scale`. Raw numbers are allowed without validation.

To validate manually:

```powershell
node src/validate-theme.js themes/midnight/theme.json themes/midnight/semantic.json themes/midnight/components.json themes/midnight/icons.json
```

## Authoring a New Theme

Your theme's `components.json` can reuse the same structure and token refs as `midnight/components.json` unchanged, as long as your `theme.scale` defines the same keys. Token refs that don't exist in your scale will fail validation.

If your theme has a denser visual style, you can override individual values:

```json
"button": {
  "sizes": {
    "md": {
      "height": "size.control.sm",
      "paddingX": "space.sm"
    }
  }
}
```
