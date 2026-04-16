'use client'

import { useMemo, useState } from 'react'
import {
  Check,
  Clock,
  X,
  Eye,
  Search,
  Receipt,
  Package,
  ChevronRight,
} from 'lucide-react'
import type { Order, OrderItem } from '@/lib/pos-types'
import { formatBRL, getItemPrice, generateSampleOrders } from '@/lib/pos-types'

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pendente',
    color: 'text-warning bg-warning/20',
    dot: 'bg-warning',
  },
  paid: {
    icon: Check,
    label: 'Pago',
    color: 'text-success bg-success/20',
    dot: 'bg-success',
  },
  cancelled: {
    icon: X,
    label: 'Cancelado',
    color: 'text-destructive bg-destructive/20',
    dot: 'bg-destructive',
  },
}

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

export default function PedidosPage() {
  const [orders] = useState<Order[]>(generateSampleOrders())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] ?? null)

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter

      const term = search.toLowerCase().trim()
      const matchesSearch =
        term === '' ||
        String(order.comanda).includes(term) ||
        order.id.toLowerCase().includes(term)

      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  const selectedConfig = selectedOrder
    ? statusConfig[selectedOrder.status]
    : null

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

      <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por comanda ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'pending', 'paid', 'cancelled'] as const).map((status) => {
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
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                <Clock className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Nenhum pedido encontrado</p>
                <p className="text-xs mt-1">Tente ajustar os filtros</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => {
                  const config = statusConfig[order.status]
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

                        <p className="text-sm text-muted-foreground mt-0.5">
                          {order.items.length} {order.items.length !== 1 ? 'itens' : 'item'} • {formatBRL(order.total)}
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
                <div className="flex items-start justify-between">
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
                        Pago às{' '}
                        {new Date(selectedOrder.paidAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatBRL(selectedOrder.total)}
                    </p>
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