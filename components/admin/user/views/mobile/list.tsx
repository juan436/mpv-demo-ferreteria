/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { User, Branch } from "@/types"

interface ViewMobileUsersProps {
  users: User[]
  branches: Branch[]
  onEdit: (user: User) => void
  onDelete: (user: User | null) => void
}

export function ViewMobileUsers({ users, branches, onEdit, onDelete }: ViewMobileUsersProps) {

  const getBranchName = (user: User) => {
    if (!user.branch) return "Global"
    const found = branches.find((b) => b.id === user.branch)
    return found?.name ?? user.branch
  }
  return (
    <div className="block md:hidden h-full">
      {users.length === 0 ? (
        <div className="text-center text-gray-500 flex items-center justify-center h-full">
          No se encontraron usuarios
        </div>
      ) : (
        <div
          className="overflow-y-auto h-full divide-y divide-gray-200"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + var(--pb, 64px))' }}
        >


          {users.map((user) => (
            <div key={user.id} className="px-2 py-2 flex items-center justify-between active:bg-gray-50">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {user.role === 'admin' ? 'Admin' : 'Usuario'}
                  </span>
                  <span className="text-xs text-gray-500">{getBranchName(user)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(user)} aria-label="Editar">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )
      }
    </div >

  )
}
