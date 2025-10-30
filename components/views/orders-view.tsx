/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState } from "react"
import { OrderForm } from "@/components/purchases/order"
import { useOrders } from "@/hooks/use-orders"
import type { CreateOrderData } from "@/services/order.service"

/**
 * OrdersView
 * Componente que maneja la vista de pedidos
 */
export function OrdersView() {
  const { createOrder } = useOrders()
  const [loading, setLoading] = useState(false)

  const handleCreateOrder = async (data: CreateOrderData): Promise<boolean> => {
    setLoading(true)
    const success = await createOrder(data)
    setLoading(false)
    return success
  }

  return (
    <div className="container mx-auto py-4 px-4">
      <OrderForm onSubmit={handleCreateOrder} onCancel={() => {}} loading={loading} />
    </div>
  )
}
