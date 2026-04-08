# Universal Token System

## Core Rule

A theme describes what a color means, not where it is used.

## Canonical Token Naming

Use semantic token paths in dot notation:

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

## Naming Anti-Patterns

Avoid framework-specific names inside theme source files:

- htmlBlue
- cppErrorRed
- pythonWindowBg
- buttonBlue

These names belong in adapters and semantic maps, not in raw theme tokens.
