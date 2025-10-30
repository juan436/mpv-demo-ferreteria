/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { IDataService } from "@/interfaces/data.interface"

/**
 * BaseDataService
 * Servicio base de datos con operaciones CRUD
 */
export abstract class BaseDataService<T extends { id: string; createdAt: string }> implements IDataService<T> {
  protected items: T[] = []
  protected abstract dataUrl: string
  protected abstract entityName: string

  constructor() {
    this.loadData()
  }

  protected async loadData(): Promise<void> {
    try {
      const response = await fetch(this.dataUrl)
      if (!response.ok) {
        throw new Error(`Failed to load ${this.entityName}`)
      }
      this.items = await response.json()
    } catch (error) {
      console.error(`Error loading ${this.entityName}:`, error)
      this.items = []
    }
  }

  async getAll(): Promise<T[]> {
    await this.loadData()
    return [...this.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getById(id: string): Promise<T | null> {
    await this.loadData()
    return this.items.find((item) => item.id === id) || null
  }

  async create(data: Omit<T, "id" | "createdAt">): Promise<T> {
    await this.loadData()

    const newItem = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    } as T

    this.items.push(newItem)
    await this.saveData()
    return newItem
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.loadData()

    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) return null

    this.items[index] = { ...this.items[index], ...data }
    await this.saveData()
    return this.items[index]
  }

  async delete(id: string): Promise<boolean> {
    await this.loadData()

    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) return false

    this.items.splice(index, 1)
    await this.saveData()
    return true
  }

  async search(query: string): Promise<T[]> {
    await this.loadData()

    if (!query.trim()) return this.items

    const searchTerm = query.toLowerCase().trim()
    return this.items.filter((item) => this.matchesSearch(item, searchTerm))
  }

  protected abstract matchesSearch(item: T, searchTerm: string): boolean

  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  protected async saveData(): Promise<void> {
    // In a real application, this would save to a backend API
    // For now, we just log the changes
    console.log(`${this.entityName} data updated:`, this.items)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
