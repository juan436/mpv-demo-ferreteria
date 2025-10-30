/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableContainer } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Mail } from "lucide-react"
import { formatAnyDateLocal } from "@/components/purchases/order/utils"
import type { OrderDetailDialogProps } from "./types"
import { useConnectionStatus } from "@/hooks/use-connection-status"

export function OrderDetailDialog({ order, open, onOpenChange, onDownloadExcel, onSend }: OrderDetailDialogProps) {
  const { isOnline } = useConnectionStatus()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{order ? `Detalle del Pedido #${order.invoiceCode}` : "Detalle del Pedido"}</DialogTitle>
          <DialogDescription>
            {order ? (
              <>Proveedor: {order.providerName} | Fecha: {formatAnyDateLocal(order.date)}</>
            ) : (
              <>Sin datos</>
            )}
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Productos ({order.items.length})</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onDownloadExcel(order)}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      className="bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isOnline}
                      title={!isOnline ? "Requiere conexión a internet" : "Enviar por correo"}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSend("test-admin-dev-jv@proton.me")}>
                      Test-admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TableContainer maxHeight="h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clave</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.productCode}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Usuario:</strong> {order.userName} | {" "}
                <strong>Total Items:</strong> {order.items.reduce((sum, it) => sum + it.quantity, 0)}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
