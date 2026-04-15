# Resource System

## Overview

The **Resource System** is how the Themes repo manages runtime-selectable UI resources: icon packs, button families, control families, menu styles, fence shells, and motion presets.

Resources are **declared in `themes/midnight/resources.json`** and resolved at theme load time by the consuming app (Spaces or plugins).

## Architecture

### Three Layers

```
Foundation Tokens (theme.json)
    ↓
Semantic Mappings (semantic.json)
    ↓
Component Contracts (components.json)
    ↓
Resources & Families (resources.json)  ← You are here
```

Resources are **the top layer** — they compose tokens, mappings, and contracts into user-selectable profiles.

### Structure

```json
{
  "meta": { "themeId": "midnight", "version": "0.0.003" },
  "ui": {
    "CATEGORY": {
      "default": "value",
      "available": ["option1", "option2"],
      "OPTION": { /* option definition */ }
    }
  }
}
```

## Resource Categories

### 1. Icons (Icon Packs)

**Purpose**: Allow users to select visual icon style during theme selection or in settings.

```json
{
  "ui": {
    "icons": {
      "defaultPack": "lucide",
      "availablePacks": ["lucide", "heroicons", "tabler", "bootstrap-icons"],
      "lucide": {
        "label": "Lucide Icons",
        "description": "Consistent stroke-based iconography",
        "license": "ISC",
        "count": 450,
        "variants": ["default"],
        "url": "https://lucide.dev"
      },
      "heroicons": {
        "label": "Heroicons",
        "description": "Outline and solid stroke variations",
        "license": "MIT",
        "count": 290,
        "variants": ["outline", "solid"],
        "url": "https://heroicons.com"
      },
      "tabler": {
        "label": "Tabler Icons",
        "description": "Monospace-inspired stroke icons for dashboards",
        "license": "MIT",
        "count": 4800,
        "variants": ["default"],
        "url": "https://tabler-icons.io"
      },
      "bootstrap-icons": {
        "label": "Bootstrap Icons",
        "description": "Bootstrap ecosystem compatible icons",
        "license": "MIT",
        "count": 2300,
        "variants": ["default"],
        "url": "https://icons.getbootstrap.com"
      }
    }
  }
}
```

**At Runtime**:
```cpp
// C++: Spaces or plugin loads icon pack
IconManager icons = LoadIconPack(theme.ui.icons.defaultPack);
HICON icon = icons.GetIcon("lucide.plus");  // Get icon by name
```

**Icon Mapping File** (separate):
```json
{
  "action.add": "lucide.plus",
  "action.remove": "lucide.minus",
  "action.settings": "lucide.settings"
}
```

---

### 2. Buttons

**Purpose**: Allow selection of button visual family (compact, soft, outlined, etc.).

```json
{
  "ui": {
    "buttons": {
      "defaultFamily": "compact",
      "families": {
        "compact": {
          "label": "Compact",
          "description": "Dense button with minimal padding",
          "availableStyles": ["primary", "secondary"],
          "sizing": { "height": "size.control.sm", "paddingX": "space.sm" }
        },
        "soft": {
          "label": "Soft",
          "description": "Soft button with elevated background",
          "availableStyles": ["primary", "secondary"],
          "sizing": { "height": "size.control.md", "paddingX": "space.md" }
        },
        "outlined": {
          "label": "Outlined",
          "description": "Border-only button",
          "availableStyles": ["primary", "danger"],
          "sizing": { "height": "size.control.md", "paddingX": "space.md" }
        },
        "high-contrast": {
          "label": "High Contrast",
          "description": "Accessible high-contrast button",
          "availableStyles": ["primary", "danger"],
          "sizing": { "height": "size.control.lg", "paddingX": "space.lg" }
        }
      }
    }
  }
}
```

**At Runtime**:
```cpp
ButtonStyle style = theme.ui.buttons.families[selectedFamily];
button.ApplyStyle(style);
```

---

### 3. Controls (Switches, Sliders, Dropdowns)

**Purpose**: Consistent styling for interactive controls across the entire UI.

```json
{
  "ui": {
    "controls": {
      "defaultFamily": "desktop-fluent",
      "families": {
        "desktop-fluent": {
          "switch": { "contractRef": "switch.fluent" },
          "slider": { "contractRef": "slider.fluent" },
          "dropdown": { "contractRef": "dropdown.fluent", "closeOnSelect": true },
          "input": { "contractRef": "input.outlined" }
        },
        "dashboard-modern": {
          "switch": { "contractRef": "switch.minimal" },
          "slider": { "contractRef": "slider.compact" },
          "dropdown": { "contractRef": "dropdown.compact" },
          "input": { "contractRef": "input.filled" }
        }
      }
    }
  }
}
```

---

### 4. Menus

**Purpose**: Define menu styles for tray, context, and inline menus.

```json
{
  "ui": {
    "menus": {
      "defaultStyle": "standard",
      "availableStyles": ["standard", "compact", "hierarchical"],
      "standard": {
        "label": "Standard Menu",
        "itemPadding": "12px 20px",
        "itemHeight": "32px",
        "separatorHeight": "1px",
        "contractRef": "menu.standard"
      },
      "compact": {
        "label": "Compact Menu",
        "itemPadding": "8px 12px",
        "itemHeight": "24px",
        "separatorHeight": "1px",
        "contractRef": "menu.compact"
      },
      "hierarchical": {
        "label": "Hierarchical Menu",
        "itemPadding": "12px 20px",
        "itemHeight": "36px",
        "submenuOffset": "8px",
        "contractRef": "menu.hierarchical",
        "arrowStyle": "right-aligned"
      }
    }
  }
}
```

---

### 5. Fence Shells

**Purpose**: Define window frame/container style for plugin/space windows.

```json
{
  "ui": {
    "fences": {
      "defaultStyle": "window-frame",
      "availableStyles": ["window-frame", "card-container", "embedded"],
      "window-frame": {
        "label": "Window Frame",
        "description": "Traditional OS window with title bar and chrome",
        "titlebarHeight": 32,
        "borderWidth": 1,
        "hasSystemButtons": true,
        "borderRadius": "radius.none",
        "contractRef": "fence.classic"
      },
      "card-container": {
        "label": "Card Container",
        "description": "Floating card with minimal frame",
        "titlebarHeight": 24,
        "borderWidth": 0,
        "borderRadius": "radius.lg",
        "shadow": "0 8px 24px rgba(0,0,0,0.15)",
        "contractRef": "fence.card"
      },
      "embedded": {
        "label": "Embedded",
        "description": "No frame, inline surface styling",
        "titlebarHeight": 0,
        "borderWidth": 0,
        "borderRadius": "radius.md",
        "contractRef": "fence.embedded"
      }
    }
  }
}
```

---

### 6. Motion Presets

**Purpose**: Define animation timing and easing strategies.

```json
{
  "ui": {
    "motion": {
      "defaultPreset": "standard",
      "availablePresets": ["standard", "quick", "deliberate", "minimal"],
      "standard": {
        "label": "Standard",
        "description": "Material-inspired transitions",
        "duration": "400ms",
        "easing": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "examples": ["modal enter", "dialog fade"]
      },
      "quick": {
        "label": "Quick",
        "description": "Fast micro-interactions",
        "duration": "200ms",
        "easing": "cubic-bezier(0.4, 0.0, 0.2, 1.0)",
        "examples": ["hover effects", "button click"]
      },
      "deliberate": {
        "label": "Deliberate",
        "description": "Slower, pronounced transitions",
        "duration": "600ms",
        "easing": "cubic-bezier(0.34, 1.56, 0.64, 1.0)",
        "examples": ["menu open", "slide-in panels"]
      },
      "minimal": {
        "label": "Minimal Motion",
        "description": "No animation (accessibility)",
        "duration": "0ms",
        "easing": "linear"
      }
    }
  }
}
```

---

### 7. Component Families (Style Families)

**Purpose**: Select overall visual direction (desktop, dashboard, flat, mobile, cyber).

```json
{
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

---

## Resource Resolution

### Load Time

When Spaces loads a theme:

```
1. Parse resources.json
2. Read user preference (appearance.ui.*)
3. Resolve available options
4. Fall back to default if preference unavailable
5. Pass resolved resources to UI rendering pipeline
```

### Example Flow

```cpp
// themeManager.cpp
ThemeResources LoadTheme(const std::string& themeId) {
  resources = ParseJSON("themes/midnight/resources.json");
  
  // Read user preferences
  std::string iconPack = settingsRegistry.Get("appearance.ui.icon_pack", 
                                              resources.icons.defaultPack);
  std::string buttonFamily = settingsRegistry.Get("appearance.ui.button_family",
                                                  resources.buttons.defaultFamily);
  std::string motionPreset = settingsRegistry.Get("appearance.ui.motion_preset",
                                                  resources.motion.defaultPreset);
  
  // Validate and apply
  if (!resources.icons.availablePacks.contains(iconPack)) {
    iconPack = resources.icons.defaultPack;  // fallback
  }
  
  return ThemeResources {
    .iconPack = iconPack,
    .buttonFamily = buttonFamily,
    .motionPreset = motionPreset
  };
}
```

## Settings Registry Keys

Resources are exposed to Spaces settings via these keys:

| Key | Values | Default | Example |
|-----|--------|---------|---------|
| `appearance.ui.icon_pack` | lucide, heroicons, tabler, bootstrap-icons | lucide | heroicons |
| `appearance.ui.button_family` | compact, soft, outlined, high-contrast | compact | soft |
| `appearance.ui.controls_family` | desktop-fluent, dashboard-modern, ... | desktop-fluent | dashboard-modern |
| `appearance.ui.menu_style` | standard, compact, hierarchical | standard | compact |
| `appearance.ui.fence_style` | window-frame, card-container, embedded | window-frame | card-container |
| `appearance.ui.motion_preset` | standard, quick, deliberate, minimal | standard | minimal |
| `appearance.ui.component_family` | desktop-fluent, ..., cyber-futuristic | desktop-fluent | flat-minimal |

---

## Extending Resources

### Adding a New Icon Pack

```json
{
  "ui": {
    "icons": {
      "availablePacks": ["lucide", "heroicons", "tabler", "bootstrap-icons", "feather"],
      "feather": {
        "label": "Feather Icons",
        "description": "Minimal stroke icons by Cole Bemis",
        "license": "MIT",
        "count": 287,
        "variants": ["default"],
        "url": "https://feathericons.com"
      }
    }
  }
}
```

### Adding a New Button Family

```json
{
  "ui": {
    "buttons": {
      "families": {
        "pill": {
          "label": "Pill",
          "description": "Fully rounded button",
          "availableStyles": ["primary", "secondary"],
          "sizing": { "borderRadius": "999px", "height": "size.control.lg" }
        }
      }
    }
  }
}
```

## Adapter Integration

When exporting to different targets (CSS, C++, JSON), resources are included:

### CSS Export

```css
:root {
  --theme-icon-pack: var(--appearance-ui-icon-pack, lucide);
  --theme-button-family: var(--appearance-ui-button-family, compact);
  --theme-motion-preset: var(--appearance-ui-motion-preset, standard);
  --theme-motion-duration: 400ms;
  --theme-motion-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### C++ Export

```cpp
// Generated: theme-resources.h
namespace Themes::Midnight {
  constexpr auto DefaultIconPack = "lucide";
  constexpr auto DefaultButtonFamily = "compact";
  constexpr auto MotionPresets = std::array{
    "standard", "quick", "deliberate", "minimal"
  };
}
```

## Best Practices

1. **Use defaults wisely**: Default choices should work for 90% of users
2. **Validate user choices**: Always fall back to defaults if preference unavailable
3. **Document all options**: Each resource must have a `label` and `description`
4. **Keep options bounded**: Too many choices overwhelm UI design
5. **Test all combinations**: Ensure every resource combination renders cleanly
