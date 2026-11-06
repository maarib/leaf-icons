// Draws the app icons in app/ from icons/maples.svg: the leaf on the editor's paper colour.
// Needs Playwright with Chromium, so it isn't part of `npm run build`. Run it again only when
// the maple icon changes: `node scripts/app-icons.mjs`.

import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const root = new URL('..', import.meta.url)
const leaf = readFileSync(new URL('icons/maples.svg', root), 'utf8')
const PAPER = '#f6f3ee'

// inset: transparent margin around the tile (macOS-style icon). leafSize: leaf width as a share
// of the tile. radius: tile corner radius as a share of the tile. Maskable icons are full-bleed,
// with the leaf inside the safe zone (the middle 80%).
const ICONS = [
  { file: 'icon-512.png', size: 512, inset: 0.1, radius: 0.225, leafSize: 0.86 },
  { file: 'icon-192.png', size: 192, inset: 0.1, radius: 0.225, leafSize: 0.86 },
  { file: 'maskable-512.png', size: 512, inset: 0, radius: 0, leafSize: 0.7 },
  { file: 'apple-touch-icon.png', size: 180, inset: 0, radius: 0, leafSize: 0.8 },
]

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })
for (const { file, size, inset, radius, leafSize } of ICONS) {
  const tile = size * (1 - 2 * inset)
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<style>html,body{margin:0;background:transparent}
    .tile{position:absolute;left:${size * inset}px;top:${size * inset}px;width:${tile}px;height:${tile}px;
      border-radius:${tile * radius}px;background:${PAPER};display:grid;place-items:center}
    .tile svg{width:${tile * leafSize}px;height:${tile * leafSize}px}</style>
    <div class="tile">${leaf}</div>`)
  writeFileSync(new URL(`app/${file}`, root), await page.screenshot({ omitBackground: true }))
  console.log(`app/${file}`)
}
await browser.close()
