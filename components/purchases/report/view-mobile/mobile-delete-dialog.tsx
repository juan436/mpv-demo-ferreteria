/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { MobileDeleteDialogProps } from "./types"

export function MobileDeleteDialog({ order, open, onOpenChange, onConfirm }: MobileDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Confirmar eliminación</AlertDialogTitle>
        <AlertDialogDescription className="text-sm">
          ¿Eliminar el pedido de "{order?.providerName}"? Esta acción no se puede deshacer.
        </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2">
          <AlertDialogAction onClick={onConfirm} className="w-full bg-red-600 hover:bg-red-700">
            Eliminar
          </AlertDialogAction>
          <AlertDialogCancel className="w-full">Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
