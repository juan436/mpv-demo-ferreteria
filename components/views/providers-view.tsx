/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { ProvidersTable } from "@/components/purchases/provider"

/**
 * ProvidersView
 * Componente que maneja la vista de proveedores
 */
export function ProvidersView() {
  return (
    <div className="container mx-auto py-4 px-4">
      <ProvidersTable />
    </div>
  )
}
