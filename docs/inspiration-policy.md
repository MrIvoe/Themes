# Inspiration Policy for External UI Kits and Design Systems

## Overview

The Spaces Themes repo uses external UI kits and design systems as **inspiration and reference only**. This policy clarifies how external sources inform our design work while maintaining independence, avoiding code duplication, and ensuring proper attribution.

## Core Rules

### 1. **No Direct Code Copy**

- ❌ DO NOT copy implementation code, class names, or specific identifiers from external frameworks
- ✅ DO study component contracts, state machines, and accessibility patterns
- ✅ DO learn naming conventions and semantic structures
- ✅ DO reference visual patterns and interaction design choices

### 2. **Semantic Independence**

The Themes repo maintains framework-agnostic component contracts:

```
External Framework    →    Pattern Study    →    Semantic Token/Contract
(Material, Fluent)        (state machine,       (btn.primary, switch.on/off,
                           accessibility)        menu state, etc.)
```

Example:
- **Material Design** teaches us multi-state button patterns (hover, active, focus, disabled)
- **We translate** this into semantic tokens: `button.primary`, `button.secondary`, etc.
- **We avoid** Material-specific names like "@material/Button" or Material's color variables

### 3. **Attribution and Transparency**

All external inspirations are documented in three places:

- `references/ui-libraries.json` — sources with license and usage purpose
- `references/inspiration-catalog.json` — explicit mapping of which source inspired which area
- `docs/spirit-references.md` (this file) — policy and rationale

### 4. **Component Family Derivation**

The five component style families (`desktop-fluent`, `dashboard-modern`, `flat-minimal`, `soft-mobile`, `cyber-futuristic`) are **inspired by but not copied from** external systems:

| Family | Primary Inspiration | Do | Don't |
|--------|-------------------|------|------|
| desktop-fluent | Microsoft Fluent, WinUI | Reference depth, layering, command-bar patterns | Use Fluent control names, copy Fluent code |
| dashboard-modern | Tabler, Ant Design, Element | Reference metric card layouts, filters | Copy Ant Design token names or component APIs |
| flat-minimal | FlatUI, shadcn | Reference flat aesthetic, minimal shadows | Use Bootstrap utility classes, copy component markup |
| soft-mobile | Flutter UI Kit, Kitten Tricks | Reference touch-friendly sizes, round corners | Copy Flutter widget handling or React Native patterns |
| cyber-futuristic | Bevypunk, Discord Cyberpunk | Reference neon colors, glow effects | Use specific theme CSS or embed themed assets |

## Application Areas

### Component Contracts (✅ Inspired)

Contracts define **what** a component looks like and **what states** it has, not how it's implemented:

```json
{
  "button": {
    "states": ["default", "hover", "active", "focus", "disabled"],
    "properties": {
      "backgroundColor": "token",
      "textColor": "token",
      "borderRadius": "token"
    }
  }
}
```

This is inspired by Material, Radix, and Ant Design. It is NOT copied from any of them.

### Icon Packs (✅ Referenced)

Icon packs (Lucide, Heroicons, Tabler, Bootstrap Icons) are third-party assets under their own licenses. They are **integrated and attributed**, not inspirational:

- Lucide: ISC license
- Heroicons: MIT license
- Tabler: MIT license
- Bootstrap Icons: MIT license

Each pack is **optional** and independently selectable by theme.

### Motion Presets (✅ Inspired)

Motion timing and easing values are inspired by Material Design and Framer Motion:

```json
{
  "standard": {
    "duration": "400ms",
    "easing": "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
  }
}
```

This pattern is reference material; we do not embed Material-specific animation libraries.

## External References

### Reference Categories

#### A. Design Systems (Pattern Reference)
- Material Design (Google) — state machines, accessibility
- Fluent Design (Microsoft) — depth, layering, desktop patterns
- Component driven systems (Radix, shadcn, Ant Design) — naming, state coverage

#### B. UI Kits (Organization Reference)
- Bootstrap — component role taxonomy
- Tabler, Element — dashboard patterns
- Flutter UI Kit — mobile patterns

#### C. Aesthetic References (Visual Inspiration)
- FlatUI — flat minimalism
- Kitten Tricks — soft interactions
- Bevypunk — cyberpunk aesthetics
- Discord Cyberpunk — neon/high-contrast

#### D. Technical References (Architecture)
- SnapKit — layout/spacing hierarchies
- Tamagui — cross-platform design tokens
- Radix — accessibility and headless component patterns

## Licensing Considerations

### Our Position

`@mrivoe/themes` is **private** (not publicly redistributed). Therefore:

1. Using external systems as **reference** is covered under fair use
2. No code from external systems is embedded or distributed
3. When moving to public release, full license verification will occur
4. Attribution will be added to README for any derived patterns

### Reference-Only Status

All UI libraries listed in `references/ui-libraries.json` are **reference_only**, meaning:

- ✅ We study their documentation and patterns
- ✅ We learn from their design decisions
- ✅ We credit them in our references
- ❌ We do not embed their code, CSS, or specific artifacts
- ❌ We do not claim they endorse our work

### Icon Packs

Icon packs are **included and attributed** under their respective licenses:

- Each pack retains its original license
- Pack licenses are documented when themes are exported
- Icon names and pack IDs are mapped but not derived from source code

## Design Process

### How We Use References

1. **Research Phase**: Study external system documentation, component hierarchies, interaction patterns
2. **Pattern Extraction**: Identify key contracts (states, accessibility, visual hierarchy)
3. **Translation**: Convert patterns into semantic terms (e.g., "Material's tonal variant" → "soft primary")
4. **Implementation**: Code components using our own semantic token system
5. **Documentation**: Record which sources informed which components in `inspiration-catalog.json`

### Example: Button Component

```
Research: Material, Fluent, shadcn   →  Learn: 4-5 button states common across systems
Extract Pattern: clicked, hovered, disabled, focused, loading   →  Common pattern
Translate to Tokens: btn.primary, btn.secondary, etc.   →  Semantic names
Implement: Use our tokens, NOT external names/code
Document: "Button states inspired by Material, Fluent, Radix pattern studies"
```

## Public Release Checklist

When transitioning `@mrivoe/themes` from private to public:

- [ ] All external sources verified for license compatibility
- [ ] References clearly documented in README.md
- [ ] Attribution section added with links
- [ ] Icon pack licenses explicitly stated in output adapters
- [ ] `inspiration-policy.md` included in distribution
- [ ] No embedded code, CSS, or assets from external systems
- [ ] Component contracts are our own semantic inventions

## Questions?

This policy ensures we:

✅ Learn from the best UI/UX research available  
✅ Maintain independence in our design system  
✅ Respect external projects' intellectual property  
✅ Stay transparent about our inspirations  
✅ Build something that's genuinely Spaces' own  

The external systems are teachers and reference materials. Our components, tokens, and families are our own.
