/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * InstallPrompt
 * Componente que maneja la vista de prompt de instalación de PWA
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isBrave, setIsBrave] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar Brave
    const detectBrave = async () => {
      if ((navigator as any).brave && await (navigator as any).brave.isBrave()) {
        setIsBrave(true)
        console.log('🦁 Brave detectado')
      }
    }
    detectBrave()

    // Verificar si ya está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)
    
    if (standalone) {
      console.log('✅ PWA: Ya está instalada')
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
      console.log('✅ PWA: Evento beforeinstallprompt capturado')
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Para Brave: mostrar banner manual después de 3 segundos si no hay evento
    const braveTimer = setTimeout(() => {
      if (!deferredPrompt && !standalone) {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
          console.log('🦁 Brave: Mostrando banner manual')
          setShowPrompt(true)
        }
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(braveTimer)
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // En Brave, redirigir a instrucciones manuales
      if (isBrave) {
        alert(
          '🦁 Brave Browser:\n\n' +
          '1. Click en el menú (☰) arriba a la derecha\n' +
          '2. Selecciona "Instalar Ferreteria..."\n' +
          '3. Confirma la instalación\n\n' +
          'O usa: Ctrl+Shift+A (Windows) / Cmd+Shift+A (Mac)'
        )
        setShowPrompt(false)
        return
      }
      
      console.warn('⚠️ PWA: No hay prompt disponible')
      return
    }

    // Mostrar el prompt de instalación
    deferredPrompt.prompt()

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice
    console.log(`👤 Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`)

    // Limpiar el prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Guardar en localStorage para no mostrar por 7 días
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // No mostrar si fue rechazado recientemente (7 días)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < sevenDays) {
        setShowPrompt(false)
      }
    }
  }, [])

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {isBrave ? 'Instalar Ferreteria' : 'Instalar Ferreteria'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {isBrave 
                ? 'Click en Instalar para ver instrucciones (Brave requiere instalación manual)' 
                : 'Instala la app para acceso rápido y uso offline'
              }
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="flex-1"
              >
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
