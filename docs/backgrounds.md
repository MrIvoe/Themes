# Backgrounds

Current status:

- background configuration now has an optional preset-schema layer via the `background` object
- current implementation preserves background metadata during preset serialize/deserialize round-trips
- runtime consumption can expand incrementally without breaking `formatVersion = 1.0` consumers

Background model targets:

- solid color
- gradient
- image
- fit/fill/stretch/tile behavior
- tint and opacity
- optional blur/transparency where supported

All background settings should support global defaults and per-fence override compatibility.
