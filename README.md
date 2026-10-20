# Leaf icons

Tree-group leaf icons (maples, oaks, birches, …) on a 100×100 grid, with stems and veins you can restyle from one config file. The leaf shapes are ported unchanged from canopy's `src/lib/leafShapes.ts` (at `aff70e9`).

## Editing

Open `editor.html` in a browser (or the published copy, which saves your edits so Claude can read them back).

- **Stem**: width, stalk length (how far it hangs below the leaf), midrib (how far it runs up the leaf), color.
- **Veins**: show or hide, width, length (scaled from the midrib), color.
- **All icons / This icon**: settings apply everywhere, or to the current icon only. Icons with their own settings get a dot in the list.
- **Layers**: each leaf, leaflet, fruit, needle tuft, vein group and stem is a layer. Click a shape or a row to select it, then move it with the buttons or `]` / `[` (add Shift for front / to back).

Then click **Copy settings**, paste into `stems.config.json`, and run `npm run build` (Node 22.18+, no dependencies). That regenerates `icons/*.svg` and `editor.html`.

```json
{
  "stem":  { "width": 6.4, "color": "#2d3550", "length": 0, "midrib": 0 },
  "veins": { "show": true, "width": 4.6, "color": "#2d3550", "length": 1 },
  "icons": {
    "ashes": { "order": ["leaflet-2", "leaflet-1", "stem", "leaflet-3"], "stem": { "length": 4 } }
  }
}
```

`order` lists layer ids back to front; layers it leaves out keep their default place on top. The defaults reproduce the original icons exactly.

## How parts are tagged

In `src/shapes.ts`, stems and veins are kept as geometry rather than finished paths, so length can change:

- **Stem** (`stemInto`): stalk and midrib. The cherry stalks are fixed paths: their width follows the stem setting, their length does not. The larch spur is a filled dot in the stem color.
- **Vein**: a curve from the midrib out to a tip, scaled from where it leaves the midrib.

A stroke's width is `k × width` for its part, so strokes that were drawn thinner (maple's lower veins, the cherry stalks) keep their proportions. `src/render.js` draws an icon from this; the build and the editor both use it.

## Output

Each `icons/<id>.svg` uses classes, so CSS can still override the baked-in values:

```html
<svg class="leaf leaf-maples">
  <path class="blade" …/>
  <g class="veins" data-layer="veins" stroke="…">…</g>   <!-- omitted when veins.show is false -->
  <path class="stem" data-layer="stem" stroke="…"/>
</svg>
```

For example, `.leaf .stem { stroke: currentColor }` makes the stems follow the text color.
