'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  X,
  Eye,
  Search,
  Receipt,
  Package,
  ChevronRight,
  Loader2,
  Calendar,
} from 'lucide-react'
import type { Order, OrderItem } from '@/lib/pos-types'
import { formatBRL, getItemPrice } from '@/lib/pos-types'
import { cancelOrder, getOrders } from '@/lib/api/orders'

const statusConfig = {
  paid: {
    icon: Check,
    label: 'Confirmado',
    color: 'text-success bg-success/20',
    dot: 'bg-success',
  },
  cancelled: {
    icon: X,
    label: 'Cancelado',
    color: 'text-destructive bg-destructive/20',
    dot: 'bg-destructive',
  },
} as const

function getVariationLabels(item: OrderItem): string[] {
  if (!item.variationSelections?.length || !item.product.variationGroups?.length) {
    return []
  }

  return item.variationSelections.flatMap((selection) => {
    const group = item.product.variationGroups?.find(
      (group) => group.id === selection.groupId
    )

    if (!group) return []

    return selection.selectedOptionIds
      .map((optionId) => {
        const option = group.options.find((option) => option.id === optionId)
        return option ? `${group.name}: ${option.name}` : null
      })
      .filter((value): value is string => value !== null)
  })
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getStartOfDay(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

function getEndOfDay(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 23, 59, 59, 999)
}

function isWithinDateRange(date: Date, fromDate: string, toDate: string) {
  const time = date.getTime()

  if (fromDate) {
    const from = getStartOfDay(fromDate).getTime()
    if (time < from) return false
  }

  if (toDate) {
    const to = getEndOfDay(toDate).getTime()
    if (time > to) return false
  }

  return true
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'cancelled'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [fromDate, setFromDate] = useState(() => toDateInputValue(new Date()))
  const [toDate, setToDate] = useState(() => toDateInputValue(new Date()))

  const fromDateRef = useRef<HTMLInputElement>(null)
  const toDateRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const ordersData = await getOrders(true)

        const normalizedOrders: Order[] = ordersData
          .filter((order) => order.status === 'paid' || order.status === 'cancelled')
          .map((order) => ({
            ...order,
            total: Number(order.total ?? 0),
            createdAt: new Date(order.createdAt as any),
            paidAt: order.paidAt ? new Date(order.paidAt as any) : undefined,
          }))

        setOrders(normalizedOrders)
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter

      const matchesDate = isWithinDateRange(
        new Date(order.createdAt),
        fromDate,
        toDate
      )

      const term = search.toLowerCase().trim()
      const matchesSearch =
        term === '' ||
        String(order.comanda).includes(term) ||
        order.id.toLowerCase().includes(term) ||
        (order.comandaName ?? '').toLowerCase().includes(term)

      return matchesStatus && matchesDate && matchesSearch
    })
  }, [orders, search, statusFilter, fromDate, toDate])

  useEffect(() => {
    if (!selectedOrder) {
      setSelectedOrder(filteredOrders[0] ?? null)
      return
    }

    const stillExists = filteredOrders.find((order) => order.id === selectedOrder.id)
    setSelectedOrder(stillExists ?? filteredOrders[0] ?? null)
  }, [filteredOrders, selectedOrder])

  const selectedConfig = selectedOrder
    ? statusConfig[selectedOrder.status as 'paid' | 'cancelled']
    : null

  const handleCancelOrder = async () => {
    if (!selectedOrder || selectedOrder.status === 'cancelled') return

    const confirmed = window.confirm(
      `Deseja cancelar o pedido #${selectedOrder.id}?`
    )

    if (!confirmed) return

    try {
      setIsCancelling(true)

      const updated = await cancelOrder(selectedOrder.id)

      const normalizedUpdated: Order = {
        ...selectedOrder,
        ...updated,
        total: Number(updated.total ?? selectedOrder.total ?? 0),
        createdAt: updated.createdAt
          ? new Date(updated.createdAt)
          : selectedOrder.createdAt,
        paidAt: updated.paidAt
          ? new Date(updated.paidAt)
          : selectedOrder.paidAt,
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === normalizedUpdated.id ? normalizedUpdated : order
        )
      )

      setSelectedOrder(normalizedUpdated)
    } catch (error: any) {
      console.error('Erro ao cancelar pedido:', error)
      alert(error?.message || 'Erro ao cancelar pedido')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Pedidos</h1>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por comanda, nome ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <span className="text-sm text-muted-foreground">De</span>
          <button
            type="button"
            onClick={() => fromDateRef.current?.showPicker?.()}
            className="text-muted-foreground hover:text-foreground"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <input
            ref={fromDateRef}
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-transparent text-sm text-foreground outline-none"
            max={toDate || undefined}
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <span className="text-sm text-muted-foreground">Até</span>
          <button
            type="button"
            onClick={() => toDateRef.current?.showPicker?.()}
            className="text-muted-foreground hover:text-foreground"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <input
            ref={toDateRef}
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-transparent text-sm text-foreground outline-none"
            min={fromDate || undefined}
          />
        </div>

        <button
          onClick={() => {
            const today = toDateInputValue(new Date())
            setFromDate(today)
            setToDate(today)
          }}
          className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
        >
          Hoje
        </button>

        <button
          onClick={() => {
            setFromDate('')
            setToDate('')
          }}
          className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
        >
          Limpar datas
        </button>

        <div className="flex items-center gap-2">
          {(['all', 'paid', 'cancelled'] as const).map((status) => {
            const isActive = statusFilter === status
            const label =
              status === 'all'
                ? 'Todos'
                : statusConfig[status].label

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[380px] border-r border-border bg-card flex flex-col">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Lista de pedidos</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                <Loader2 className="h-12 w-12 mb-3 animate-spin" />
                <p className="text-sm">Carregando pedidos...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                <Receipt className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Nenhum pedido encontrado</p>
                <p className="text-xs mt-1">Tente ajustar os filtros</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => {
                  const config = statusConfig[order.status as 'paid' | 'cancelled']
                  const Icon = config.icon
                  const isSelected = selectedOrder?.id === order.id

                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left group border ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-secondary border-transparent hover:bg-secondary/80'
                      }`}
                    >
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            Comanda #{order.comanda}
                          </span>
                          <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                          <span className="text-xs text-muted-foreground">
                            {config.label}
                          </span>
                        </div>

                        {!!order.comandaName && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {order.comandaName}
                          </p>
                        )}

                        <p className="text-sm text-muted-foreground mt-0.5">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                          {order.items.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 'itens' : 'item'} • {formatBRL(order.total)}
                        </p>

                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-background flex flex-col">
          {!selectedOrder ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Package className="h-14 w-14 mb-4 opacity-50" />
              <p className="text-lg font-medium">Selecione um pedido</p>
              <p className="text-sm">Os detalhes aparecerão aqui</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-border bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-foreground">
                        Comanda #{selectedOrder.comanda}
                      </h2>
                      {selectedConfig && (
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${selectedConfig.color}`}>
                          <selectedConfig.icon className="h-4 w-4" />
                          {selectedConfig.label}
                        </span>
                      )}
                    </div>

                    {!!selectedOrder.comandaName && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Nome da comanda: {selectedOrder.comandaName}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground mt-2 font-mono">
                      Pedido #{selectedOrder.id}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Criado em{' '}
                      {new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')}{' '}
                      às{' '}
                      {new Date(selectedOrder.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    {selectedOrder.paidAt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Confirmado às{' '}
                        {new Date(selectedOrder.paidAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatBRL(selectedOrder.total)}
                      </p>
                    </div>

                    {selectedOrder.status !== 'cancelled' && (
                      <button
                        onClick={handleCancelOrder}
                        disabled={isCancelling}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            Cancelar pedido
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Itens do pedido</h3>
                  </div>

                  <div className="divide-y divide-border">
                    {selectedOrder.items.map((item, index) => {
                      const variationLabels = getVariationLabels(item)
                      const unitPrice = getItemPrice(item)
                      const lineTotal = unitPrice * item.quantity

                      return (
                        <div
                          key={`${selectedOrder.id}-${item.product.id}-${index}`}
                          className="px-5 py-4 flex items-start gap-4"
                        >
                          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-secondary text-2xl">
                            {item.product.emoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-semibold text-foreground">
                                  {item.product.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity}x {formatBRL(unitPrice)}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold text-foreground">
                                  {formatBRL(lineTotal)}
                                </p>
                              </div>
                            </div>

                            {variationLabels.length > 0 && (
                              <div className="mt-3 space-y-1">
                                {variationLabels.map((label, variationIndex) => (
                                  <div
                                    key={`${selectedOrder.id}-${index}-variation-${variationIndex}`}
                                    className="inline-flex items-center gap-1 mr-2 mb-2 px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                    {label}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}