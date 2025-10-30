/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

export interface IDataService<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(data: Omit<T, "id" | "createdAt">): Promise<T>
  update(id: string, data: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
  search(query: string): Promise<T[]>
}

export interface IReportService<T> {
  generateReport(items: T[]): string
  downloadReport(items: T[], filename: string): void
}

export interface IValidationService<T> {
  validate(data: T): ValidationResult
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: Record<string, string>
}
