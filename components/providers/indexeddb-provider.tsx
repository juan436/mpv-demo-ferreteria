/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useEffect } from "react"
import { indexedDBService } from "@/lib/indexeddb"

/**
 * Inicializa IndexedDB al cargar la app
 * SyncService se auto-inicializa en su constructor
 */
export function IndexedDBProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initServices = async () => {
      try {
        console.log('🔄 Inicializando IndexedDB...')
        await indexedDBService.init()
        console.log('✅ IndexedDB inicializado correctamente')
      } catch (error) {
        console.error('❌ Error inicializando IndexedDB:', error)
      }
    }

    initServices()
  }, [])

  return <>{children}</>
}
