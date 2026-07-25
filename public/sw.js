const CACHE = 'madar-v3'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => { if (k !== CACHE) return caches.delete(k) }))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(cache => cache.put(event.request, clone))
        return res
      }))
    )
    return
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

self.addEventListener('push', event => {
  let data = { title: 'مدار', body: '' }
  try { data = event.data?.json() || data } catch {}
  const options = {
    body: data.body || data.notification?.body || '',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    tag: 'madar-notification',
    vibrate: [100, 50, 100],
    data: { url: data.data?.url || '/directory' }
  }
  event.waitUntil(self.registration.showNotification(data.title || data.notification?.title || 'مدار', options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/directory'
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    for (const client of clientList) {
      if (client.url.includes(url) && 'focus' in client) return client.focus()
    }
    return clients.openWindow(url)
  }))
})
