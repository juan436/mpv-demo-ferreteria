/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { Badge } from "@/components/ui/badge"

interface DuplicateBadgeProps {
  count: number
  className?: string
}

export function DuplicateBadge({ count, className = "" }: DuplicateBadgeProps) {
  if (count <= 1) return null

  const colorClass =
    count === 2
      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
      : count === 3
        ? "bg-orange-100 text-orange-800 border-orange-300"
        : "bg-red-100 text-red-800 border-red-300"

  const label = count === 2 ? "Duplicado (2)" : count === 3 ? "Triplicado (3)" : `x${count}`

  return <Badge className={`${colorClass} ${className}`}>{label}</Badge>
}
