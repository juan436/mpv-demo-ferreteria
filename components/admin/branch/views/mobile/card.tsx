/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Plus, Building2 as BuildingIcon } from "lucide-react"
import { ViewMobileBranches } from "../mobile/list"
import type { Branch } from "@/types"

interface BranchesMobileCardProps {
  searchQuery: string
  onSearch: (q: string) => void
  onExport: () => void
  onCreate: () => void
  branches: Branch[]
  onEdit: (b: Branch) => void
  onDelete: (b: Branch | null) => void
}

export function BranchesMobileCard({
  searchQuery,
  onSearch,
  onExport,
  onCreate,
  branches,
  onEdit,
  onDelete,
}: BranchesMobileCardProps) {
  return (
    <div className="block md:hidden space-y-4">
      <Card className="h-[clamp(400px,73dvh,90dvh)] overflow-hidden flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BuildingIcon className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-lg">Gestión de Sucursales</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col flex-1 min-h-0 [--pb:22px] max-[360px]:[--pb:20px] min-[480px]:[--pb:28px]">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar sucursales..."
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

          <div className="flex-1 min-h-0">
            <ViewMobileBranches branches={branches} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
