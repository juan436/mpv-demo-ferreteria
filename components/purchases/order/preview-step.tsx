/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableContainer } from "@/components/ui/table"
import { DuplicateBadge } from "./duplicate-badge"
import { CompareDialog } from "./compare-dialog"
import type { OrderFormItem } from "./types"
import type { Order } from "@/types"
import { getDuplicateCountForItem } from "./utils"

interface PreviewStepProps {
  items: OrderFormItem[]
  duplicateCounts: Map<string, number>
  totalItems: number
  isMobile: boolean
  orders: Order[]
  compareOpen: boolean
  onCompareOpenChange: (open: boolean) => void
  onBack: () => void
  onContinue: () => void
}

export function PreviewStep({
  items,
  duplicateCounts,
  totalItems,
  isMobile,
  orders,
  compareOpen,
  onCompareOpenChange,
  onBack,
  onContinue,
}: PreviewStepProps) {
  const getDuplicateCount = (item: { productCode: string; productName: string }) =>
    getDuplicateCountForItem(item, duplicateCounts)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Vista Previa del Pedido</CardTitle>
          </div>
          <Button onClick={() => onCompareOpenChange(true)}>Comparar</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isMobile ? (
          <div className="h-[30dvh] overflow-y-auto divide-y divide-gray-200">
            {items.map((item) => {
              const count = getDuplicateCount({ productCode: item.productCode, productName: item.productName })
              return (
                <div key={item.tempId} className={`px-2 py-1 ${count > 1 ? "bg-yellow-50" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] bg-gray-50 px-1.5 py-0.5 rounded border text-gray-600">
                          {item.productCode}
                        </span>
                        <DuplicateBadge count={count} />
                        <span className="font-medium text-[13px] truncate">{item.productName}</span>
                      </div>
                      <p className="text-[10px] leading-4 text-gray-500 mt-0.5">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <TableContainer maxHeight="h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clave</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
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
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium">
            Resumen: {items.length} productos, {totalItems} unidades totales
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Volver a Editar
          </Button>
          <Button onClick={onContinue}>Continuar</Button>
        </div>
      </CardContent>

      <CompareDialog open={compareOpen} onOpenChange={onCompareOpenChange} orders={orders} currentItems={items} />
    </Card>
  )
}
