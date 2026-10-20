# Leaf icons

Tree-group leaf icons (maples, oaks, birches, …) on a 100×100 grid, with stems and veins you can restyle from one config file. The leaf shapes are ported unchanged from canopy's `src/lib/leafShapes.ts` (at `aff70e9`).

## Editing stems

1. Open `preview.html` in a browser. Adjust stem width and color, and vein visibility, width and color.
2. Click **Copy settings** and paste the result into `stems.config.json`.
3. Run `npm run build` (Node 22.18+, no dependencies). This regenerates `icons/*.svg` and `preview.html`.

```json
{
  "stem":  { "width": 6.4, "color": "#2d3550" },
  "veins": { "show": true, "width": 4.6, "color": "#2d3550" }
}
```

The defaults reproduce the original icons exactly.

## How parts are tagged

In `src/shapes.ts`, every stroke drawn over a leaf has a `part`:

- **`stem`**: the leaf stalk and midrib (`stemInto`), the cherry stalks and the larch spur (a filled dot in the stem color).
- **`vein`**: side veins (`pairs`, plus the oak and basswood curves).

A stroke's width is `k × width` for its part. Most strokes use `k = 1`. A few keep their original proportions, such as maple's smaller lower veins (`4 / 4.6`) and the thinner cherry stalks (`5 / 6.4`).

## Output

Each `icons/<id>.svg` uses classes, so CSS can still override the baked-in values:

```html
<svg class="leaf leaf-maples">
  <path class="blade" …/>
  <g class="veins" stroke="…">…</g>   <!-- omitted when veins.show is false -->
  <g class="stems" stroke="…">…</g>
</svg>
```

For example, `.leaf .stems { stroke: currentColor }` makes the stems follow the text color.
