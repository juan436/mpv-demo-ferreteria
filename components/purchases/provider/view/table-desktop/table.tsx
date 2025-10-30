/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableContainer } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"
import type { Provider } from "@/types"

interface ViewTableEscritorioProps {
  providers: Provider[]
  onEdit: (provider: Provider) => void
  onDelete: (provider: Provider | null) => void
}

/**
 * ViewTableEscritorio
 * Componente que maneja la vista de proveedores en escritorio y tablet
 */
export function ViewTableEscritorio({ providers, onEdit, onDelete }: ViewTableEscritorioProps) {
  return (
    <div className="h-full">
      <TableContainer maxHeight="h-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Proveedor</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                  No hay proveedores registrados
                </TableCell>
              </TableRow>
            ) : (
              providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(provider)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
