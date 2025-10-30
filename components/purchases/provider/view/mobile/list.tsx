/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Provider } from "@/types"

interface ViewMobileProps {
  providers: Provider[]
  onEdit: (provider: Provider) => void
  onDelete: (provider: Provider | null) => void
}

/**
 * ViewMobile
 * Componente que maneja la vista de proveedores en móvil
 */
export function ViewMobile({ providers, onEdit, onDelete }: ViewMobileProps) {
  return (
    <div className="block md:hidden h-full">
      {providers.length === 0 ? (
        <div className="text-center text-gray-500 flex items-center justify-center h-full">
          No hay proveedores registrados
        </div>
      ) : (
        <div
          className="overflow-y-auto h-full divide-y divide-gray-200"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + var(--pb, 22px))' }}
        >
          {providers.map((provider) => (
            <div key={provider.id} className="px-2 py-1.5 flex items-center justify-between active:bg-gray-50">
              <span className="text-[13px] font-medium text-gray-900 truncate">{provider.name}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(provider)} aria-label="Editar">
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
