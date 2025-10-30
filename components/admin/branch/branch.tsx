/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState } from "react"
import type { Branch } from "../../../types"
import { BranchForm } from "../../form/branch/branch-form"
import { useBranches } from "../../../hooks/use-branches"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog"
import { BranchesMobileCard } from "./views/mobile/card"
import { BranchesDesktopCard } from "./views/tablet-desktop/card"

export function BranchesTable() {
  const {
    branches,
    loading,
    createBranch,
    updateBranch,
    deleteBranch,
    searchBranches,
    downloadExcelReport,
  } = useBranches()
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    searchBranches(query)
  }

  const handleCreateBranch = async (name: string) => {
    await createBranch(name)
  }

  const handleUpdateBranch = async (name: string) => {
    if (editingBranch) {
      await updateBranch(editingBranch.id, name)
      setEditingBranch(null)
    }
  }

  const handleDeleteBranch = async () => {
    if (deletingBranch) {
      await deleteBranch(deletingBranch.id)
      setDeletingBranch(null)
    }
  }

  const openEditForm = (branch: Branch) => {
    setEditingBranch(branch)
    setShowForm(true)
  }

  const openCreateForm = () => {
    setEditingBranch(null)
    setShowForm(true)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando sucursales...</div>
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card */}
      <BranchesMobileCard
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onExport={downloadExcelReport}
        onCreate={openCreateForm}
        branches={branches}
        onEdit={openEditForm}
        onDelete={setDeletingBranch}
      />

      {/* Desktop/Tablet Card */}
      <BranchesDesktopCard
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onExport={downloadExcelReport}
        onCreate={openCreateForm}
        branches={branches}
        onEdit={openEditForm}
        onDelete={setDeletingBranch}
      />

      {/* Branch Form Dialog */}
      <BranchForm
        branch={editingBranch}
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editingBranch ? handleUpdateBranch : handleCreateBranch}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBranch} onOpenChange={() => setDeletingBranch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sucursal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la sucursal
              <strong> {deletingBranch?.name}</strong> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBranch} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
