/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { Order } from "@/types"

export type PeriodFilter = "all" | "today" | "week" | "month"

export interface FiltersState {
  searchQuery: string
  selectedProvider: string
  selectedPeriod: PeriodFilter
}

export interface FiltersBarProps {
  filters: FiltersState
  providers: { id: string; name: string }[]
  onChange: (next: Partial<FiltersState>) => void
}

export interface OrdersTableProps {
  orders: Order[]
  onView: (order: Order) => void
  onDelete: (order: Order) => void
}

export interface OrderDetailDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownloadExcel: (order: Order) => void
  onSend: (email: string) => void
}

export interface DeleteConfirmDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}
