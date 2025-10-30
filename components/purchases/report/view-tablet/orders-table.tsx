/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableContainer } from "@/components/ui/table"
import { Eye, Trash2, FileText } from "lucide-react"
import type { OrdersTableProps } from "./types"
import { formatAnyDateLocal } from "@/components/purchases/order/utils"

export function OrdersTable({ orders, onView, onDelete }: OrdersTableProps) {
  return (
    <TableContainer maxHeight="h-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Factura</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No hay pedidos</p>
                  <p className="text-sm text-gray-400">Comienza creando tu primer pedido</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => (
              <TableRow key={`order-${index}`}>
                <TableCell className="font-mono">{order.invoiceCode}</TableCell>
                <TableCell className="font-medium">{order.providerName}</TableCell>
                <TableCell>{order.userName}</TableCell>
                <TableCell>{formatAnyDateLocal(order.date)}</TableCell>
                <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onView(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
