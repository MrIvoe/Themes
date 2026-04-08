# Cross-Repo Theme Contract

Status: active
Contract version: 1.0.0
Updated: 2026-04-08

## Purpose

Define the public contract between Themes, Spaces, and Spaces-Plugins for token bundles, semantic mappings, compatibility, and fallback behavior.

## Source Of Truth

- Themes is the canonical source for token schema and semantic mapping schema.
- Spaces consumes exported semantic outputs and applies platform adapters.
- Spaces-Plugins consume host-provided semantic tokens and avoid direct palette coupling.

## Canonical Namespaces

- `mrivoe.theme`
- `mrivoe.theme.tokens`
- `mrivoe.theme.semantic`
- `mrivoe.theme.win32` (adapter-specific surface)

## Token Bundle Contract

Required:
- Stable token paths with semantic meaning.
- Deterministic adapter export output for identical inputs.
- Contract version compatibility declaration.

Validation:
- Token colors must be valid hex values.
- Required token groups must exist.
- Semantic references must resolve.

## Semantic Mapping Contract

Required:
- Semantic keys map to existing token paths.
- Canonical semantic key names remain stable across minor versions.

## Compatibility Rules

- Major contract changes require a contract version bump.
- Minor changes may add new optional semantic keys.
- Patch changes are non-breaking clarifications.

## Fallback Rules

- Producers must keep schema validation strict.
- Consumers use default/fallback values for missing keys and log diagnostics.
- Invalid packages are rejected by consumers without forcing partial runtime state.

## Error Handling Expectations

- Validation failures must include machine-readable and user-readable context.
- Outputs must never include executable payloads.
- Contract docs and schema updates must ship together.
