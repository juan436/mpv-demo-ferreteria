/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

/**
 * IndexedDB Service para almacenamiento offline
 * Base de datos: Ferreteria-db
 * Stores: providers, orders, branches, users, sync_queue
 */

const DB_NAME = 'Ferreteria-db'
const DB_VERSION = 3

export interface SyncQueueItem {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: 'provider' | 'order' | 'branch' | 'user'
  data: any
  timestamp: number
  synced: number
}

/**
 * IndexedDBService
 * Servicio de IndexedDB para almacenamiento offline
 */
class IndexedDBService {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  isInitialized(): boolean {
    return this.db !== null
  }

  async init(): Promise<void> {
    // Si ya está inicializado, retornar inmediatamente
    if (this.db) {
      return Promise.resolve()
    }

    // Si ya hay una inicialización en progreso, retornar esa promesa
    if (this.initPromise) {
      return this.initPromise
    }

    // Crear nueva promesa de inicialización
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        this.initPromise = null
        reject(request.error)
      }
      request.onsuccess = () => {
        this.db = request.result
        this.initPromise = null
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = (event.target as IDBOpenDBRequest).transaction!

        // Store para proveedores
        if (!db.objectStoreNames.contains('providers')) {
          const providerStore = db.createObjectStore('providers', { keyPath: 'id' })
          providerStore.createIndex('branch', 'branch', { unique: false })
          providerStore.createIndex('name', 'name', { unique: false })
        } else {
          const providerStore = transaction.objectStore('providers')
          if (!providerStore.indexNames.contains('branch')) {
            providerStore.createIndex('branch', 'branch', { unique: false })
          }
          if (!providerStore.indexNames.contains('name')) {
            providerStore.createIndex('name', 'name', { unique: false })
          }
        }

        // Store para órdenes
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' })
          orderStore.createIndex('branch', 'branch._id', { unique: false })
          orderStore.createIndex('user', 'user._id', { unique: false })
          orderStore.createIndex('provider', 'provider._id', { unique: false })
          orderStore.createIndex('status', 'status', { unique: false })
        } else {
          const orderStore = transaction.objectStore('orders')
          if (!orderStore.indexNames.contains('branch')) {
            orderStore.createIndex('branch', 'branch._id', { unique: false })
          }
          if (!orderStore.indexNames.contains('user')) {
            orderStore.createIndex('user', 'user._id', { unique: false })
          }
          if (!orderStore.indexNames.contains('provider')) {
            orderStore.createIndex('provider', 'provider._id', { unique: false })
          }
          if (!orderStore.indexNames.contains('status')) {
            orderStore.createIndex('status', 'status', { unique: false })
          }
        }

        // Store para sucursales
        if (!db.objectStoreNames.contains('branches')) {
          db.createObjectStore('branches', { keyPath: 'id' })
        }

        // Store para usuarios
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' })
          userStore.createIndex('email', 'email', { unique: true })
          userStore.createIndex('branch', 'branch', { unique: false })
        } else {
          const userStore = transaction.objectStore('users')
          if (!userStore.indexNames.contains('email')) {
            userStore.createIndex('email', 'email', { unique: true })
          }
          if (!userStore.indexNames.contains('branch')) {
            userStore.createIndex('branch', 'branch', { unique: false })
          }
        }

        // Store para cola de sincronización
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' })
          syncStore.createIndex('synced', 'synced', { unique: false })
          syncStore.createIndex('entity', 'entity', { unique: false })
        } else {
          const syncStore = transaction.objectStore('sync_queue')
          if (!syncStore.indexNames.contains('synced')) {
            syncStore.createIndex('synced', 'synced', { unique: false })
          }
          if (!syncStore.indexNames.contains('entity')) {
            syncStore.createIndex('entity', 'entity', { unique: false })
          }
        }
      }
    })

    return this.initPromise
  }

  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('IndexedDB no inicializado. Llama a init() primero.')
    }
    return this.db
  }

  // ==================== PROVIDERS ====================

  async getProviders(branchId?: string): Promise<any[]> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['providers'], 'readonly')
      const store = transaction.objectStore('providers')
      
      let request: IDBRequest
      if (branchId) {
        const index = store.index('branch')
        request = index.getAll(branchId)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getProvider(id: string): Promise<any | null> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['providers'], 'readonly')
      const store = transaction.objectStore('providers')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async saveProvider(provider: any): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['providers'], 'readwrite')
      const store = transaction.objectStore('providers')
      const request = store.put(provider)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async saveProviders(providers: any[]): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['providers'], 'readwrite')
      const store = transaction.objectStore('providers')

      let completed = 0
      providers.forEach((provider) => {
        const request = store.put(provider)
        request.onsuccess = () => {
          completed++
          if (completed === providers.length) resolve()
        }
        request.onerror = () => reject(request.error)
      })

      if (providers.length === 0) resolve()
    })
  }

  async deleteProvider(id: string): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['providers'], 'readwrite')
      const store = transaction.objectStore('providers')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async searchProviders(query: string, branchId?: string): Promise<any[]> {
    const providers = await this.getProviders(branchId)
    const lowerQuery = query.toLowerCase()
    return providers.filter((p) => p.name.toLowerCase().includes(lowerQuery))
  }

  // ==================== ORDERS ====================

  async getOrders(filters?: { branchId?: string; userId?: string; providerId?: string }): Promise<any[]> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readonly')
      const store = transaction.objectStore('orders')
      
      let request: IDBRequest
      if (filters?.branchId) {
        const index = store.index('branch')
        request = index.getAll(filters.branchId)
      } else if (filters?.userId) {
        const index = store.index('user')
        request = index.getAll(filters.userId)
      } else if (filters?.providerId) {
        const index = store.index('provider')
        request = index.getAll(filters.providerId)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => {
        let results = request.result
        
        // Filtros adicionales si es necesario
        if (filters?.branchId && filters?.userId) {
          results = results.filter((o: any) => 
            o.branch._id === filters.branchId && o.user._id === filters.userId
          )
        }
        
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getOrder(id: string): Promise<any | null> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readonly')
      const store = transaction.objectStore('orders')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async saveOrder(order: any): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readwrite')
      const store = transaction.objectStore('orders')
      const request = store.put(order)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async saveOrders(orders: any[]): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readwrite')
      const store = transaction.objectStore('orders')

      let completed = 0
      orders.forEach((order) => {
        const request = store.put(order)
        request.onsuccess = () => {
          completed++
          if (completed === orders.length) resolve()
        }
        request.onerror = () => reject(request.error)
      })

      if (orders.length === 0) resolve()
    })
  }

  async deleteOrder(id: string): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readwrite')
      const store = transaction.objectStore('orders')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== BRANCHES ====================

  async getBranches(): Promise<any[]> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['branches'], 'readonly')
      const store = transaction.objectStore('branches')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getBranch(id: string): Promise<any | null> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['branches'], 'readonly')
      const store = transaction.objectStore('branches')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async saveBranch(branch: any): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['branches'], 'readwrite')
      const store = transaction.objectStore('branches')
      const request = store.put(branch)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async saveBranches(branches: any[]): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['branches'], 'readwrite')
      const store = transaction.objectStore('branches')

      let completed = 0
      branches.forEach((branch) => {
        const request = store.put(branch)
        request.onsuccess = () => {
          completed++
          if (completed === branches.length) resolve()
        }
        request.onerror = () => reject(request.error)
      })

      if (branches.length === 0) resolve()
    })
  }

  // ==================== USERS ====================

  async getUsers(): Promise<any[]> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly')
      const store = transaction.objectStore('users')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getUser(id: string): Promise<any | null> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly')
      const store = transaction.objectStore('users')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async saveUser(user: any): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite')
      const store = transaction.objectStore('users')
      const request = store.put(user)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async saveUsers(users: any[]): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite')
      const store = transaction.objectStore('users')

      let completed = 0
      users.forEach((user) => {
        const request = store.put(user)
        request.onsuccess = () => {
          completed++
          if (completed === users.length) resolve()
        }
        request.onerror = () => reject(request.error)
      })

      if (users.length === 0) resolve()
    })
  }

  // ==================== SYNC QUEUE ====================

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    const db = this.ensureDB()
    const syncItem: SyncQueueItem = {
      ...item,
      id: `${item.entity}-${item.type}-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      synced: 0, // 0 = no sincronizado
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readwrite')
      const store = transaction.objectStore('sync_queue')
      const request = store.put(syncItem)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readonly')
      const store = transaction.objectStore('sync_queue')
      const index = store.index('synced')
      const request = index.getAll(IDBKeyRange.only(0))

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markAsSynced(id: string): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readwrite')
      const store = transaction.objectStore('sync_queue')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.synced = 1 // 1 = sincronizado
          const putRequest = store.put(item)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async clearSyncedItems(): Promise<void> {
    const db = this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readwrite')
      const store = transaction.objectStore('sync_queue')
      const index = store.index('synced')
      const request = index.openCursor(IDBKeyRange.only(1)) // 1 = sincronizado

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== UTILITY ====================

  async clearAll(): Promise<void> {
    const db = this.ensureDB()
    const stores = ['providers', 'orders', 'branches', 'users', 'sync_queue']
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(stores, 'readwrite')
      
      stores.forEach((storeName) => {
        const store = transaction.objectStore(storeName)
        store.clear()
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

export const indexedDBService = new IndexedDBService()
