/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { Order } from "@/types"

export interface MobileListProps {
  orders: Order[]
  onView: (order: Order) => void
  onDelete: (order: Order) => void
}

export interface MobileDetailDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownloadExcel: (order: Order) => void
  onSend: (email: string) => void
}

export interface MobileDeleteDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}
