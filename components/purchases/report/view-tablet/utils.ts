/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { Order } from "@/types"
import type { PeriodFilter } from "./types"

export function filterBySearch(orders: Order[], query: string): Order[] {
  const q = query.trim().toLowerCase()
  if (!q) return orders
  return orders.filter((o) =>
    o.providerName.toLowerCase().includes(q) ||
    o.userName.toLowerCase().includes(q) ||
    o.id.toLowerCase().includes(q),
  )
}

export function filterByProvider(orders: Order[], providerId: string): Order[] {
  if (!providerId || providerId === "all") return orders
  return orders.filter((o) => o.providerId === providerId)
}

export function dateStartForPeriod(period: PeriodFilter, now: Date = new Date()): Date | null {
  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1)
    default:
      return null
  }
}
