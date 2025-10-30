/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableContainer } from "@/components/ui/table"
import type { Order } from "@/types"
import type { OrderFormItem, CompareMatch } from "./types"
import { normalizeCode } from "./utils"

interface CompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: Order[]
  currentItems: OrderFormItem[]
}

export function CompareDialog({ open, onOpenChange, orders, currentItems }: CompareDialogProps) {
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [matches, setMatches] = useState<CompareMatch[]>([])
  const [showResults, setShowResults] = useState(false)

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (o) =>
        o.invoiceCode.toLowerCase().includes(q) ||
        o.providerName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) // opcional: seguir permitiendo buscar por _id
    )
  }, [orders, searchQuery])

  const handleClose = () => {
    setSelectedOrderId("")
    setSearchQuery("")
    setMatches([])
    setShowResults(false)
    onOpenChange(false)
  }

  const handleCompare = () => {
    const selectedOrder = orders.find((o) => o.id === selectedOrderId)
    if (!selectedOrder) return

    const currentMap = new Map<string, { code: string; name: string; qty: number }>()
    for (const it of currentItems) {
      const code = normalizeCode(it.productCode)
      if (!code || code === 'nt') continue
      currentMap.set(code, { code: it.productCode, name: it.productName, qty: it.quantity })
    }

    const otherMap = new Map<string, { code: string; name: string; qty: number }>()
    for (const it of selectedOrder.items) {
      const code = normalizeCode(it.productCode as any)
      if (!code || code === 'nt') continue
      otherMap.set(code, { code: it.productCode as any, name: it.productName as any, qty: it.quantity as any })
    }

    const foundMatches: CompareMatch[] = []
    for (const [codeKey, cur] of currentMap) {
      const oth = otherMap.get(codeKey)
      if (oth) {
        foundMatches.push({ code: cur.code, name: cur.name, currentQty: cur.qty, otherQty: oth.qty })
      }
    }

    setMatches(foundMatches)
    setShowResults(true)
  }

  const handleBack = () => {
    setMatches([])
    setShowResults(false)
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:!max-w-none md:!max-w-none lg:!max-w-none sm:!w-[95dvw] md:!w-[50dvw] lg:!w-[40dvw] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[min(65dvh,calc(100dvh-3rem))] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparar Pedido</DialogTitle>
          <DialogDescription>
            {showResults ? "Coincidencias encontradas" : "Selecciona un pedido para comparar con el actual"}
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pedido a comparar</Label>
              <Input
                placeholder="Filtrar por #Factura o proveedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Desktop/Tablet: Tabla con scroll */}
              <div className="hidden md:block">
                <div className="h-40">
                  <TableContainer maxHeight="h-40">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Factura</TableHead>
                          <TableHead>Proveedor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-gray-500">
                              Sin resultados
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOrders.map((o) => (
                            <TableRow
                              key={`cmpd-${o.id}`}
                              className={selectedOrderId === o.id ? "bg-blue-50 cursor-pointer" : "cursor-pointer"}
                              onClick={() => setSelectedOrderId(o.id)}
                            >
                              <TableCell className="font-mono">{o.invoiceCode}</TableCell>
                              <TableCell className="font-medium">{o.providerName}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </div>

              {/* Mobile: Lista con scroll */}
              <div className="block md:hidden">
                <div className="h-40 overflow-y-auto divide-y divide-gray-200 rounded border">
                  {filteredOrders.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-500">Sin resultados</div>
                  ) : (
                    filteredOrders.map((o) => (
                      <button
                        type="button"
                        key={`cmpm-${o.id}`}
                        className={`w-full px-3 py-2 text-left ${
                          selectedOrderId === o.id ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedOrderId(o.id)}
                      >
                        <div className="font-mono text-xs text-gray-600">#{o.invoiceCode}</div>
                        <div className="text-sm font-medium text-gray-900">{o.providerName}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button disabled={!selectedOrderId} onClick={handleCompare}>
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Coincidencias</h4>
              {matches.length === 0 ? (
                <p className="text-sm text-gray-500">No se encontraron coincidencias.</p>
              ) : (
                <div className="border rounded max-h-[30dvh] overflow-y-auto md:max-h-[50dvh] md:min-h-[35dvh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead>Comparado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((m) => (
                        <TableRow key={m.code}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border text-gray-600">
                                {m.code}
                              </span>
                              <span>{m.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{m.currentQty}</TableCell>
                          <TableCell>{m.otherQty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBack}>
                Atrás
              </Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
