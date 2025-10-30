/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Provider } from "@/types"

interface ProviderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider?: Provider | null
  onSubmit: (name: string) => Promise<boolean>
  loading?: boolean
}

export function ProviderForm({ open, onOpenChange, provider, onSubmit, loading = false }: ProviderFormProps) {
  const [name, setName] = useState(provider?.name || "")
  const [error, setError] = useState("")

  // Sync input value when opening the dialog to edit a provider
  useEffect(() => {
    if (open) {
      setName(provider?.name || "")
      setError("")
    }
  }, [open, provider])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("El nombre del proveedor es requerido")
      return
    }

    const success = await onSubmit(name.trim())
    if (success) {
      setName("")
      onOpenChange(false)
    } else {
      setError("Error al guardar el proveedor")
    }
  }

  const handleClose = () => {
    setName("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{provider ? "Editar Proveedor" : "Crear Proveedor"}</DialogTitle>
          <DialogDescription>
            {provider ? "Modifica la información del proveedor" : "Ingresa el nombre del nuevo proveedor"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del proveedor</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Ferretería Central"
                disabled={loading}
                className={error ? "border-red-500 focus-visible:ring-red-500" : undefined}
                aria-invalid={!!error}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cerrar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Aceptar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
