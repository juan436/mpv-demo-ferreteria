/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useEffect } from "react"

/**
 * PWAInstaller
 * Componente que maneja la instalación de PWA
 */
export function PWAInstaller() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope)

          // Escuchar mensajes del Service Worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SYNC_REQUESTED') {
              console.log('🔄 Service Worker solicita sincronización')
              // El sync-service manejará esto automáticamente
            }
          })

          // Verificar actualizaciones cada hora
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        })
        .catch((error) => {
          console.error('❌ Error registrando Service Worker:', error)
        })

      // Detectar cuando el Service Worker está listo
      navigator.serviceWorker.ready.then(() => {
        console.log('✅ Service Worker listo')
      })
    }
  }, [])

  return null
}
