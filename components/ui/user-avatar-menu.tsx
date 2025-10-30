/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function UserAvatarMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [branchName, setBranchName] = useState<string>("")
  
  const handleLogout = () => {
    logout()
    router.push("/login")
  }
  
  // Get branch name from localStorage
  useEffect(() => {
    if (!user?.branch) {
      setBranchName("")
      return
    }
    
    // Obtener branch del localStorage
    try {
      const stored = localStorage.getItem('Ferreteria_user')
      if (stored) {
        const storedUser = JSON.parse(stored)
        setBranchName(storedUser?.branch?.name || "")
      }
    } catch (err) {
      setBranchName("")
      console.error("Error getting branch from localStorage:", err)
    }
  }, [user?.branch])

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-10 h-10 rounded-full p-0">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">{user.name.charAt(0).toUpperCase()}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-3 py-2 border-b">
          <p className="font-medium text-gray-900 truncate">{user.name}</p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            Ferretería: {branchName || "—"}
          </p>
        </div>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
