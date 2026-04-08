# Adapter Guide

Adapters convert a single universal theme into target-specific artifacts.

## Current Adapters

- CSS variables: adapters/css/export-css.js
- JSON bundle: adapters/json/export-json.js
- Python dictionary: adapters/python/export-python.js
- C header defines: adapters/c/export-c.js
- C++ constants header: adapters/cpp/export-cpp.js

## Adapter Inputs

Every adapter receives flattened tokens such as:

- background.primary -> #0B0F14
- text.primary -> #F5F7FA

JSON output also includes flattened semantic mappings.

## Adapter Responsibilities

- Never invent token meanings.
- Never hardcode app-specific colors.
- Fail clearly when required token data is missing.
- Keep output stable and deterministic.
