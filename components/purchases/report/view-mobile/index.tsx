/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useOrders } from "@/hooks/use-orders"
import type { Order } from "@/types"
import { MobileSearchBar } from "./search-bar"
import { MobileOrdersList } from "./mobile-list"
import { MobileDetailDialog } from "./mobile-detail-dialog"
import { MobileDeleteDialog } from "./mobile-delete-dialog"
import { Building2 } from "lucide-react"
import { notificationService } from "@/services/notification.service"

/**
 * ReportOrdersMobileView
 * Componente que maneja la vista de reportes de pedidos en móvil
 */
export function ReportOrdersMobileView() {
  const { orders, loading, error, deleteOrder, searchOrders, downloadOrdersReport, downloadOrderDetailReport, sendOrderReportByEmail } = useOrders()

  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [openSentMsg, setOpenSentMsg] = useState(false)

  const displayOrders = useMemo(() => (searchQuery.trim() ? filteredOrders : orders), [orders, filteredOrders, searchQuery])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    let filtered = orders
    if (query.trim()) {
      filtered = await searchOrders(query)
    }
    setFilteredOrders(filtered)
  }

  useEffect(() => {
    const onExport = () => {
      downloadOrdersReport(displayOrders)
    }
    const onSendEmail = () => {
      // Mantener reservado por si se activa en el futuro
    }
    window.addEventListener("orders-mobile-export", onExport)
    window.addEventListener("orders-mobile-send-email", onSendEmail)
    return () => {
      window.removeEventListener("orders-mobile-export", onExport)
      window.removeEventListener("orders-mobile-send-email", onSendEmail)
    }
  }, [displayOrders, downloadOrdersReport])

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return
    const success = await deleteOrder(deletingOrder.id)
    if (success) setDeletingOrder(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-[clamp(400px,80dvh,96dvh)] max-[360px]:h-[clamp(360px,68dvh,86dvh)] max-[340px]:h-[clamp(320px,60dvh,82dvh)] overflow-hidden flex flex-col">
      {/* Header */}
      < div className="flex items-center justify-between" >
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Reporte de Pedidos</h1>
        </div>
      </div >
      
      <MobileSearchBar value={searchQuery} onChange={handleSearch} />

      {error && <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">{error}</div>}

      <div className="flex-1 min-h-0 [--pb:14px] max-[360px]:[--pb:68px] max-[340px]:[--pb:74px] max-[320px]:[--pb:80px] min-[480px]:[--pb:20px] min-[560px]:[--pb:16px]">
        <MobileOrdersList
          orders={displayOrders}
          onView={(o) => setSelectedOrder(o)}
          onDelete={(o) => setDeletingOrder(o)}
        />
      </div>

      {/* Order Detail Dialog */}
      <MobileDetailDialog
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
      <MobileDeleteDialog
        order={deletingOrder}
        open={!!deletingOrder}
        onOpenChange={(open) => !open && setDeletingOrder(null)}
        onConfirm={handleDeleteOrder}
      />

      {/* Mensaje de enviado (móvil) */}
      <Dialog open={openSentMsg} onOpenChange={setOpenSentMsg}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mensaje</DialogTitle>
            <DialogDescription>enviado</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
