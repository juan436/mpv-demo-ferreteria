/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FiltersBarProps } from "./types"

export function FiltersBar({ filters, providers, onChange }: FiltersBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <Input
          placeholder="Buscar por proveedor..."
          value={filters.searchQuery}
          onChange={(e) => onChange({ searchQuery: e.target.value })}
          className="pl-10"
        />
      </div>

      <Select value={filters.selectedProvider} onValueChange={(v) => onChange({ selectedProvider: v })}>
        <SelectTrigger>
          <SelectValue placeholder="Todos los proveedores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los proveedores</SelectItem>
          {providers.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.selectedPeriod} onValueChange={(v) => onChange({ selectedPeriod: v as any })}>
        <SelectTrigger>
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todo el tiempo</SelectItem>
          <SelectItem value="today">Hoy</SelectItem>
          <SelectItem value="week">Última semana</SelectItem>
          <SelectItem value="month">Último mes</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
