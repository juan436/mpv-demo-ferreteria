/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */


/**
 * AppError
 * Error personalizado para manejar errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "AppError"
  }
}

/**
 * handleServiceError
 * Maneja errores de servicios
 */
export function handleServiceError(error: unknown, context: string): never {
  console.error(`Error in ${context}:`, error)

  if (error instanceof AppError) {
    throw error
  }

  if (error instanceof Error) {
    throw new AppError(error.message, "UNKNOWN_ERROR", 500)
  }

  throw new AppError("An unexpected error occurred", "UNKNOWN_ERROR", 500)
}

/**
 * isNetworkError
 * Verifica si el error es de red
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (error.message.includes("fetch") || error.message.includes("network"))
}
