/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Mail } from "lucide-react"
import type { MobileDetailDialogProps } from "./types"
import { useConnectionStatus } from "@/hooks/use-connection-status"

export function MobileDetailDialog({ order, open, onOpenChange, onDownloadExcel, onSend }: MobileDetailDialogProps) {
  const { isOnline } = useConnectionStatus()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">{order ? `Pedido #${order.invoiceCode}` : "Pedido"}</DialogTitle>
          <DialogDescription className="text-sm">
            {order ? (
              <>
                {order.providerName} • {new Date(order.date).toLocaleDateString()}
              </>
            ) : (
              <>Sin datos</>
            )}
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">Productos ({order.items.length})</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadExcel(order)}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Excel
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      className="text-xs bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isOnline}
                      title={!isOnline ? "Requiere conexión a internet" : "Enviar por correo"}
                    >
                      <Mail className="h-3 w-3 mr-1" />
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

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500 font-mono">{item.productCode}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-semibold text-sm">{item.quantity}</p>
                      <p className="text-xs text-gray-500">unidades</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Total de items:</span>
                <span className="font-semibold text-blue-700">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
