/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Download, Plus, Search } from "lucide-react"
import type { Provider } from "@/types"
import { ViewTableEscritorio } from "./table"

interface DesktopCardProps {
  searchQuery: string
  onSearch: (q: string) => void
  onExport: () => void
  onCreate: () => void
  error?: string | null
  providers: Provider[]
  onEdit: (p: Provider) => void
  onDelete: (p: Provider | null) => void
}

/**
 * ProvidersDesktopCard
 * Componente que maneja la vista de proveedores en escritorio y tablet
 */
export function ProvidersDesktopCard({
  searchQuery,
  onSearch,
  onExport,
  onCreate,
  error,
  providers,
  onEdit,
  onDelete,
}: DesktopCardProps) {
  return (
    <div className="hidden md:block space-y-4">
      <Card className="h-[clamp(680px,88dvh,96dvh)] overflow-hidden flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Gestión de Proveedores</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 flex flex-col flex-1 min-h-0">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar proveedores..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={onCreate}>
                <Plus className="h-4 w-4 mr-0" />
                Crear
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
          )}

          <div className="flex-1 min-h-0">
            <ViewTableEscritorio providers={providers} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
