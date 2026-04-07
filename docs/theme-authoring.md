# Theme Authoring

Theme authors should use canonical IDs, stable metadata, and validated token payloads.

Authoring baseline:

- canonical kebab-case theme id
- display name
- semantic version
- token map only (no host internals)
- optional metadata such as author and website

Safety:

- invalid token schema should be rejected
- fallback behavior must be deterministic
