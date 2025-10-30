/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { useOrders } from "@/hooks/use-orders"
import { useProviders } from "@/hooks/use-providers"
import type { Order } from "@/types"
import { FiltersBar } from "./filters-bar"
import { OrdersTable } from "./orders-table"
import { OrderDetailDialog } from "./order-detail-dialog"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import type { FiltersState, PeriodFilter } from "./types"
import { dateStartForPeriod, filterByProvider, filterBySearch } from "./utils"
import { Building2 } from "lucide-react"
import { notificationService } from "@/services/notification.service"

/**
 * ReportOrdersTable
 * Componente que maneja la vista de reportes de pedidos en escritorio y tablet
 */
export function ReportOrdersTable() {
  const { orders, loading, error, deleteOrder, searchOrders, getOrdersByDateRange, downloadOrderDetailReport, sendOrderReportByEmail } = useOrders()
  const { providers } = useProviders()

  const [filters, setFilters] = useState<FiltersState>({ searchQuery: "", selectedProvider: "all", selectedPeriod: "all" })
  const [list, setList] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [openSentMsg, setOpenSentMsg] = useState(false)

  const applyFilters = async (next?: Partial<FiltersState>) => {
    const f: FiltersState = { ...filters, ...(next || {}) }
    setFilters(f)

    let base = orders

    // Period filter may request server range
    if (f.selectedPeriod !== "all") {
      const now = new Date()
      const start = dateStartForPeriod(f.selectedPeriod as PeriodFilter, now)
      if (start) {
        base = await getOrdersByDateRange(start.toISOString(), now.toISOString())
      }
    }

    // Search (can hit server for better match like original)
    if (f.searchQuery.trim()) {
      base = await searchOrders(f.searchQuery)
    }

    // Provider filter (client-side)
    base = filterByProvider(base, f.selectedProvider)

    // Optional additional client search (id/user)
    base = filterBySearch(base, f.searchQuery)

    setList(base)
  }

  const displayOrders = filters.searchQuery.trim() || filters.selectedProvider !== "all" || filters.selectedPeriod !== "all" ? list : orders

  return (
    <div className="space-y-4">
      <Card className="h-[clamp(680px,88dvh,96dvh)] overflow-hidden flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Reporte de Pedidos</h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex flex-col flex-1 min-h-0">
          <FiltersBar
            filters={filters}
            providers={providers}
            onChange={(next) => {
              void applyFilters(next)
            }}
          />

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

          <div className="flex-1 min-h-0">
            <OrdersTable
              orders={displayOrders}
              onView={(order) => setSelectedOrder(order)}
              onDelete={(order) => setDeletingOrder(order)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        onDownloadExcel={(o) => downloadOrderDetailReport(o)}
        onSend={async (email: string) => {
          if (!selectedOrder) return
          const success = await sendOrderReportByEmail(selectedOrder.id, email)
          if (success) {
            notificationService.success(
              "Reporte enviado",
              `El reporte del pedido #${selectedOrder.invoiceCode} ha sido enviado a ${email}`
            )
          } else {
            notificationService.error(
              "Error al enviar",
              "No se pudo enviar el reporte por correo. Intenta nuevamente."
            )
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        order={deletingOrder}
        open={!!deletingOrder}
        onOpenChange={(open) => !open && setDeletingOrder(null)}
        onConfirm={async () => {
          if (!deletingOrder) return
          const success = await deleteOrder(deletingOrder.id)
          if (success) setDeletingOrder(null)
        }}
      />

      {/* Mensaje de enviado (desktop/tablet) */}
      <Dialog open={openSentMsg} onOpenChange={setOpenSentMsg}>
        {/* Re-usa Dialog de UI library para consistencia visual */}
        {/* Solo mensaje simple, como en implementación original */}
      </Dialog>
    </div>
  )
}
