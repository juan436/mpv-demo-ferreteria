/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { UsersTable } from "@/components/admin/user/user"

/**
 * UsersView
 * Componente que maneja la vista de usuarios
 */
export function UsersView() {
  return (
    <div className="container mx-auto py-4 px-4">
      <UsersTable />
    </div>
  )
}
