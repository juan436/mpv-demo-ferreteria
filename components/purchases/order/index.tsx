/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useProviders } from "@/hooks/use-providers"
import { useAuth } from "@/hooks/use-auth"
import { useDevice } from "@/hooks/use-device"
import { useOrders } from "@/hooks/use-orders"
import { ItemsStep } from "./items-step"
import { PreviewStep } from "./preview-step"
import { DetailsStep } from "./details-step"
import { validateItem, buildDuplicateCounts, getTodayLocalISO } from "./utils"
import type { OrderFormProps, OrderFormItem, OrderFormStep } from "./types"
import type { CreateOrderData } from "@/services/order.service"

export function OrderForm({ onSubmit, onCancel, loading = false }: OrderFormProps) {
  const { providers, createProvider } = useProviders()
  const { user } = useAuth()
  const { isMobile } = useDevice()
  const { orders } = useOrders()

  const [step, setStep] = useState<OrderFormStep>("items")
  const [items, setItems] = useState<OrderFormItem[]>([])
  const [currentItem, setCurrentItem] = useState({
    productCode: "",
    productName: "",
    quantity: "", 
  })

  const [showCartModal, setShowCartModal] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState("")
  const [providerSearch, setProviderSearch] = useState("")
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  const [orderDate, setOrderDate] = useState(getTodayLocalISO())
  const [showProviderForm, setShowProviderForm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [compareOpen, setCompareOpen] = useState(false)

  const DRAFT_KEY = "orderFormDraft"
  const hydratedRef = useRef(false)

  // Cargar borrador al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        if (Array.isArray(draft.items)) setItems(draft.items)
        if (draft.currentItem && typeof draft.currentItem === "object") setCurrentItem(draft.currentItem)
        if (typeof draft.selectedProviderId === "string") setSelectedProviderId(draft.selectedProviderId)
        if (typeof draft.providerSearch === "string") setProviderSearch(draft.providerSearch)
        if (typeof draft.orderDate === "string") setOrderDate(draft.orderDate)
        if (draft.step === "items" || draft.step === "preview" || draft.step === "details") setStep(draft.step)
      }
    } catch {}
    setTimeout(() => {
      hydratedRef.current = true
    }, 0)
  }, [])

  // Guardar borrador cuando cambie el estado
  useEffect(() => {
    if (!hydratedRef.current) return
    const draft = {
      items,
      currentItem,
      selectedProviderId,
      providerSearch,
      orderDate,
      step,
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {}
  }, [items, currentItem, selectedProviderId, providerSearch, orderDate, step])

  const duplicateCounts = useMemo(() => buildDuplicateCounts(items), [items])
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const filteredProviders = providers.filter((provider) =>
    provider.name.toLowerCase().includes(providerSearch.toLowerCase()),
  )

  const addItem = () => {
    const parsedQty = Number.parseInt(currentItem.quantity || "")
    const validationErrors = validateItem({
      productCode: currentItem.productCode,
      productName: currentItem.productName,
      quantity: Number.isFinite(parsedQty) ? parsedQty : 0,
    })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const newItem: OrderFormItem = {
      ...currentItem,
      productCode: currentItem.productCode?.trim() ? currentItem.productCode.trim() : 'nt',
      // convertir a número validado
      quantity: parsedQty,
      tempId: Date.now().toString(),
    }

    setItems((prev) => [...prev, newItem])
    setCurrentItem({
      productCode: "",
      productName: "",
      quantity: "",
    })
    setErrors({})
  }

  const removeItem = (tempId: string) => {
    setItems((prev) => prev.filter((item) => item.tempId !== tempId))
  }

  const updateItem = (
    tempId: string,
    changes: { productCode: string; productName: string; quantity: number },
  ) => {
    // Validar usando la misma regla que al agregar
    const validationErrors = validateItem({
      productCode: changes.productCode,
      productName: changes.productName,
      quantity: changes.quantity,
    })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors((prev) => {
      const next = { ...prev }
      delete (next as any).items
      return next
    })
    setItems((prev) =>
      prev.map((it) =>
        it.tempId === tempId
          ? {
              ...it,
              productCode: changes.productCode?.trim() ? changes.productCode.trim() : 'nt',
              productName: changes.productName,
              quantity: changes.quantity,
            }
          : it,
      ),
    )
  }

  const goToPreview = () => {
    if (items.length === 0) {
      setErrors({ items: "Debe agregar al menos un producto" })
      return
    }
    setErrors({})
    setStep("preview")
  }

  const goToDetails = () => {
    setStep("details")
  }

  const handleCreateProvider = async (name: string): Promise<boolean> => {
    // createProvider obtiene branch del localStorage automáticamente
    const success = await createProvider(name)
    if (success) {
      const newProvider = providers.find((p) => p.name === name)
      if (newProvider) {
        setSelectedProviderId(newProvider.id)
      }
    }
    return success
  }

  const handleSubmit = async () => {
    if (!selectedProviderId) {
      setErrors({ provider: "Debe seleccionar un proveedor" })
      return
    }

    if (!user) {
      setErrors({ user: "Usuario no autenticado" })
      return
    }

    const selectedProvider = providers.find((p) => p.id === selectedProviderId)
    if (!selectedProvider) {
      setErrors({ provider: "Proveedor no válido" })
      return
    }

    const orderData: CreateOrderData = {
      provider: {
        _id: selectedProviderId,
        name: selectedProvider.name
      },
      date: orderDate,
      status: 'completed',
      items: items.map(({ tempId, ...item }) => ({
        ...item,
        productCode: item.productCode?.trim() ? item.productCode.trim() : 'NT',
      })),
      // user y branch se agregan automáticamente del localStorage en OrderService
    }

    const success = await onSubmit(orderData)
    if (success) {
      setItems([])
      setCurrentItem({ productCode: "", productName: "", quantity: "" })
      setSelectedProviderId("")
      setProviderSearch("")
      setShowProviderDropdown(false)
      setOrderDate(getTodayLocalISO())
      setStep("items")
      setErrors({})
      try { localStorage.removeItem(DRAFT_KEY) } catch {}
    }
  }

  const handleCancel = () => {
    setItems([])
    setCurrentItem({ productCode: "", productName: "", quantity: "" })
    setSelectedProviderId("")
    setProviderSearch("")
    setShowProviderDropdown(false)
    setOrderDate(getTodayLocalISO())
    setShowCartModal(false)
    setErrors({})
    setStep("items")
    try { localStorage.removeItem(DRAFT_KEY) } catch {}
    if (onCancel) onCancel()
  }

  const handleProviderSelect = (providerId: string, providerName: string) => {
    setSelectedProviderId(providerId)
    setProviderSearch(providerName)
    setShowProviderDropdown(false)
  }

  const handleProviderSearchChange = (value: string) => {
    setProviderSearch(value)
    setShowProviderDropdown(true)

    const exactMatch = providers.find((p) => p.name.toLowerCase() === value.toLowerCase())
    if (exactMatch) {
      setSelectedProviderId(exactMatch.id)
    } else {
      setSelectedProviderId("")
    }
  }

  if (step === "items") {
    return (
      <ItemsStep
        currentItem={currentItem}
        items={items}
        duplicateCounts={duplicateCounts}
        totalItems={totalItems}
        errors={errors}
        isMobile={isMobile}
        showCartModal={showCartModal}
        onCurrentItemChange={setCurrentItem}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onUpdateItem={updateItem}
        onShowCartModal={setShowCartModal}
        onCancel={handleCancel}
        onPreview={goToPreview}
      />
    )
  }

  if (step === "preview") {
    return (
      <PreviewStep
        items={items}
        duplicateCounts={duplicateCounts}
        totalItems={totalItems}
        isMobile={isMobile}
        orders={orders}
        compareOpen={compareOpen}
        onCompareOpenChange={setCompareOpen}
        onBack={() => setStep("items")}
        onContinue={goToDetails}
      />
    )
  }

  return (
    <DetailsStep
      providerSearch={providerSearch}
      selectedProviderId={selectedProviderId}
      orderDate={orderDate}
      errors={errors}
      loading={loading}
      providers={providers}
      filteredProviders={filteredProviders}
      showProviderDropdown={showProviderDropdown}
      showProviderForm={showProviderForm}
      onProviderSearchChange={handleProviderSearchChange}
      onProviderSelect={handleProviderSelect}
      onProviderFocus={() => setShowProviderDropdown(true)}
      onDateChange={setOrderDate}
      onShowProviderForm={setShowProviderForm}
      onCreateProvider={handleCreateProvider}
      onBack={() => setStep("preview")}
      onSubmit={handleSubmit}
    />
  )
}
