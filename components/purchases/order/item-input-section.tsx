/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface ItemInputSectionProps {
  productCode: string
  productName: string
  quantity: string
  errors: Record<string, string>
  onProductCodeChange: (value: string) => void
  onProductNameChange: (value: string) => void
  onQuantityChange: (value: string) => void
  onAdd: () => void
}

export function ItemInputSection({
  productCode,
  productName,
  quantity,
  errors,
  onProductCodeChange,
  onProductNameChange,
  onQuantityChange,
  onAdd,
}: ItemInputSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="productCode">Clave Producto</Label>
        <Input
          id="productCode"
          value={productCode}
          onChange={(e) => onProductCodeChange(e.target.value)}
          placeholder="Ej: TOR001"
          className={errors.productCode ? "border-red-500 focus-visible:ring-red-500" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="productName">Nombre Producto</Label>
        <Input
          id="productName"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
          placeholder="Ej: Tornillo 1/4"
          className={errors.productName ? "border-red-500 focus-visible:ring-red-500" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Cantidad</Label>
        <Input
          id="quantity"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Ej: 1"
          autoComplete="off"
          value={quantity}
          onChange={(e) => {
            // permitir solo dígitos
            const onlyDigits = e.target.value.replace(/\D+/g, "")
            onQuantityChange(onlyDigits)
          }}
          className={errors.quantity ? "border-red-500 focus-visible:ring-red-500" : undefined}
        />
      </div>

      <div className="flex items-end">
        <Button onClick={onAdd} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>
    </div>
  )
}
