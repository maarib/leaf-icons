// Draws one icon as SVG from its layer model (built from src/shapes.ts by scripts/build.ts)
// and the stem settings (stems.config.json). Shared by the build and editor.html, so the
// editor shows exactly what the build writes. Plain JS: the editor inlines this file.

const f = (n) => +n.toFixed(2)
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

/** Global stem and vein settings with this icon's overrides on top. */
export function resolve(config, id) {
  const own = config.icons?.[id] ?? {}
  return { stem: { ...config.stem, ...own.stem }, veins: { ...config.veins, ...own.veins } }
}

/** Layer ids back to front: the icon's saved order, then any layers it doesn't mention. */
export function order(model, config) {
  const ids = model.layers.map((l) => l.id)
  const saved = (config.icons?.[model.id]?.order ?? []).filter((id) => ids.includes(id))
  return [...saved, ...ids.filter((id) => !saved.includes(id))]
}

/** Stalk below the leaf curving up into the midrib; `length` extends the stalk, `midrib` the line up the leaf. */
function stemPath(s, stem) {
  const foot = s.foot + stem.length
  const top = clamp(s.top - stem.midrib, 2, foot - 16)
  return `M${f(50 + s.bend)} ${f(foot)}Q50 ${f(foot - 6)} 50 ${f(foot - 16)}L50 ${f(top)}`
}

/** Vein scaled from where it leaves the midrib. */
function veinPath(v, length) {
  const at = (p) => [v.a[0] + (p[0] - v.a[0]) * length, v.a[1] + (p[1] - v.a[1]) * length]
  const [c, b] = [at(v.c), at(v.b)]
  return `M${f(v.a[0])} ${f(v.a[1])}Q${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}`
}

const ROUND = 'fill="none" stroke-linecap="round" stroke-linejoin="round"'

function layer(l, model, { stem, veins }) {
  const tag = `data-layer="${l.id}"`
  switch (l.type) {
    case 'blade':
      return `<path class="blade" ${tag} fill="${l.fill === 'accent' ? model.accent : model.leaf}" d="${l.d}"/>`
    case 'spur':
      return `<path class="stem-fill" ${tag} fill="${stem.color}" d="${l.d}"/>`
    case 'needles':
      return `<g class="needles" ${tag} fill="none" stroke="${model.leaf}" stroke-linecap="round">${l.strokes
        .map((n) => `<path stroke-width="${n.width}" d="${n.d}"/>`)
        .join('')}</g>`
    case 'veins':
      if (!veins.show) return ''
      return `<g class="veins" ${tag} ${ROUND} stroke="${veins.color}">${l.veins
        .map((v) => `<path stroke-width="${f(veins.width * (v.k ?? 1))}" d="${veinPath(v, veins.length)}"/>`)
        .join('')}</g>`
    case 'stem': {
      const d = l.d ?? stemPath(l, stem)
      return `<path class="stem" ${tag} ${ROUND} stroke="${stem.color}" stroke-width="${f(stem.width * (l.k ?? 1))}" d="${d}"/>`
    }
  }
}

/** The icon as a standalone SVG document. Classes and data-layer let CSS and the editor find each part. */
export function renderSvg(model, config) {
  const settings = resolve(config, model.id)
  const byId = Object.fromEntries(model.layers.map((l) => [l.id, l]))
  const body = order(model, config)
    .map((id) => layer(byId[id], model, settings))
    .filter(Boolean)
  return [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="leaf leaf-${model.id}">`, ...body.map((b) => '  ' + b), '</svg>'].join('\n') + '\n'
}
