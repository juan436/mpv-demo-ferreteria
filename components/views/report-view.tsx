/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { Suspense } from "react"
import { ReportOrdersTable } from "@/components/purchases/report/view-tablet"
import { ReportOrdersMobileView } from "@/components/purchases/report/view-mobile"

/**
 * ReportView
 * Componente que maneja la vista de reportes
 */
export function ReportView() {
  return (
    <div className="container mx-auto py-4 px-4 space-y-4">
      {/* Mobile */}
      <div className="block md:hidden">
        <Suspense fallback={<div className="py-8 text-center text-gray-600">Cargando reporte...</div>}>
          <ReportOrdersMobileView />
        </Suspense>
      </div>

      {/* Desktop/Tablet */}
      <div className="hidden md:block">
        <Suspense fallback={<div className="py-8 text-center text-gray-600">Cargando reporte...</div>}>
          <ReportOrdersTable />
        </Suspense>
      </div>
    </div>
  )
}
