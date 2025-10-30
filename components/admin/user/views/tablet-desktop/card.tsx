/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Plus, Users as UsersIcon } from "lucide-react"
import type { User, Branch } from "@/types"
import { ViewTableUsers } from "./table"

interface UsersDesktopCardProps {
  searchQuery: string
  onSearch: (q: string) => void
  onExport: () => void
  onCreate: () => void
  users: User[]
  branches: Branch[]
  onEdit: (u: User) => void
  onDelete: (u: User | null) => void
}

export function UsersDesktopCard({
  searchQuery,
  onSearch,
  onExport,
  onCreate,
  users,
  branches,
  onEdit,
  onDelete,
}: UsersDesktopCardProps) {
  return (
    <div className="hidden md:block space-y-4">
      <Card className="h-[clamp(680px,88dvh,96dvh)] overflow-hidden flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Gestión de Usuarios</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col flex-1 min-h-0">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
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
            <ViewTableUsers users={users} branches={branches} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
