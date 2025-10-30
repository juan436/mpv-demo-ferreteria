/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

/**
 * Service Worker para PWA
 * Estrategia: Red primero con fallback a Cache
 */

const CACHE_NAME = 'Ferreteria-v1'
const STATIC_CACHE = 'Ferreteria-static-v1'

// Archivos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/logo.jpg',
  '/manifest.json',
  '/favicon/web-app-manifest-192x192.png',
  '/favicon/web-app-manifest-512x512.png',
  '/favicon/apple-touch-icon.png',
  '/favicon/favicon.svg',
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...')
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Cacheando archivos estáticos')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Service Worker: Eliminando cache antiguo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Estrategia de Fetch: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Solo cachear GET requests
  if (request.method !== 'GET') {
    return
  }

  // No cachear requests a la API (dejamos que IndexedDB maneje eso)
  if (request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Si falla la red, intentar desde cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Si no hay cache, retornar página offline básica
          if (request.destination === 'document') {
            return caches.match('/')
          }
        })
      })
  )
})

// Sincronización en background (cuando vuelve online)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronización en background')
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData())
  }
})

async function syncPendingData() {
  console.log('Service Worker: Sincronizando datos pendientes...')
  // La sincronización real se maneja en sync-service.ts
  // Aquí solo notificamos al cliente
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_REQUESTED',
    })
  })
}
