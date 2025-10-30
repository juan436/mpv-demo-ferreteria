/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { ProviderForm } from "@/components/form/provider/provider-form"
import type { Provider } from "@/types"

interface DetailsStepProps {
  providerSearch: string
  selectedProviderId: string
  orderDate: string
  errors: Record<string, string>
  loading: boolean
  providers: Provider[]
  filteredProviders: Provider[]
  showProviderDropdown: boolean
  showProviderForm: boolean
  onProviderSearchChange: (value: string) => void
  onProviderSelect: (id: string, name: string) => void
  onProviderFocus: () => void
  onDateChange: (date: string) => void
  onShowProviderForm: (show: boolean) => void
  onCreateProvider: (name: string) => Promise<boolean>
  onBack: () => void
  onSubmit: () => void
}

export function DetailsStep({
  providerSearch,
  selectedProviderId,
  orderDate,
  errors,
  loading,
  providers,
  filteredProviders,
  showProviderDropdown,
  showProviderForm,
  onProviderSearchChange,
  onProviderSelect,
  onProviderFocus,
  onDateChange,
  onShowProviderForm,
  onCreateProvider,
  onBack,
  onSubmit,
}: DetailsStepProps) {
  const todayLocal = (() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Pedido</CardTitle>
        <CardDescription>Selecciona el proveedor y la fecha</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Proveedor</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="provider"
                  value={providerSearch}
                  onChange={(e) => onProviderSearchChange(e.target.value)}
                  onFocus={onProviderFocus}
                  placeholder="Buscar o seleccionar proveedor..."
                  className={`w-full ${errors.provider ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {showProviderDropdown && filteredProviders.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredProviders.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => onProviderSelect(provider.id, provider.name)}
                      >
                        {provider.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => onShowProviderForm(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha del Pedido</Label>
            <Input
              id="date"
              type="date"
              value={orderDate}
              onChange={(e) => onDateChange(e.target.value)}
              max={todayLocal}
              className={errors.date ? "border-red-500 focus-visible:ring-red-500" : undefined}
            />
          </div>
        </div>

        {errors.user && <p className="text-sm text-red-600">{errors.user}</p>}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Volver
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Creando..." : "Crear Pedido"}
          </Button>
        </div>
      </CardContent>

      <ProviderForm open={showProviderForm} onOpenChange={onShowProviderForm} onSubmit={onCreateProvider} />
    </Card>
  )
}
