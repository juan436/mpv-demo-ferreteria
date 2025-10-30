/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Input } from "@/components/ui/input"

interface MobileSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function MobileSearchBar({ value, onChange }: MobileSearchBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <Input
          placeholder="Buscar por proveedor..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
    </div>
  )
}
