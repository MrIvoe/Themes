# Create A Theme

1. Create a new folder under themes/<theme-id>.
2. Add theme.json with meta + tokens.
3. Add semantic.json for role mappings.
4. Run validation and build:

```bash
npm run validate
npm run build
```

## Required Theme Metadata

- meta.id (kebab-case)
- meta.name
- meta.version (x.y.z)
- meta.mode (light|dark)

## Required Token Groups

- background
- surface
- text
- accent
- border
- state
- syntax

## Validation Rules

- Token values must be valid hex colors (#RRGGBB or #RRGGBBAA).
- Semantic entries must reference real token paths.
- Missing required groups fail validation.
