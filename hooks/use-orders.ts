/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState, useEffect } from "react"
import type { Order } from "@/types"
import { orderService, type CreateOrderData } from "@/services/order.service"
import { syncService } from "@/lib/sync-service"

/**
 * useOrders
 * Hook personalizado para manejar órdenes
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getOrders()
      setOrders(data)
    } catch (err) {
      setError("Error al cargar pedidos")
      console.error("Error loading orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()

    // Escuchar cuando termine la sincronización para refrescar
    const listener = {
      onStatusChange: () => {},
      onSyncComplete: (success: boolean) => {
        if (success) {
          console.log('🔄 Sincronización completa, refrescando órdenes...')
          loadOrders()
        }
      },
    }

    syncService.addListener(listener)

    return () => {
      syncService.removeListener(listener)
    }
  }, [])

  const createOrder = async (data: CreateOrderData): Promise<boolean> => {
    try {
      setError(null)
      const newOrder = await orderService.createOrder(data)
      if (newOrder) {
        setOrders((prev) => [newOrder, ...prev])
        return true
      }
      return false
    } catch (err) {
      setError("Error al crear pedido")
      console.error("Error creating order:", err)
      return false
    }
  }

  const updateOrder = async (id: string, data: Partial<CreateOrderData>): Promise<boolean> => {
    try {
      setError(null)
      const updatedOrder = await orderService.updateOrder(id, data)
      if (updatedOrder) {
        setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)))
        return true
      }
      return false
    } catch (err) {
      setError("Error al actualizar pedido")
      console.error("Error updating order:", err)
      return false
    }
  }

  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await orderService.deleteOrder(id)
      if (success) {
        setOrders((prev) => prev.filter((o) => o.id !== id))
        return true
      }
      return false
    } catch (err) {
      setError("Error al eliminar pedido")
      console.error("Error deleting order:", err)
      return false
    }
  }

  const searchOrders = async (query: string): Promise<Order[]> => {
    try {
      setError(null)
      return await orderService.searchOrders(query)
    } catch (err) {
      setError("Error al buscar pedidos")
      console.error("Error searching orders:", err)
      return []
    }
  }

  const getOrdersByDateRange = async (startDate: string, endDate: string): Promise<Order[]> => {
    try {
      setError(null)
      return await orderService.getOrdersByDateRange(startDate, endDate)
    } catch (err) {
      setError("Error al filtrar pedidos por fecha")
      console.error("Error filtering orders by date:", err)
      return []
    }
  }

  const downloadOrdersReport = (ordersToExport?: Order[]) => {
    try {
      orderService.downloadOrdersReport(ordersToExport)
    } catch (err) {
      setError("Error al descargar reporte")
      console.error("Error downloading report:", err)
    }
  }

  const downloadOrderDetailReport = (order: Order) => {
    try {
      orderService.downloadOrderDetailReport(order)
    } catch (err) {
      setError("Error al descargar detalle del pedido")
      console.error("Error downloading order detail:", err)
    }
  }

  const sendOrderReportByEmail = async (orderId: string, email: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await orderService.sendOrderReportByEmail(orderId, email)
      return success
    } catch (err) {
      setError("Error al enviar reporte por correo")
      console.error("Error sending order report by email:", err)
      return false
    }
  }

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    searchOrders,
    getOrdersByDateRange,
    downloadOrdersReport,
    downloadOrderDetailReport,
    sendOrderReportByEmail,
    refresh: loadOrders,
  }
}
