/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableContainer } from "@/components/ui/table"
import { Trash2, Pencil } from "lucide-react"
import { DuplicateBadge } from "./duplicate-badge"
import type { OrderFormItem } from "./types"
import { getDuplicateCountForItem } from "./utils"
import { EditItemDialog, type EditItemData } from "./edit-item-dialog"

interface ItemsTableProps {
  items: OrderFormItem[]
  duplicateCounts: Map<string, number>
  onRemove: (tempId: string) => void
  onUpdate: (tempId: string, changes: { productCode: string; productName: string; quantity: number }) => void
}

export function ItemsTable({ items, duplicateCounts, onRemove, onUpdate }: ItemsTableProps) {
  const getDuplicateCount = (item: { productCode: string; productName: string }) =>
    getDuplicateCountForItem(item, duplicateCounts)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EditItemData | null>(null)

  const startEdit = (it: OrderFormItem) => {
    setEditing({ tempId: it.tempId, productCode: it.productCode, productName: it.productName, quantity: it.quantity })
    setOpen(true)
  }
  const saveEdit = (changes: { productCode: string; productName: string; quantity: number }) => {
    if (!editing) return
    onUpdate(editing.tempId, changes)
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Productos agregados ({items.length})</h3>
      <TableContainer maxHeight="h-64">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clave</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const count = getDuplicateCount({ productCode: item.productCode, productName: item.productName })
              return (
                <TableRow key={item.tempId} className={count > 1 ? "bg-yellow-50" : undefined}>
                  <TableCell className="font-mono">
                    {item.productCode}
                    <DuplicateBadge count={count} className="ml-2" />
                  </TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => startEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onRemove(item.tempId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <EditItemDialog
        open={open}
        item={editing}
        onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null) }}
        onSave={saveEdit}
      />
    </div>
  )
}
