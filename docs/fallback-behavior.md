# Fallback Behavior

Fallback must be safe and predictable.

Required behavior:

- unknown theme ids resolve to a known-safe default
- invalid token payloads do not break host rendering
- prior valid theme remains active when replacement fails
- fallback reason is logged for diagnostics
