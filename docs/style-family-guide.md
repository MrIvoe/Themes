# Style Family Guide

## Overview

Style families are **semantic component design directions** that allow a single theme to support multiple UI aesthetic profiles. When a user selects `desktop-fluent`, `dashboard-modern`, `flat-minimal`, `soft-mobile`, or `cyber-futuristic`, all components adapt their appearance accordingly.

Style families are **not framework implementations**. They are **contracts** that describe what a component looks like in each direction.

## Family Profiles

### 1. Desktop Fluent

**Use When**: Building Win32/desktop Spaces shell UI, plugins designed for traditional desktop interfaces.

**Visual Profile**:
- Layered depth with shadow hierarchies
- Command-bar inspired menus and toolbars
- Ribbon-like grouped controls
- Comfortable spacing with clear visual hierarchy
- Segoe UI typography family

**Component Behaviors**:

```json
{
  "buttons": {
    "padding": "generous",
    "cornerRadius": "medium",
    "depth": "subtle shadow on quiet, lifted on hover"
  },
  "menus": {
    "style": "vertical command menus",
    "grouping": "nested sections with separators",
    "icon": "integrated with text"
  },
  "fence": {
    "titlebar": "full system chrome",
    "corners": "square or slightly rounded"
  }
}
```

**Icon Pack**: Segoe MDL2 or modern weight system icons  
**Motion**: 400ms standard transitions  
**Inspiration**: Microsoft Fluent, WinUI, traditional desktop shells

---

### 2. Dashboard Modern

**Use When**: Building admin panels, analytics dashboards, data-heavy plugin UIs, settings dashboards.

**Visual Profile**:
- Compact, data-optimized layouts
- Card-based content organization
- Metric-focused visual hierarchy
- Monospace typography for data/numbers
- Responsive grid-based spacing

**Component Behaviors**:

```json
{
  "buttons": {
    "padding": "compact",
    "cornerRadius": "small",
    "size": "smaller with dense grouping"
  },
  "tables": {
    "striped": "alternating row backgrounds",
    "hover": "highlight entire row on hover",
    "density": "condensed row height"
  },
  "cards": {
    "style": "metric cards with value/label/icon",
    "shadow": "subtle card elevation",
    "layout": "grid-aligned"
  }
}
```

**Icon Pack**: Tabler (monospace-inspired, dashboard-optimized)  
**Motion**: 200ms quick transitions  
**Inspiration**: Tabler, Ant Design, Element UI, admin dashboards

---

### 3. Flat Minimal

**Use When**: Building modern, clean interfaces; plugins that want minimalist aesthetics; focus-driven layouts.

**Visual Profile**:
- Minimal ornamentation, generous whitespace
- Flat surfaces with single accent color
- Soft rounded corners
- High legibility with restrained typography
- Subtle hover/focus states

**Component Behaviors**:

```json
{
  "buttons": {
    "style": "flat with ghost variants",
    "background": "no color until hover",
    "shadow": "none, only background change"
  },
  "inputs": {
    "border": "bottom border only",
    "background": "transparent or subtle",
    "style": "minimal visual presence"
  },
  "cards": {
    "border": "thin outline",
    "shadow": "none",
    "spacing": "generous whitespace"
  }
}
```

**Icon Pack**: Heroicons (clean stroke-based)  
**Motion**: 300ms standard transitions  
**Inspiration**: FlatUI, shadcn/ui, Bootstrap (in minimal mode)

---

### 4. Soft Mobile

**Use When**: Building responsive/mobile UIs, touch-optimized interfaces, mobile plugin views, responsive web views.

**Visual Profile**:
- Generous rounded corners (pill-shaped buttons, large card radius)
- Soft shadows and depth
- Touch-friendly hit targets (44px+ minimum)
- Large readable text with relative sizing
- Smooth, natural transitions (spring easing)

**Component Behaviors**:

```json
{
  "buttons": {
    "minHeight": "44px",
    "cornerRadius": "large pill",
    "padding": "generous for touch",
    "hitTarget": "oversized for fat fingers"
  },
  "inputs": {
    "minHeight": "48px",
    "fontSize": "16px minimum",
    "padding": "generous"
  },
  "menu": {
    "style": "bottom navigation or side drawer",
    "itemSize": "touch-friendly",
    "transitions": "smooth bounce easing"
  }
}
```

**Icon Pack**: Heroicons or Lucide (works well at all sizes)  
**Motion**: 500ms deliberate transitions with spring easing  
**Inspiration**: Flutter UI Kit, React Native kits, mobile-first web design

---

### 5. Cyber Futuristic

**Use When**: Gaming overlays, special theme variants, accessibility-focused high-contrast themes, sci-fi aesthetics.

**Visual Profile**:
- High contrast base with neon accent colors
- Glow effects and blur layers
- Monospace or tech-inspired typography
- Sharp, bold visual separation
- Animated glitch/scan effects (optional)

**Component Behaviors**:

```json
{
  "buttons": {
    "border": "neon colored outline",
    "background": "dark or transparent",
    "glow": "subtle glow on hover, intense on active",
    "text": "monospace or tech font"
  },
  "inputs": {
    "border": "neon with glow",
    "background": "pure dark",
    "cursor": "neon line effect"
  },
  "accent": {
    "colors": "neon cyan, magenta, lime",
    "effect": "glow blur on all accents",
    "intensity": "bold and unmissable"
  }
}
```

**Icon Pack**: Bootstrap Icons or custom neon-styled icons  
**Motion**: 150ms quick, linear (scan-line effect)  
**Inspiration**: Bevypunk, Discord Cyberpunk theme, high-contrast accessibility needs

---

## Component Family Matrix

Which style families support which component types:

| Component | desktop-fluent | dashboard-modern | flat-minimal | soft-mobile | cyber-futuristic |
|-----------|----------------|------------------|--------------|-------------|------------------|
| Button | ✅ | ✅ | ✅ | ✅ | ✅ |
| Switch/Toggle | ✅ | ✅ | ✅ | ✅ | ✅ |
| Slider | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dropdown | ✅ | ✅ | ✅ | ✅ | ✅ |
| Input | ✅ | ✅ | ✅ | ✅ | ✅ |
| Table | ⚠️ | ✅ | ✅ | ⚠️ | ✅ |
| Menu | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tabs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Card | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notification | ✅ | ✅ | ✅ | ✅ | ✅ |
| Titlebar | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Tray Menu | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| Fence Shell | ✅ | ⚠️ | ✅ | ⚠️ | ✅ |
| Plugin Card | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legend**: ✅ Full support | ⚠️ Partial/limited support (falls back to default)

## Specifying a Style Family

### In Theme Resources

```json
{
  "meta": {
    "themeId": "midnight",
    "version": "0.0.003"
  },
  "ui": {
    "componentFamily": {
      "default": "desktop-fluent",
      "available": [
        "desktop-fluent",
        "dashboard-modern",
        "flat-minimal",
        "soft-mobile",
        "cyber-futuristic"
      ]
    }
  }
}
```

### At Runtime (Spaces Settings)

```
Settings > Appearance > Component Style > [desktop-fluent ▼]
```

### Programmatically

```cpp
// C++
themeManager.SetComponentFamily("dashboard-modern");

// JavaScript
themeManager.setComponentFamily("soft-mobile");
```

## Component Contract Specification

Each component contract defines the **visual properties** by family:

```json
{
  "button": {
    "families": {
      "desktop-fluent": {
        "padding": "12px 24px",
        "borderRadius": "4px",
        "shadow": "0 2px 4px rgba(0,0,0,0.1) hover, 0 4px 8px rgba(0,0,0,0.15) active",
        "fontSize": "font.size.md"
      },
      "dashboard-modern": {
        "padding": "8px 16px",
        "borderRadius": "3px",
        "shadow": "none",
        "fontSize": "font.size.sm"
      },
      "flat-minimal": {
        "padding": "12px 24px",
        "borderRadius": "8px",
        "shadow": "none",
        "fontSize": "font.size.md"
      },
      "soft-mobile": {
        "padding": "16px 28px",
        "borderRadius": "12px",
        "shadow": "0 2px 8px rgba(0,0,0,0.08)",
        "fontSize": "font.size.lg"
      },
      "cyber-futuristic": {
        "padding": "12px 24px",
        "borderRadius": "2px",
        "shadow": "0 0 16px cyan-glow",
        "fontSize": "font.size.md"
      }
    }
  }
}
```

## Fallback Behavior

If a component doesn't have a contract for a requested family, it falls back to `desktop-fluent` (the default baseline).

## Adding New Families

To add a new style family:

1. Define it in `references/style-families.json` with characteristics, component overrides, colors, motion, and inspiration
2. Add component contracts to `themes/midnight/components.json` for each supported component type
3. Update `themes/midnight/resources.json` to include the new family in `componentFamily.available`
4. Document the family in this guide
5. Update component family matrix above

## Design Principles

When creating or maintaining style families:

- **Semantic**: Family names describe intent (desktop, dashboard) not technology
- **Consistent**: All components in a family follow the same visual language
- **Accessible**: All families must meet WCAG AA contrast and interaction standards
- **Testable**: Each family can be rendered in isolation and verified
- **Extensible**: New families can be added without impacting existing ones
