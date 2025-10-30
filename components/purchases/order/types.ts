/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { OrderItem } from "@/types"
import type { CreateOrderData } from "@/services/order.service"

export interface OrderFormProps {
  onSubmit: (data: CreateOrderData) => Promise<boolean>
  onCancel: () => void
  loading?: boolean
}

export interface OrderFormItem extends Omit<OrderItem, "id"> {
  tempId: string
}

export type OrderFormStep = "items" | "preview" | "details"

export interface CompareMatch {
  code: string
  name: string
  currentQty: number
  otherQty: number
}
