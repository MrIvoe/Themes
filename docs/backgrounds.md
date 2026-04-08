# Backgrounds

Current status:

- background configuration now has an optional preset-schema layer via the `background` object
- current implementation preserves background metadata during preset serialize/deserialize round-trips
- runtime consumption now includes bootstrapper sample rendering via `ThemePresetBackgroundBrushFactory`

Background model targets:

- solid color
- gradient
- image
- fit/fill/stretch/tile behavior
- tint and opacity
- optional blur/transparency where supported

Current runtime rendering behavior:

- `solid` mode renders a solid color brush
- `gradient` mode renders a linear gradient brush
- `image` mode attempts to load an image brush and falls back to solid if the source is unavailable
- `sizingMode` maps to WPF stretch/tile behavior (`fill`, `fit`, `stretch`, `tile`, `center`)
- `tintColor` is blended onto solid/gradient runtime brushes
- `opacity` is applied directly on the produced brush
- both bootstrapper and demo now consume preset background metadata through the shared brush factory

Current export behavior:

- exporting a built-in catalog theme now includes a default gradient background block derived from `Brush.Background`, `Brush.Surface`, and `Brush.TransparentLayer`

All background settings should support global defaults and per-Space override compatibility.
