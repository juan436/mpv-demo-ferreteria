/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

export interface User {
  id: string
  email: string
  name: string
  password: string
  role: "admin" | "user"
  branch: string
  createdAt: string
}

export interface Provider {
  id: string
  name: string
  branch: string
  branchName?: string
  createdAt: string
}

export interface Branch {
  id: string
  name: string
  createdAt: string
}

export interface OrderItem {
  id: string
  productCode: string
  productName: string
  quantity: number
}

export interface Order {
  id: string
  invoiceCode: string
  providerId: string
  providerName: string
  userId: string
  userName: string
  date: string
  status: "pending" | "completed" | "cancelled"
  branch: string
  branchName?: string
  items: OrderItem[]
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  branch: string
}

export interface LoginCredentials {
  email: string
  password: string
}
