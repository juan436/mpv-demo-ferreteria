/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { Button } from "@/components/ui/button"
import { Edit, Trash2, Building2 } from "lucide-react"
import type { Branch } from "@/types"

interface ViewMobileBranchesProps {
  branches: Branch[]
  onEdit: (branch: Branch) => void
  onDelete: (branch: Branch | null) => void
}

export function ViewMobileBranches({ branches, onEdit, onDelete }: ViewMobileBranchesProps) {
  return (
    <div className="block md:hidden h-full">
      {branches.length === 0 ? (
        <div className="text-center text-gray-500 flex items-center justify-center h-full">
          No se encontraron sucursales
        </div>
      ) : (
        <div
          className="overflow-y-auto h-full divide-y divide-gray-200"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + var(--pb, 22px))' }}
        >
          {branches.map((branch) => (
            <div key={branch.id} className="px-2 py-3 flex items-center justify-between active:bg-gray-50">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900 truncate">{branch.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(branch)} aria-label="Editar">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
