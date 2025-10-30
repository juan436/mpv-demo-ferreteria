/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, ShoppingCart, Pencil } from "lucide-react"
import { DuplicateBadge } from "./duplicate-badge"
import type { OrderFormItem } from "./types"
import { getDuplicateCountForItem } from "./utils"
import { EditItemDialog, type EditItemData } from "./edit-item-dialog"

interface ItemsMobileCartProps {
  items: OrderFormItem[]
  duplicateCounts: Map<string, number>
  totalItems: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove: (tempId: string) => void
  onUpdate: (tempId: string, changes: { productCode: string; productName: string; quantity: number }) => void
}

export function ItemsMobileCart({
  items,
  duplicateCounts,
  totalItems,
  open,
  onOpenChange,
  onRemove,
  onUpdate,
}: ItemsMobileCartProps) {
  const getDuplicateCount = (item: { productCode: string; productName: string }) =>
    getDuplicateCountForItem(item, duplicateCounts)

  if (items.length === 0) return null

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<EditItemData | null>(null)

  const startEdit = (it: OrderFormItem) => {
    setEditing({ tempId: it.tempId, productCode: it.productCode, productName: it.productName, quantity: it.quantity })
    setEditOpen(true)
  }
  const saveEdit = (changes: { productCode: string; productName: string; quantity: number }) => {
    if (!editing) return
    onUpdate(editing.tempId, changes)
    setEditOpen(false)
    setEditing(null)
  }

  return (
    <>
      {/* Floating Cart Button */}
      <Button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {items.length}
          </Badge>
        </div>
      </Button>

      {/* Cart Modal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] h-[50dvh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Productos en el Pedido</DialogTitle>
            <DialogDescription>
              {items.length} productos, {totalItems} unidades totales
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2 p-1">
              {items.map((item) => {
                const count = getDuplicateCount({ productCode: item.productCode, productName: item.productName })
                return (
                  <div
                    key={item.tempId}
                    className={`flex items-center justify-between p-2 border rounded-md ${
                      count > 1 ? "bg-yellow-50 border-yellow-300" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-white px-2 py-1 rounded border text-gray-600">
                          {item.productCode}
                        </span>
                        <DuplicateBadge count={count} />
                        <span className="font-medium text-sm truncate">{item.productName}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(item)} className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(item.tempId)}
                        className="ml-1 flex-shrink-0 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (shared) */}
      <EditItemDialog
        open={editOpen}
        item={editing}
        onOpenChange={(o) => { setEditOpen(o); if (!o) setEditing(null) }}
        onSave={saveEdit}
      />
    </>
  )
}
