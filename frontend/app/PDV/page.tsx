'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryTabs } from '@/components/pos/category-tabs'
import { ProductGrid } from '@/components/pos/product-grid'
import { OrderPanel } from '@/components/pos/order-panel'
import { OrdersList } from '@/components/pos/orders-list'
import { TicketPreview } from '@/components/pos/ticket-preview'
import { ListOrdered, Clock, Wifi, WifiOff, Loader2, Search } from 'lucide-react'
import type {
  Order,
  OrderItem,
  Product,
  OrderItemVariationSelection,
  CategoryConfig,
} from '@/lib/pos-types'
import { getItemPrice } from '@/lib/pos-types'

import { createOrder, getCategories, getProducts } from '@/lib/api'
import { logout } from '@/lib/api'
import { getOrders } from '@/lib/api/orders'

function generateOrderId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function getItemKey(item: OrderItem): string {
  const selections = (item.variationSelections ?? [])
    .map((selection) => ({
      groupId: selection.groupId,
      selectedOptionIds: [...selection.selectedOptionIds].sort(),
    }))
    .sort((a, b) => a.groupId.localeCompare(b.groupId))

  const selectionKey = JSON.stringify(selections)
  return `${item.product.id}-${selectionKey}`
}

function isToday(date: Date) {
  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export default function POSPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryConfig[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [productSearch, setProductSearch] = useState('')
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([])
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)

  const [currentComandaNumber, setCurrentComandaNumber] = useState<number | null>(null)
  const [currentComandaName, setCurrentComandaName] = useState('')
  const [applyTax, setApplyTax] = useState(true)

  const [orders, setOrders] = useState<Order[]>([])
  const [showOrdersList, setShowOrdersList] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [time, setTime] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const REQUIRE_COMANDA_STORAGE_KEY = 'ordr-settings-require-comanda'
  const [requireComanda, setRequireComanda] = useState(true)
  const taxRate = 0.1

  useEffect(() => {
    const savedRequireComanda = localStorage.getItem(REQUIRE_COMANDA_STORAGE_KEY)
    if (savedRequireComanda !== null) {
      setRequireComanda(savedRequireComanda === 'true')
    }
  }, [])

  useEffect(() => {
    setCurrentOrderId(generateOrderId())
    setTime(new Date())

    const user = localStorage.getItem('ordr-user')
    if (user) {
      try {
        const parsedUser = JSON.parse(user)
        setCurrentUser(parsedUser.username ?? parsedUser)
      } catch {
        setCurrentUser(user)
      }
    } else {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, categoriesData, ordersData] = await Promise.all([
          getProducts(),
          getCategories(),
          getOrders(true),
        ])

        setProducts(productsData)
        setCategories(categoriesData)

        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id)
        }

        const normalizedOrders: Order[] = ordersData
          .filter((order) => order.status === 'paid' || order.status === 'cancelled')
          .map((order) => ({
            ...order,
            total: Number(order.total ?? 0),
            createdAt: new Date(order.createdAt as any),
            paidAt: order.paidAt ? new Date(order.paidAt as any) : undefined,
          }))
          .filter((order) => isToday(new Date(order.createdAt)))

        setOrders(normalizedOrders)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategory('')
      return
    }

    const categoryStillExists = categories.some(
      (cat) => cat.id === selectedCategory
    )

    if (!categoryStillExists) {
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory])

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        term === '' ||
        product.name.toLowerCase().includes(term) ||
        (product.description ?? '').toLowerCase().includes(term) ||
        (product.emoji ?? '').toLowerCase().includes(term)

      if (!matchesSearch) return false

      if (term !== '') {
        return true
      }

      return !selectedCategory || product.categoryId === selectedCategory
    })
  }, [products, selectedCategory, productSearch])

  const handleAddProduct = useCallback(
    (product: Product, variationSelections?: OrderItemVariationSelection[]) => {
      if (isSubmittingOrder) return

      setCurrentOrderItems((prev) => {
        const newItem: OrderItem = {
          product,
          quantity: 1,
          variationSelections,
        }

        const itemKey = getItemKey(newItem)
        const existingItem = prev.find((item) => getItemKey(item) === itemKey)

        if (existingItem) {
          return prev.map((item) =>
            getItemKey(item) === itemKey
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }

        return [...prev, newItem]
      })
    },
    [isSubmittingOrder]
  )

  const handleUpdateQuantity = useCallback(
    (itemKey: string, delta: number) => {
      if (isSubmittingOrder) return

      setCurrentOrderItems((prev) =>
        prev
          .map((item) =>
            getItemKey(item) === itemKey
              ? { ...item, quantity: Math.max(0, item.quantity + delta) }
              : item
          )
          .filter((item) => item.quantity > 0)
      )
    },
    [isSubmittingOrder]
  )

  const handleRemoveItem = useCallback(
    (itemKey: string) => {
      if (isSubmittingOrder) return

      setCurrentOrderItems((prev) =>
        prev.filter((item) => getItemKey(item) !== itemKey)
      )
    },
    [isSubmittingOrder]
  )

  const handleClearOrder = useCallback(() => {
    if (isSubmittingOrder) return

    setCurrentOrderItems([])
    setCurrentOrderId(generateOrderId())
    setCurrentComandaNumber(null)
    setCurrentComandaName('')
    setApplyTax(true)
  }, [isSubmittingOrder])

  const handleCharge = useCallback(async () => {
    try {
      if (isSubmittingOrder) return

      if (requireComanda && currentComandaNumber == null) {
        console.error('Comanda não definida')
        return
      }

      if (!currentOrderId) {
        console.error('Order ID não definido')
        return
      }

      if (currentOrderItems.length === 0) {
        console.error('Pedido vazio')
        return
      }

      setIsSubmittingOrder(true)

      const subtotal = currentOrderItems.reduce(
        (sum, item) => sum + Number(getItemPrice(item) ?? 0) * item.quantity,
        0
      )

      const tax = applyTax ? subtotal * taxRate : 0
      const total = subtotal + tax

      const newOrder = {
        id: currentOrderId,
        comanda: currentComandaNumber ?? 0,
        comandaName: currentComandaName.trim() || null,
        items: [...currentOrderItems],
        total,
        status: 'paid' as const,
        createdAt: new Date(),
        paidAt: new Date(),
      }

      console.log('SENDING ORDER:', newOrder)

      const savedOrder = await createOrder(newOrder)

      const normalizedOrder = {
        ...newOrder,
        id: savedOrder.id ?? newOrder.id,
        comanda: savedOrder.comanda ?? newOrder.comanda,
        comandaName: newOrder.comandaName,
        total: Number(savedOrder.total ?? newOrder.total ?? 0),
        status: savedOrder.status ?? newOrder.status,
        items: newOrder.items,
        createdAt: savedOrder.createdAt
          ? new Date(savedOrder.createdAt)
          : newOrder.createdAt,
        paidAt: savedOrder.paidAt
          ? new Date(savedOrder.paidAt)
          : newOrder.paidAt,
      }

      setOrders((prev) => [normalizedOrder, ...prev])
      setSelectedOrder(normalizedOrder)
      setCurrentOrderItems([])
      setCurrentOrderId(generateOrderId())
      setCurrentComandaNumber(null)
      setCurrentComandaName('')
      setApplyTax(true)
    } catch (err) {
      console.error('Erro ao enviar pedido:', err)
    } finally {
      setIsSubmittingOrder(false)
    }
  }, [
    applyTax,
    currentComandaName,
    currentComandaNumber,
    currentOrderId,
    currentOrderItems,
    isSubmittingOrder,
    requireComanda,
  ])

  const handleSelectOrder = useCallback((order: Order) => {
    if (isSubmittingOrder) return
    setSelectedOrder(order)
  }, [isSubmittingOrder])

  const handlePrint = useCallback(() => {
    if (isSubmittingOrder) return
    setSelectedOrder(null)
  }, [isSubmittingOrder])

  const handleLogout = useCallback(async () => {
    try {
      if (isSubmittingOrder) return

      await logout()

      localStorage.removeItem('ordr-user')
      setCurrentUser(null)
      setCurrentOrderItems([])
      setCurrentOrderId(generateOrderId())
      setCurrentComandaNumber(null)
      setCurrentComandaName('')
      setApplyTax(true)

      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao deslogar:', error)
    }
  }, [isSubmittingOrder])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {isSubmittingOrder && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-xl bg-card px-5 py-4 shadow-lg border border-border">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium text-foreground">
              Salvando pedido e imprimindo...
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">Ponto de Venda</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <span
              className={`text-sm ${isOnline ? 'text-success' : 'text-destructive'}`}
            >
              {isOnline ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono" suppressHydrationWarning>
              {time?.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              }) || '--:--'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{currentUser}</span>
            <button
              onClick={handleLogout}
              disabled={isSubmittingOrder}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showOrdersList && (
          <div className="w-[320px] flex flex-col border-r border-border bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Pedidos de Hoje
              </h2>
              <span className="text-sm text-muted-foreground">
                {orders.length} pedido{orders.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <OrdersList orders={orders} onSelectOrder={handleSelectOrder} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-border bg-card/50">
            <button
              onClick={() => !isSubmittingOrder && setShowOrdersList(!showOrdersList)}
              disabled={isSubmittingOrder}
              className={`flex items-center gap-2 px-5 py-4 border-r border-border transition-colors shrink-0 ${
                showOrdersList
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
              {categories.length > 0 ? (
                <CategoryTabs
                  categories={categories}
                  selected={selectedCategory}
                  onSelect={isSubmittingOrder ? () => {} : setSelectedCategory}
                />
              ) : (
                <div className="px-5 py-4 text-sm text-muted-foreground">
                  Nenhuma categoria cadastrada
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-4 border-b border-border bg-card">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar produto em todas as categorias..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <ProductGrid
            category={productSearch.trim() ? '' : selectedCategory}
            products={filteredProducts}
            categories={categories}
            onAddProduct={handleAddProduct}
          />
        </div>

        <OrderPanel
          items={currentOrderItems}
          orderId={currentOrderId}
          comandaNumber={currentComandaNumber}
          comandaName={currentComandaName}
          applyTax={applyTax}
          requireComanda={requireComanda}
          taxRate={taxRate}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearOrder={handleClearOrder}
          onCharge={handleCharge}
          onSetComandaNumber={setCurrentComandaNumber}
          onSetComandaName={setCurrentComandaName}
          onSetApplyTax={setApplyTax}
          isLoading={isSubmittingOrder}
        />
      </div>

      {selectedOrder && (
        <TicketPreview
          order={selectedOrder}
          onClose={() => !isSubmittingOrder && setSelectedOrder(null)}
          onPrint={handlePrint}
        />
      )}
    </div>
  )
}