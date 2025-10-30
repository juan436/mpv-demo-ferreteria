/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState } from "react"
import type { User } from "../../../types"
import { UserForm } from "../../form/user/user-form"
import { useUsers } from "../../../hooks/use-users"
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
import { UsersMobileCard } from "./views/mobile/card"
import { UsersDesktopCard } from "./views/tablet-desktop/card"

export function UsersTable() {
  const { users, loading, createUser, updateUser, deleteUser, searchUsers, downloadExcelReport } = useUsers()
  const { branches, loading: loadingBranches } = useBranches()
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    searchUsers(query)
  }

  const handleCreateUser = async (userData: Omit<User, "id" | "createdAt">) => {
    await createUser(userData)
  }

  const handleUpdateUser = async (userData: Omit<User, "id" | "createdAt">) => {
    if (editingUser) {
      await updateUser(editingUser.id, userData)
      setEditingUser(null)
    }
  }

  const handleDeleteUser = async () => {
    if (deletingUser) {
      await deleteUser(deletingUser.id)
      setDeletingUser(null)
    }
  }

  const openEditForm = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const openCreateForm = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  if (loading || loadingBranches) {
    return <div className="flex justify-center p-8">Cargando usuarios y sucursales...</div>
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card */}
      <UsersMobileCard
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onExport={downloadExcelReport}
        onCreate={openCreateForm}
        users={users}
        branches={branches}
        onEdit={openEditForm}
        onDelete={setDeletingUser}
      />

      {/* Desktop/Tablet Card */}
      <UsersDesktopCard
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onExport={downloadExcelReport}
        onCreate={openCreateForm}
        users={users}
        branches={branches}
        onEdit={openEditForm}
        onDelete={setDeletingUser}
      />

      {/* User Form Dialog */}
      <UserForm
        user={editingUser}
        open={showForm}
        onOpenChange={setShowForm}
        branches={branches}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
              <strong> {deletingUser?.name}</strong> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  )
}
