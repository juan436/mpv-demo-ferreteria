/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export interface EditItemData {
  tempId: string
  productCode: string
  productName: string
  quantity: number
}

interface EditItemDialogProps {
  open: boolean
  item: EditItemData | null
  onOpenChange: (open: boolean) => void
  onSave: (changes: { productCode: string; productName: string; quantity: number }) => void
}

export function EditItemDialog({ open, item, onOpenChange, onSave }: EditItemDialogProps) {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [qty, setQty] = useState("")

  useEffect(() => {
    if (open && item) {
      setCode(item.productCode)
      setName(item.productName)
      setQty(String(item.quantity))
    }
  }, [open, item])

  const handleSave = () => {
    const parsed = Number.parseInt(qty || "")
    if (!Number.isFinite(parsed) || parsed <= 0) return
    onSave({
      productCode: code.trim() || "nt",
      productName: name.trim(),
      quantity: parsed,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
        </DialogHeader>
        {item && (
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <Label htmlFor="editCode">Clave</Label>
              <Input id="editCode" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="editName">Nombre</Label>
              <Input id="editName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="editQty">Cantidad</Label>
              <Input
                id="editQty"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/\D+/g, ""))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!name.trim() || !(Number.parseInt(qty) > 0)}>
                Guardar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
