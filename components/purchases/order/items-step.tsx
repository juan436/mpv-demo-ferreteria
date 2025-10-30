/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Eye } from "lucide-react"
import { ItemInputSection } from "./item-input-section"
import { ItemsTable } from "./items-table"
import { ItemsMobileCart } from "./items-mobile-cart"
import type { OrderFormItem } from "./types"

interface ItemsStepProps {
  currentItem: {
    productCode: string
    productName: string
    quantity: string
  }
  items: OrderFormItem[]
  duplicateCounts: Map<string, number>
  totalItems: number
  errors: Record<string, string>
  isMobile: boolean
  showCartModal: boolean
  onCurrentItemChange: (item: { productCode: string; productName: string; quantity: string }) => void
  onAddItem: () => void
  onRemoveItem: (tempId: string) => void
  onUpdateItem: (tempId: string, changes: { productCode: string; productName: string; quantity: number }) => void
  onShowCartModal: (show: boolean) => void
  onCancel: () => void
  onPreview: () => void
}

export function ItemsStep({
  currentItem,
  items,
  duplicateCounts,
  totalItems,
  errors,
  isMobile,
  showCartModal,
  onCurrentItemChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onShowCartModal,
  onCancel,
  onPreview,
}: ItemsStepProps) {
  return (
    <div className="relative">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-lg md:text-xl">Crear Nuevo Pedido</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-10">
          <ItemInputSection
            productCode={currentItem.productCode}
            productName={currentItem.productName}
            quantity={currentItem.quantity}
            errors={errors}
            onProductCodeChange={(value) => onCurrentItemChange({ ...currentItem, productCode: value })}
            onProductNameChange={(value) => onCurrentItemChange({ ...currentItem, productName: value })}
            onQuantityChange={(value) => onCurrentItemChange({ ...currentItem, quantity: value })}
            onAdd={onAddItem}
          />

          {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}

          {!isMobile && items.length > 0 && (
            <ItemsTable items={items} duplicateCounts={duplicateCounts} onRemove={onRemoveItem} onUpdate={onUpdateItem} />
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={onPreview} disabled={items.length === 0}>
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>
          </div>
        </CardContent>
      </Card>

      {isMobile && (
        <ItemsMobileCart
          items={items}
          duplicateCounts={duplicateCounts}
          totalItems={totalItems}
          open={showCartModal}
          onOpenChange={onShowCartModal}
          onRemove={onRemoveItem}
          onUpdate={onUpdateItem}
        />
      )}
    </div>
  )
}
