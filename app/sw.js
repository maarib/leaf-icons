// Keeps the editor working offline once it has been opened. Pages are fetched fresh when there is
// a connection, so a push to main shows up on the next launch; the cached copy is the fallback.

const CACHE = 'leaf-icons'
const SHELL = ['./', 'manifest.webmanifest', 'app/icon-192.png', 'app/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
  if (url.origin !== location.origin && !fonts) return

  if (fonts) {
    // Fonts never change at a given URL: serve from cache, fetch once.
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => store(request, res))),
    )
    return
  }
  // Everything else: network first, cache as fallback.
  event.respondWith(
    fetch(request)
      .then((res) => store(request, res))
      .catch(() => caches.match(request, { ignoreSearch: true }).then((hit) => hit || caches.match('./'))),
  )
})

function store(request, res) {
  if (res.ok || res.type === 'opaque') {
    const copy = res.clone()
    caches.open(CACHE).then((cache) => cache.put(request, copy))
  }
  return res
}
