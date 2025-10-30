/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent} from "@/components/ui/card"
import { ProviderForm } from "../../form/provider/provider-form"
import { useProviders } from "@/hooks/use-providers"
import type { Provider } from "@/types"
import { ProvidersMobileCard } from "./view/mobile/card"
import { ProvidersDesktopCard } from "./view/table-desktop/card"

/**
 * ProvidersTable
 * Componente que maneja la vista de proveedores
 */
export function ProvidersTable() {
  const { providers, loading, error, createProvider, updateProvider, deleteProvider, searchProviders, downloadExcelReport } = useProviders()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await searchProviders(query)
      setFilteredProviders(results)
    } else {
      setFilteredProviders([])
    }
  }

  const displayProviders = searchQuery.trim() ? filteredProviders : providers

  const handleCreateProvider = async (name: string): Promise<boolean> => {
    setFormLoading(true)
    const success = await createProvider(name)
    setFormLoading(false)
    return success
  }

  const handleUpdateProvider = async (name: string): Promise<boolean> => {
    if (!editingProvider) return false
    setFormLoading(true)
    const success = await updateProvider(editingProvider.id, name)
    setFormLoading(false)
    if (success) {
      setEditingProvider(null)
    }
    return success
  }

  const handleDeleteProvider = async () => {
    if (!deletingProvider) return
    const success = await deleteProvider(deletingProvider.id)
    if (success) {
      setDeletingProvider(null)
    }
  }

  const openEditForm = (provider: Provider) => {
    setEditingProvider(provider)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProvider(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando proveedores...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card */}
      <ProvidersMobileCard
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onExport={downloadExcelReport}
        onCreate={() => { setEditingProvider(null); setShowForm(true) }}
        error={error}
        providers={displayProviders}
        onEdit={openEditForm}
        onDelete={setDeletingProvider}
      />

      {/* Desktop/Tablet Card */}
      <ProvidersDesktopCard
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onExport={downloadExcelReport}
        onCreate={() => { setEditingProvider(null); setShowForm(true) }}
        error={error}
        providers={displayProviders}
        onEdit={openEditForm}
        onDelete={setDeletingProvider}
      />

      {/* Provider Form Dialog */}
      <ProviderForm
        open={showForm}
        onOpenChange={closeForm}
        provider={editingProvider}
        onSubmit={editingProvider ? handleUpdateProvider : handleCreateProvider}
        loading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProvider} onOpenChange={() => setDeletingProvider(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el proveedor "{deletingProvider?.name}"? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProvider} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}