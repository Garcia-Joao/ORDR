'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryTabs } from '@/components/pos/category-tabs'
import { ProductGrid } from '@/components/pos/product-grid'
import { OrderPanel } from '@/components/pos/order-panel'
import { OrdersList } from '@/components/pos/orders-list'
import { TicketPreview } from '@/components/pos/ticket-preview'
import { ListOrdered, Clock, Wifi, WifiOff } from 'lucide-react'
import type { Order, OrderItem, Product, ProductVariation, CategoryConfig } from '@/lib/pos-types'
import { generateSampleOrders, DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, getItemPrice } from '@/lib/pos-types'

function generateOrderId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Generate unique key for order item (product + variation combo)
function getItemKey(item: OrderItem): string {
  if (item.selectedVariations && item.selectedVariations.length > 0) {
    return `${item.product.id}-${item.selectedVariations.map(v => v.id).join('-')}`
  }
  return item.selectedVariation 
    ? `${item.product.id}-${item.selectedVariation.id}` 
    : item.product.id
}

export default function POSPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES)
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS)
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || 'drinks')
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([])
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [currentComanda, setCurrentComanda] = useState<number | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [showOrdersList, setShowOrdersList] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [time, setTime] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // Initialize on client only to avoid hydration mismatch
  useEffect(() => {
    setCurrentOrderId(generateOrderId())
    setTime(new Date())
    
    // Check authentication
    const user = localStorage.getItem('ordr-user')
    if (user) {
      setCurrentUser(user)
    } else {
      router.push('/login')
    }
    setIsLoading(false)
  }, [router])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Track online status
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load sample orders on mount
  useEffect(() => {
    setOrders(generateSampleOrders())
  }, [])

  // Sync categories/products from localStorage if available (shared with produtos page)
  useEffect(() => {
    const savedCategories = localStorage.getItem('ordr-categories')
    const savedProducts = localStorage.getItem('ordr-products')
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories))
      } catch {}
    }
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts))
      } catch {}
    }
  }, [])

  const handleAddProduct = useCallback((product: Product, variation?: ProductVariation, variations?: ProductVariation[]) => {
    setCurrentOrderItems((prev) => {
      // For multiple variations, create a unique key
      const itemKey = variations 
        ? `${product.id}-${variations.map(v => v.id).join('-')}`
        : variation ? `${product.id}-${variation.id}` : product.id
      
      const existingItem = prev.find((item) => getItemKey(item) === itemKey)
      
      if (existingItem) {
        return prev.map((item) =>
          getItemKey(item) === itemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1, selectedVariation: variation, selectedVariations: variations }]
    })
  }, [])

  const handleUpdateQuantity = useCallback((itemKey: string, delta: number) => {
    setCurrentOrderItems((prev) =>
      prev
        .map((item) =>
          getItemKey(item) === itemKey
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const handleRemoveItem = useCallback((itemKey: string) => {
    setCurrentOrderItems((prev) =>
      prev.filter((item) => getItemKey(item) !== itemKey)
    )
  }, [])

  const handleClearOrder = useCallback(() => {
    setCurrentOrderItems([])
    setCurrentOrderId(generateOrderId())
    setCurrentComanda(null)
  }, [])

  const handleCharge = useCallback(() => {
    if (currentOrderItems.length === 0 || currentComanda === null || currentOrderId === null) return

    const subtotal = currentOrderItems.reduce(
      (sum, item) => sum + getItemPrice(item) * item.quantity,
      0
    )
    const tax = subtotal * 0.08
    const total = subtotal + tax

    const newOrder: Order = {
      id: currentOrderId,
      comanda: currentComanda,
      items: [...currentOrderItems],
      total,
      status: 'paid',
      createdAt: new Date(),
      paidAt: new Date(),
    }

    setOrders((prev) => [newOrder, ...prev])
    setSelectedOrder(newOrder)
    setCurrentOrderItems([])
    setCurrentOrderId(generateOrderId())
    setCurrentComanda(null)
  }, [currentOrderItems, currentOrderId, currentComanda])

  const handleSelectOrder = useCallback((order: Order) => {
    setSelectedOrder(order)
  }, [])

  const handlePrint = useCallback(() => {
    setSelectedOrder(null)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('ordr-user')
    setCurrentUser(null)
    setCurrentOrderItems([])
    setCurrentOrderId(generateOrderId())
    setCurrentComanda(null)
    router.push('/login')
  }, [router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">Ponto de Venda</h1>
        <div className="flex items-center gap-6">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <span className={`text-sm ${isOnline ? 'text-success' : 'text-destructive'}`}>
              {isOnline ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono" suppressHydrationWarning>
              {time?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || '--:--'}
            </span>
          </div>

          {/* User & Logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{currentUser}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Orders List (toggleable) */}
        {showOrdersList && (
          <div className="w-[320px] flex flex-col border-r border-border bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Pedidos Recentes</h2>
              <span className="text-sm text-muted-foreground">
                {orders.length} pedido{orders.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <OrdersList orders={orders} onSelectOrder={handleSelectOrder} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar with Category Tabs and Orders Toggle */}
          <div className="flex items-center border-b border-border bg-card/50">
            <button
              onClick={() => setShowOrdersList(!showOrdersList)}
              className={`flex items-center gap-2 px-5 py-4 border-r border-border transition-colors shrink-0 ${
                showOrdersList
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <ListOrdered className="h-5 w-5" />
              <span className="text-sm font-medium">Pedidos</span>
              {orders.length > 0 && (
                <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {orders.length}
                </span>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <CategoryTabs
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid
            category={selectedCategory}
            products={products}
            categories={categories}
            onAddProduct={handleAddProduct}
          />
        </div>

        {/* Right Panel - Current Order */}
        <OrderPanel
          items={currentOrderItems}
          orderId={currentOrderId}
          comanda={currentComanda}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearOrder={handleClearOrder}
          onCharge={handleCharge}
          onSetComanda={setCurrentComanda}
        />
      </div>

      {/* Ticket Preview Modal */}
      {selectedOrder && (
        <TicketPreview
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrint={handlePrint}
        />
      )}
    </div>
  )
}
