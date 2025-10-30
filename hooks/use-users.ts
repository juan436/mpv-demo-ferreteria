/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types"
import { userService } from "@/services/user.service"
import { useAuth } from "@/hooks/use-auth"
import { notificationService } from "@/services/notification.service"

/**
 * useUsers
 * Hook personalizado para manejar usuarios
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadUsers()
    }
  }, [currentUser])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.getUsers()
      const filtered = currentUser
        ? data.filter((u) => u.id !== currentUser.id && u.email !== currentUser.email)
        : data
      setUsers(filtered as unknown as User[])
    } catch (err) {
      setError("Error al cargar usuarios")
      console.error("Error loading users:", err)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: Omit<User, "id" | "createdAt">): Promise<boolean> => {
    try {
      setError(null)
      const newUser = await userService.createUser(userData)
      if (newUser) {
        setUsers((prev) => [...prev, newUser as User])
        notificationService.success(
          "Usuario creado",
          `El usuario "${userData.name}" ha sido creado exitosamente.`
        )
        return true
      }
      notificationService.error(
        "Error",
        "No se pudo crear el usuario. Intenta nuevamente."
      )
      return false
    } catch (err) {
      const errorMsg = "Error al crear usuario"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error creating user:", err)
      return false
    }
  }

  const updateUser = async (id: string, userData: Partial<Omit<User, "id" | "createdAt">>) => {
    try {
      setError(null)
      const updatedUser = await userService.updateUser(id, userData)
      if (updatedUser) {
        setUsers((prev) => prev.map((user) => (user.id === id ? (updatedUser as unknown as User) : user)))
        notificationService.success(
          "Usuario actualizado",
          `El usuario "${updatedUser.name}" ha sido actualizado exitosamente.`
        )
      } else {
        notificationService.error(
          "Error",
          "No se pudo actualizar el usuario. Intenta nuevamente."
        )
      }
      return updatedUser
    } catch (err) {
      const errorMsg = "Error al actualizar usuario"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      throw err
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await userService.deleteUser(id)
      if (success) {
        setUsers((prev) => prev.filter((u) => u.id !== id))
        notificationService.success(
          "Usuario eliminado",
          "El usuario ha sido eliminado exitosamente."
        )
        return true
      }
      notificationService.error(
        "Error",
        "No se pudo eliminar el usuario. Intenta nuevamente."
      )
      return false
    } catch (err) {
      const errorMsg = "Error al eliminar usuario"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error deleting user:", err)
      return false
    }
  }

  const searchUsers = async (query: string) => {
    try {
      setError(null)
      const results = await userService.searchUsers(query)
      const filtered = currentUser
        ? results.filter((u) => u.id !== currentUser.id && u.email !== currentUser.email)
        : results
      setUsers(filtered as unknown as User[])
    } catch (err) {
      setError("Error al buscar usuarios")
      console.error("Error searching users:", err)
    }
  }

  const downloadReport = async () => {
    try {
      const csvContent = await userService.generateUsersReport()
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `usuarios_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError("Error al generar reporte")
      console.error("Error generating report:", err)
    }
  }

  const downloadExcelReport = async () => {
    try {
      setError(null)
      await userService.downloadExcelReport()
      notificationService.success(
        "Reporte generado",
        "El reporte Excel se ha descargado exitosamente."
      )
    } catch (err) {
      const errorMsg = "Error al generar reporte Excel"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error generating Excel report:", err)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Re-load once auth state is ready, so we can exclude the logged-in user
  useEffect(() => {
    if (currentUser) {
      loadUsers()
    }
  }, [currentUser])

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    downloadReport,
    downloadExcelReport,
    refreshUsers: loadUsers,
  }
}
