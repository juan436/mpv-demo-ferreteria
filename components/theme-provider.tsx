/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * ThemeProvider
 * Componente que maneja el proveedor de temas
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
