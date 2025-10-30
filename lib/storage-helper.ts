/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

/**
 * Helper para obtener objetos embebidos del localStorage
 * El backend retorna en login: { id, email, name, role, branch: { _id, name } | null }
 */

export interface StoredUser {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  branch: { _id: string; name: string } | null
}

const USER_STORAGE_KEY = "Ferreteria_user"

/**
 * Obtiene el usuario completo del localStorage
 */
export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null
  
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    if (!stored) return null
    
    return JSON.parse(stored) as StoredUser
  } catch (error) {
    console.error("Error parsing stored user:", error)
    return null
  }
}

/**
 * Obtiene el objeto user { _id, name } para enviar al backend
 */
export function getUserObject(): { _id: string; name: string } | null {
  const user = getStoredUser()
  if (!user) return null
  
  return {
    _id: user.id,
    name: user.name,
  }
}

/**
 * Obtiene el objeto branch { _id, name } para enviar al backend
 * Retorna null si el usuario es admin o no tiene branch
 */
export function getBranchObject(): { _id: string; name: string } | null {
  const user = getStoredUser()
  if (!user || !user.branch) return null
  
  return {
    _id: user.branch._id,
    name: user.branch.name,
  }
}
