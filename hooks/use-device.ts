/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState, useEffect } from "react"

export type DeviceType = "mobile" | "tablet" | "desktop"

/**
 * useDevice
 * Hook personalizado para manejar el tipo de dispositivo
 */
export function useDevice() {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const checkDevice = () => {
      const width = window.innerWidth

      if (width < 768) {
        setDeviceType("mobile")
      } else if (width < 1024) {
        setDeviceType("tablet")
      } else {
        setDeviceType("desktop")
      }
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)

    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return {
    deviceType,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop",
    isMounted,
  }
}
