# Backgrounds

Current status:

- background configuration is a planned schema layer
- current shipped preset format does not yet include a dedicated background object
- next evolution should extend the preset contract without breaking `formatVersion = 1.0` consumers

Background model targets:

- solid color
- gradient
- image
- fit/fill/stretch/tile behavior
- tint and opacity
- optional blur/transparency where supported

All background settings should support global defaults and per-fence override compatibility.
