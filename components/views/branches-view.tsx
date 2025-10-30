/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { BranchesTable } from "@/components/admin/branch/branch"

/**
 * BranchesView
 * Componente que maneja la vista de sucursales
 */
export function BranchesView() {
  return (
    <div className="container mx-auto py-4 px-4">
      <BranchesTable />
    </div>
  )
}
