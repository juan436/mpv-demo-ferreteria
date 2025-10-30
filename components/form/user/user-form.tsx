/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { User, Branch } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UserFormProps {
  user?: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (userData: Omit<User, "id" | "createdAt">) => Promise<void>
  branches: Branch[]
}

export function UserForm({ user, open, onOpenChange, onSubmit, branches }: UserFormProps) {
  const [formData, setFormData] = useState<Omit<User, "id" | "createdAt">>({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "user",
    branch: (user?.branch as string | null) ?? "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        branch: (user.branch as string | null) ?? "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) return
    if (formData.role !== "admin" && !formData.branch.trim()) return
    if (!user && !formData.password.trim()) return

    const submitData: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    }

    if (formData.role !== "admin") {
      submitData.branch = formData.branch
    }

    if (formData.password.trim()) {
      submitData.password = formData.password
    }

    try {
      setLoading(true)
      await onSubmit(submitData)
      onOpenChange(false)
      setFormData({ name: "", email: "", password: "", role: "user", branch: "" })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ name: "", email: "", password: "", role: "user", branch: "" })
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@Ferreteria.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{user ? "Nueva Contraseña (opcional)" : "Contraseña"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder={user ? "Dejar vacío para mantener actual" : "Contraseña"}
              required={!user}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value as "user" | "admin" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Sucursal</Label>
            <Select
              value={formData.branch}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, branch: value }))}
              disabled={formData.role === "admin"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando..." : user ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}  
