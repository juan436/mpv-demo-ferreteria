/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, User, Eye, Trash2 } from "lucide-react"
import type { MobileListProps } from "./types"
import { formatAnyDateLocal } from "@/components/purchases/order/utils"

export function MobileOrdersList({ orders, onView, onDelete }: MobileListProps) {
  if (orders.length === 0) {
    return null
  }

  return (
    <div
      className="overflow-y-auto h-full"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + var(--pb, 22px))'
      }}
    >
      <div className="divide-y divide-gray-200">
        {orders.map((order, index) => (
          <div
            key={`order-${index}`}
            onClick={() => onView(order)}
            className="px-2 py-1 active:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-gray-500" />
                  <span className="font-medium text-[13px] text-gray-900 truncate">
                    {order.providerName} — {order.invoiceCode}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] leading-4 text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {formatAnyDateLocal(order.date)}
                  </span>
                  <span className="inline-flex items-center gap-1 truncate">
                    <User className="h-2.5 w-2.5" />
                    <span className="truncate">{order.userName}</span>
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] leading-4 text-gray-600">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items • {order.items.length} productos
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(order)
                  }}
                  className="h-6 w-6"
                  aria-label="Ver detalle"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(order)
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-6 w-6"
                  aria-label="Eliminar pedido"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
