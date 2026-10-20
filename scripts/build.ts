// Builds icons/<id>.svg from src/shapes.ts and stems.config.json, plus preview.html with
// live controls for the stem and vein settings. Run with `npm run build`.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { LEAF_COLORS, LEAF_SHAPES, TREE_ICON_IDS, type LeafShape, type PartStroke, type TreeIconId } from '../src/shapes.ts'

type Config = {
  stem: { width: number; color: string }
  veins: { show: boolean; width: number; color: string }
}

const root = new URL('..', import.meta.url)
const config: Config = JSON.parse(readFileSync(new URL('stems.config.json', root), 'utf8'))

const r = (n: number) => +n.toFixed(2)

// ── Standalone SVGs: values baked in, with classes so CSS can still override them ──

function svg(id: TreeIconId, shape: LeafShape): string {
  const { leaf, accent = leaf } = LEAF_COLORS[id]
  const fill = { leaf, accent, stem: config.stem.color }
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="leaf leaf-${id}">`]
  for (const b of shape.blades) out.push(`  <path class="${b.tone === 'stem' ? 'stem-fill' : 'blade'}" fill="${fill[b.tone ?? 'leaf']}" d="${b.d}"/>`)
  if (shape.needles) {
    out.push(`  <g class="needles" fill="none" stroke="${leaf}" stroke-linecap="round">`)
    for (const n of shape.needles) out.push(`    <path stroke-width="${n.width}" d="${n.d}"/>`)
    out.push('  </g>')
  }
  // Veins first so the stem (which runs up the midrib) sits on top where they meet.
  const group = (cls: string, color: string, width: number, strokes: PartStroke[]) => {
    if (!strokes.length) return
    out.push(`  <g class="${cls}" fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">`)
    for (const s of strokes) out.push(`    <path stroke-width="${r(width * (s.k ?? 1))}" d="${s.d}"/>`)
    out.push('  </g>')
  }
  if (config.veins.show) group('veins', config.veins.color, config.veins.width, shape.ink.filter((s) => s.part === 'vein'))
  group('stems', config.stem.color, config.stem.width, shape.ink.filter((s) => s.part === 'stem'))
  out.push('</svg>')
  return out.join('\n') + '\n'
}

mkdirSync(new URL('icons', root), { recursive: true })
for (const id of TREE_ICON_IDS) writeFileSync(new URL(`icons/${id}.svg`, root), svg(id, LEAF_SHAPES[id]))

// ── Preview: the same icons inline, styled by CSS variables the controls change ──

function inline(id: TreeIconId, shape: LeafShape): string {
  const { leaf, accent = leaf } = LEAF_COLORS[id]
  const k = (s: PartStroke) => (s.k ? ` style="--k:${s.k}"` : '')
  const parts = [
    ...shape.blades.map((b) =>
      b.tone === 'stem' ? `<path class="stem-fill" d="${b.d}"/>` : `<path fill="${b.tone === 'accent' ? accent : leaf}" d="${b.d}"/>`,
    ),
    ...(shape.needles ?? []).map((n) => `<path class="needle" stroke="${leaf}" stroke-width="${n.width}" d="${n.d}"/>`),
    ...shape.ink.filter((s) => s.part === 'vein').map((s) => `<path class="vein"${k(s)} d="${s.d}"/>`),
    ...shape.ink.filter((s) => s.part === 'stem').map((s) => `<path class="stem"${k(s)} d="${s.d}"/>`),
  ]
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${parts.join('')}</svg>`
}

const cards = TREE_ICON_IDS.map(
  (id) => `<figure>${inline(id, LEAF_SHAPES[id])}<figcaption>${id}</figcaption></figure>`,
).join('\n      ')

const template = readFileSync(new URL('scripts/preview.template.html', root), 'utf8')
writeFileSync(
  new URL('preview.html', root),
  template.replace('<!-- ICONS -->', cards).replace('/* CONFIG */ null', JSON.stringify(config)),
)

console.log(`Built ${TREE_ICON_IDS.length} icons and preview.html`)
