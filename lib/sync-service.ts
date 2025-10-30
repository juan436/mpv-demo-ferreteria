/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

/**
 * Servicio de Sincronización Online/Offline
 * - Detecta estado de conexión
 * - Ping a Google DNS (8.8.8.8) cada 5 minutos
 * - Sincroniza datos pendientes cuando vuelve online
 * - Modo manual con botón
 */

import { indexedDBService } from './indexeddb'
import { apiClient } from './api-client'
import { API_ENDPOINTS } from './api-config'

type ConnectionStatus = 'online' | 'offline' | 'checking'

interface SyncListener {
  onStatusChange: (status: ConnectionStatus) => void
  onSyncStart?: () => void
  onSyncComplete?: (success: boolean) => void
}


class SyncService {
  private status: ConnectionStatus = 'checking'
  private listeners: Set<SyncListener> = new Set()
  private pingInterval: NodeJS.Timeout | null = null
  private manualOffline: boolean = false
  private readonly PING_INTERVAL = 1 * 60 * 1000 // 2 minutos
  private isSyncing: boolean = false
  private idMap: Map<string, string> = new Map() // tempId -> realId
  private lastPingTime: number = 0
  private readonly STORAGE_KEYS = {
    manual: 'manualOffline',
    status: 'netStatus',
  } as const

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private async init() {
    // Inicializar IndexedDB (idempotente, no falla si ya está inicializado)
    try {
      await indexedDBService.init()
    } catch (error) {
      console.error('❌ SyncService: Error inicializando IndexedDB:', error)
    }

    // Detectar eventos nativos de conexión
    window.addEventListener('online', () => this.handleNativeOnline())
    window.addEventListener('offline', () => this.handleNativeOffline())

    // Restaurar flags persistidos
    try {
      const manual = localStorage.getItem(this.STORAGE_KEYS.manual) === '1'
      this.manualOffline = manual
      const lastStatus = localStorage.getItem(this.STORAGE_KEYS.status) as ConnectionStatus | null
      if (manual) {
        this.setStatus('offline')
      } else {
        const navigatorOffline = (typeof navigator !== 'undefined' && navigator.onLine === false)
        const lastWasOffline = (lastStatus === 'offline')
        if (navigatorOffline || lastWasOffline) {
          this.setStatus('offline')
          this.startPing()
        } else {
          this.setStatus('checking')
          await this.checkConnection()
          this.startPing()
        }
      }
    } catch {
      await this.checkConnection()
      this.startPing()
    }
  }

  private handleNativeOnline() {
    if (!this.manualOffline) {
      this.checkConnection()
    }
  }

  private handleNativeOffline() {
    if (!this.manualOffline) {
      this.setStatus('offline')
    }
  }

  /**
   * Ping a Google DNS (8.8.8.8) para verificar conectividad real
   */
  private async pingGoogleDNS(): Promise<boolean> {
    try {
      // Intentar hacer fetch a un endpoint que siempre responde
      // Usamos Google DNS sobre HTTP (no podemos hacer ping directo desde browser)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos timeout

      const response = await fetch('https://dns.google/resolve?name=google.com&type=A', {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache',
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.warn('⚠️ Ping a Google DNS falló:', error)
      return false
    }
  }

  /**
   * Verifica la conexión real (no solo navigator.onLine)
   */
  async checkConnection(): Promise<boolean> {
    if (this.manualOffline) {
      this.setStatus('offline')
      return false
    }

    this.setStatus('checking')
    const isOnline = await this.pingGoogleDNS()
    
    this.lastPingTime = Date.now()
    this.setStatus(isOnline ? 'online' : 'offline')

    if (isOnline) {
      this.syncPendingData()
    }

    return isOnline
  }

  /**
   * Inicia el ping periódico cada 5 minutos
   */
  private startPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }

    this.pingInterval = setInterval(async () => {
      if (!this.manualOffline) {
        await this.checkConnection()
      }
    }, this.PING_INTERVAL)
  }

  /**
   * Detiene el ping periódico
   */
  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  /**
   * Activa/desactiva modo offline manual
   */
  async toggleManualOffline(): Promise<void> {
    this.manualOffline = !this.manualOffline
    try { localStorage.setItem(this.STORAGE_KEYS.manual, this.manualOffline ? '1' : '0') } catch {}
    
    if (this.manualOffline) {
      this.setStatus('offline')
      this.stopPing()
    } else {
      this.startPing()
      await this.checkConnection()
    }
  }

  /**
   * Obtiene el estado actual de conexión
   */
  getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * Verifica si está en modo offline manual
   */
  isManualOffline(): boolean {
    return this.manualOffline
  }

  /**
   * Cambia el estado y notifica a los listeners
   */
  private setStatus(status: ConnectionStatus) {
    if (this.status !== status) {
      this.status = status
      try { localStorage.setItem(this.STORAGE_KEYS.status, this.status) } catch {}
      this.notifyListeners()
    }
  }

  /**
   * Sincroniza datos pendientes con el servidor
   */
  private async syncPendingData() {
    if (this.isSyncing || this.status !== 'online') {
      return
    }

    this.isSyncing = true
    this.notifySyncStart()

    try {
      const pendingItems = await indexedDBService.getPendingSyncItems()
      
      if (pendingItems.length === 0) {
        this.notifySyncComplete(true)
        return
      }

      // Ordenar por prioridad: providers y branches primero, luego users, luego orders
      const priorityOrder = { provider: 1, branch: 2, user: 3, order: 4 }
      const sortedItems = pendingItems.sort((a, b) => {
        const priorityA = priorityOrder[a.entity as keyof typeof priorityOrder] || 999
        const priorityB = priorityOrder[b.entity as keyof typeof priorityOrder] || 999
        return priorityA - priorityB
      })

      let successCount = 0
      let failCount = 0

      for (const item of sortedItems) {
        try {
          await this.syncItem(item)
          await indexedDBService.markAsSynced(item.id)
          successCount++
        } catch (error) {
          console.error(`❌ Error sincronizando item ${item.id}:`, error)
          failCount++
        }
      }

      // Limpiar items sincronizados
      await indexedDBService.clearSyncedItems()

      this.notifySyncComplete(failCount === 0)
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
      this.notifySyncComplete(false)
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Sincroniza un item individual con el servidor
   */
  private async syncItem(item: any): Promise<void> {
    
    const { entity, type, data } = item

    try {
      switch (entity) {
        case 'provider':
          await this.syncProvider(type, data)
          break
        
        case 'order':
          await this.syncOrder(type, data)
          break
        
        case 'branch':
          await this.syncBranch(type, data)
          break
        
        case 'user':
          await this.syncUser(type, data)
          break
        
        default:
          console.warn(`⚠️ Entidad desconocida: ${entity}`)
      }
      
    } catch (error) {
      console.error(`❌ Error sincronizando ${entity} ${type}:`, error)
      throw error
    }
  }

  /**
   * Sincroniza un proveedor
   */
  private async syncProvider(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        // Extraer tempId antes de enviar al backend
        const { tempId, ...providerData } = data
        
        const response = await apiClient.post<{ _id: string }>(API_ENDPOINTS.PROVIDERS.BASE, providerData)
        
        // Si el proveedor tenía un ID temporal, guardarlo en el mapa
        if (tempId && response._id) {
          this.idMap.set(tempId, response._id)
        }
        break
      
      case 'UPDATE':
        const { id: providerId, ...providerUpdateData } = data
        await apiClient.patch(API_ENDPOINTS.PROVIDERS.BY_ID(providerId), providerUpdateData)
        break
      
      case 'DELETE':
        await apiClient.delete(API_ENDPOINTS.PROVIDERS.BY_ID(data.id))
        break
    }
  }

  /**
   * Sincroniza una orden
   */
  private async syncOrder(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        // Extraer tempId antes de enviar al backend
        const { tempId, ...orderData } = data
        
        // Mapear provider._id si es temporal
        if (orderData.provider?._id?.startsWith('temp-')) {
          const realProviderId = this.idMap.get(orderData.provider._id)
          if (realProviderId) {
            orderData.provider._id = realProviderId
          } else {
            throw new Error(`No se encontró el ID real para el proveedor temporal: ${orderData.provider._id}`)
          }
        }
        
        // Mapear branch._id si es temporal
        if (orderData.branch?._id?.startsWith('temp-')) {
          const realBranchId = this.idMap.get(orderData.branch._id)
          if (realBranchId) {
            orderData.branch._id = realBranchId
          }
        }
        
        // Mapear user._id si es temporal
        if (orderData.user?._id?.startsWith('temp-')) {
          const realUserId = this.idMap.get(orderData.user._id)
          if (realUserId) {
            orderData.user._id = realUserId
          }
        }
        
        // Crear en backend y obtener la orden con ID real
        const createdOrder = await apiClient.post<any>(API_ENDPOINTS.ORDERS.BASE, orderData)
        
        // Si había un ID temporal, actualizar IndexedDB
        if (tempId && createdOrder._id) {
          // Eliminar la orden temporal
          await indexedDBService.deleteOrder(tempId)
          
          // Guardar la orden real
          await indexedDBService.saveOrder({
            id: createdOrder._id,
            invoiceCode: createdOrder.invoiceCode,
            provider: createdOrder.provider,
            user: createdOrder.user,
            branch: createdOrder.branch,
            date: createdOrder.date,
            status: createdOrder.status,
            items: createdOrder.items,
            createdAt: createdOrder.createdAt,
          })
        }
        break
      
      case 'UPDATE':
        const { id: orderId, ...orderUpdateData } = data
        await apiClient.patch(API_ENDPOINTS.ORDERS.BY_ID(orderId), orderUpdateData)
        break
      
      case 'DELETE':
        await apiClient.delete(API_ENDPOINTS.ORDERS.BY_ID(data.id))
        break
    }
  }

  /**
   * Sincroniza una sucursal
   */
  private async syncBranch(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        // Extraer tempId antes de enviar al backend
        const { tempId, ...branchData } = data
        
        const response = await apiClient.post<{ _id: string }>(API_ENDPOINTS.BRANCHES.BASE, branchData)
        
        // Si la sucursal tenía un ID temporal, guardarlo en el mapa
        if (tempId && response._id) {
          this.idMap.set(tempId, response._id)
        }
        break
      
      case 'UPDATE':
        const { id: branchId, ...branchUpdateData } = data
        await apiClient.patch(API_ENDPOINTS.BRANCHES.BY_ID(branchId), branchUpdateData)
        break
      
      case 'DELETE':
        await apiClient.delete(API_ENDPOINTS.BRANCHES.BY_ID(data.id))
        break
    }
  }

  /**
   * Sincroniza un usuario
   */
  private async syncUser(type: string, data: any): Promise<void> {
    switch (type) {
      case 'CREATE':
        // Extraer tempId antes de enviar al backend
        const { tempId, ...userData } = data
        
        const response = await apiClient.post<{ _id: string }>(API_ENDPOINTS.USERS.BASE, userData)
        
        // Si el usuario tenía un ID temporal, guardarlo en el mapa
        if (tempId && response._id) {
          this.idMap.set(tempId, response._id)
        }
        break
      
      case 'UPDATE':
        const { id: userId, ...userUpdateData } = data
        await apiClient.patch(API_ENDPOINTS.USERS.BY_ID(userId), userUpdateData)
        break
      
      case 'DELETE':
        await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(data.id))
        break
    }
  }

  /**
   * Fuerza una sincronización inmediata
   */
  async forceSyncNow(): Promise<boolean> {
    if (this.status !== 'online') {
      console.warn('⚠️ No se puede sincronizar: sin conexión')
      return false
    }

    await this.syncPendingData()
    return true
  }

  /**
   * Registra un listener para cambios de estado
   */
  addListener(listener: SyncListener) {
    this.listeners.add(listener)
  }

  /**
   * Elimina un listener
   */
  removeListener(listener: SyncListener) {
    this.listeners.delete(listener)
  }

  /**
   * Notifica a todos los listeners sobre cambio de estado
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener.onStatusChange(this.status)
    })
  }

  /**
   * Notifica inicio de sincronización
   */
  private notifySyncStart() {
    this.listeners.forEach((listener) => {
      listener.onSyncStart?.()
    })
  }

  /**
   * Notifica fin de sincronización
   */
  private notifySyncComplete(success: boolean) {
    this.listeners.forEach((listener) => {
      listener.onSyncComplete?.(success)
    })
  }

  /**
   * Limpia todos los datos locales
   */
  async clearAllData(): Promise<void> {
    await indexedDBService.clearAll()
  }

  /**
   * Destruye el servicio
   */
  destroy() {
    this.stopPing()
    this.listeners.clear()
    indexedDBService.close()
  }
}

export const syncService = new SyncService()
export type { ConnectionStatus, SyncListener }
