/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { ValidationResult } from "@/interfaces/data.interface"
import type { User, Provider, Order, LoginCredentials } from "@/types"

/**
 * ValidationService
 * Servicio de validación de datos
 */
class ValidationService {
  validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
    const errors: Record<string, string> = {}

    if (!credentials.email?.trim()) {
      errors.email = "El correo electrónico es requerido"
    } else if (!this.isValidEmail(credentials.email)) {
      errors.email = "El correo electrónico no es válido"
    }

    if (!credentials.password?.trim()) {
      errors.password = "La contraseña es requerida"
    } else if (credentials.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  validateProvider(provider: Partial<Provider>): ValidationResult {
    const errors: Record<string, string> = {}

    if (!provider.name?.trim()) {
      errors.name = "El nombre del proveedor es requerido"
    } else if (provider.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres"
    } else if (provider.name.trim().length > 100) {
      errors.name = "El nombre no puede exceder 100 caracteres"
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  validateUser(user: Partial<User>): ValidationResult {
    const errors: Record<string, string> = {}

    if (!user.name?.trim()) {
      errors.name = "El nombre es requerido"
    } else if (user.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres"
    }

    if (!user.email?.trim()) {
      errors.email = "El correo electrónico es requerido"
    } else if (!this.isValidEmail(user.email)) {
      errors.email = "El correo electrónico no es válido"
    }

    if (!user.password?.trim()) {
      errors.password = "La contraseña es requerida"
    } else if (user.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!user.role || !["admin", "user"].includes(user.role)) {
      errors.role = "El rol debe ser 'admin' o 'user'"
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  validateOrder(order: Partial<Order>): ValidationResult {
    const errors: Record<string, string> = {}

    if (!order.providerId?.trim()) {
      errors.providerId = "El proveedor es requerido"
    }

    if (!order.userId?.trim()) {
      errors.userId = "El usuario es requerido"
    }

    if (!order.date?.trim()) {
      errors.date = "La fecha es requerida"
    } else if (!this.isValidDate(order.date)) {
      errors.date = "La fecha no es válida"
    }

    if (!order.items || order.items.length === 0) {
      errors.items = "Debe agregar al menos un producto"
    } else {
      order.items.forEach((item, index) => {
        if (!item.productCode?.trim()) {
          errors[`items.${index}.productCode`] = "La clave del producto es requerida"
        }
        if (!item.productName?.trim()) {
          errors[`items.${index}.productName`] = "El nombre del producto es requerido"
        }
        if (!item.quantity || item.quantity <= 0) {
          errors[`items.${index}.quantity`] = "La cantidad debe ser mayor a 0"
        }
      })
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !Number.isNaN(date.getTime())
  }
}

export const validationService = new ValidationService()
