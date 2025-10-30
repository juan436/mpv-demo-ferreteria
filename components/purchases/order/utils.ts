/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { OrderFormItem } from "./types"

export function validateItem(item: { productCode: string; productName: string; quantity: number }): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!item.productName.trim()) {
    errors.productName = "El nombre del producto es requerido"
  }
  if (item.quantity <= 0) {
    errors.quantity = "La cantidad debe ser mayor a 0"
  }

  return errors
}

export function buildDuplicateCounts(items: OrderFormItem[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const it of items) {
    const code = normalizeCode(it.productCode)
    if (!code || code === 'nt') continue
    const key = `c:${code}`
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

export function getDuplicateCount(code: string, counts: Map<string, number>): number {
  const norm = normalizeCode(code)
  if (!norm || norm === 'nt') return 1
  return counts.get(`c:${norm}`) || 1
}

export function normalizeCode(code: string): string {
  return (code?.trim().toLowerCase() || 'nt')
}

export function normalizeName(name: string): string {
  return (name?.trim().toLowerCase() || '')
}

export function getDuplicateCountForItem(
  item: { productCode: string; productName: string },
  counts: Map<string, number>,
): number {
  const code = normalizeCode(item.productCode)
  if (!code || code === 'nt') return 1
  return counts.get(`c:${code}`) || 1
}

// ====== Date helpers (local timezone safe) ======
export function getTodayLocalISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatLocalDate(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10))
  if (!y || !m || !d) return dateStr
  const localDate = new Date(y, m - 1, d)
  return localDate.toLocaleDateString()
}

export function formatAnyDateLocal(dateStr: string): string {
  if (!dateStr) return ''
  // Case 1: plain date string yyyy-mm-dd -> format as local calendar date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return formatLocalDate(dateStr)
  }
  // Case 2: ISO with UTC (trailing Z) -> use UTC Y/M/D to avoid timezone shift
  if (/^\d{4}-\d{2}-\d{2}T.*Z$/.test(dateStr)) {
    const d = new Date(dateStr)
    if (!Number.isNaN(d.getTime())) {
      const y = d.getUTCFullYear()
      const m = d.getUTCMonth() + 1
      const day = d.getUTCDate()
      return new Date(y, m - 1, day).toLocaleDateString()
    }
  }
  // Fallback: best-effort local render
  const d = new Date(dateStr)
  if (!Number.isNaN(d.getTime())) return d.toLocaleDateString()
  return dateStr
}
