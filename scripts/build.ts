// Builds icons/<id>.svg from src/shapes.ts and stems.config.json, plus editor.html: a small
// editor for stem and vein settings and layer order. Run with `npm run build`.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { LEAF_COLORS, LEAF_SHAPES, TREE_ICON_IDS, type TreeIconId } from '../src/shapes.ts'
import { renderSvg } from '../src/render.js'

const root = new URL('..', import.meta.url)
const config = JSON.parse(readFileSync(new URL('stems.config.json', root), 'utf8'))

/** Each icon as named layers, back to front in its original drawing order. */
function model(id: TreeIconId) {
  const shape = LEAF_SHAPES[id]
  const { leaf, accent = leaf } = LEAF_COLORS[id]
  const leaves = shape.blades.filter((b) => !b.tone || b.tone === 'leaf').length
  const count: Record<string, number> = {}
  const next = (key: string) => (count[key] = (count[key] ?? 0) + 1)
  const layers: Record<string, unknown>[] = []
  for (const b of shape.blades) {
    if (b.tone === 'stem') layers.push({ id: 'spur', name: 'Spur', type: 'spur', d: b.d })
    else if (b.tone === 'accent') {
      const n = next('fruit')
      layers.push({ id: `fruit-${n}`, name: `Fruit ${n}`, type: 'blade', fill: 'accent', d: b.d })
    } else if (leaves === 1) layers.push({ id: 'leaf', name: 'Leaf', type: 'blade', d: b.d })
    else {
      const n = next('leaflet')
      layers.push({ id: `leaflet-${n}`, name: `Leaflet ${n}`, type: 'blade', d: b.d })
    }
  }
  if (shape.needles) layers.push({ id: 'needles', name: 'Needles', type: 'needles', strokes: shape.needles })
  const veins = shape.ink.filter((s) => s.part === 'vein')
  if (veins.length) layers.push({ id: 'veins', name: 'Veins', type: 'veins', veins })
  for (const s of shape.ink.filter((s) => s.part === 'stem')) {
    if ('d' in s) {
      const n = next('stalk')
      layers.push({ id: `stalk-${n}`, name: `Stalk ${n}`, type: 'stem', ...s })
    } else layers.push({ id: 'stem', name: 'Stem', type: 'stem', ...s })
  }
  return { id, leaf, accent, layers }
}

const models = TREE_ICON_IDS.map(model)

mkdirSync(new URL('icons', root), { recursive: true })
for (const m of models) writeFileSync(new URL(`icons/${m.id}.svg`, root), renderSvg(m, config))

const render = readFileSync(new URL('src/render.js', root), 'utf8').replaceAll(/^export /gm, '')
const template = readFileSync(new URL('scripts/editor.template.html', root), 'utf8')
writeFileSync(
  new URL('editor.html', root),
  template
    .replace('/* RENDER */', () => render)
    .replace('/* MODELS */ null', () => JSON.stringify(models))
    .replace('/* CONFIG */ null', () => JSON.stringify(config)),
)

console.log(`Built ${models.length} icons and editor.html`)
