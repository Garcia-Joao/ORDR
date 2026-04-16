'use client'

import { Printer, X, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Order, OrderItem } from '@/lib/pos-types'
import { formatBRL, getItemPrice } from '@/lib/pos-types'

interface TicketPreviewProps {
  order: Order
  onClose: () => void
  onPrint: () => void
}

function getItemKey(item: OrderItem): string {
  const selections = (item.variationSelections ?? [])
    .map((selection) => ({
      groupId: selection.groupId,
      selectedOptionIds: [...selection.selectedOptionIds].sort(),
    }))
    .sort((a, b) => a.groupId.localeCompare(b.groupId))

  return `${item.product.id}-${JSON.stringify(selections)}`
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

export function TicketPreview({ order, onClose, onPrint }: TicketPreviewProps) {
const items = Array.isArray(order.items) ? order.items : []
const orderTotal = Number(order.total ?? 0)
const createdAt =
  order.createdAt instanceof Date
    ? order.createdAt
    : new Date(order.createdAt)

  const subtotal = items.reduce(
    (sum, item) => sum + Number(getItemPrice(item) ?? 0) * item.quantity,
    0
  )
  const tax = subtotal * 0.08

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Detalhes do Pedido</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-foreground text-background rounded-lg p-6 font-mono text-sm">
            <div className="text-center border-b border-dashed border-background/30 pb-4 mb-4">
              <h4 className="text-xl font-bold">ORDR</h4>
              <p className="text-xs opacity-70 mt-1">Bar & Eventos POS</p>
            </div>

            <div className="space-y-1 mb-4 pb-4 border-b border-dashed border-background/30">
              <div className="flex justify-between text-xs">
                <span>Pedido</span>
                <span className="font-semibold">#{order.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Comanda</span>
                <span className="font-semibold text-lg">#{order.comanda}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Data</span>
                <span>
                  {createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Hora</span>
                <span>
                  {createdAt.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="border-b border-dashed border-background/30 pb-4 mb-4 space-y-2">
              <p className="text-xs opacity-70 mb-2">ITENS</p>

              {items.map((item) => {
                const itemPrice = getItemPrice(item)
                const itemKey = getItemKey(item)
                const variationLabels = getVariationLabels(item)

                return (
                  <div key={itemKey} className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <span>{item.quantity}x {item.product.name}</span>

                      {variationLabels.length > 0 && (
                        <div className="ml-4 mt-1">
                          {variationLabels.map((label, index) => (
                            <span
                              key={`${itemKey}-variation-${index}`}
                              className="text-xs opacity-70 block"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span>{formatBRL(itemPrice * item.quantity)}</span>
                  </div>
                )
              })}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs opacity-70">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs opacity-70">
                <span>Taxa (8%)</span>
                <span>{formatBRL(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed border-background/30">
                <span>TOTAL</span>
                <span>{formatBRL(orderTotal)}</span>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              {order.status === 'paid' && (
                <span className="px-3 py-1 bg-background/20 rounded-full text-xs font-semibold uppercase">
                  PAGO
                </span>
              )}
              {order.status === 'pending' && (
                <span className="px-3 py-1 bg-background/20 rounded-full text-xs font-semibold uppercase">
                  PENDENTE
                </span>
              )}
              {order.status === 'cancelled' && (
                <span className="px-3 py-1 bg-background/20 rounded-full text-xs font-semibold uppercase">
                  CANCELADO
                </span>
              )}
            </div>

            <div className="flex flex-col items-center mt-6 pt-4 border-t border-dashed border-background/30">
              <div className="h-16 w-16 bg-background/20 rounded-lg flex items-center justify-center mb-2">
                <QrCode className="h-10 w-10 text-background" />
              </div>
              <p className="text-xs opacity-70">Escaneie para recibo digital</p>
            </div>

            <div className="text-center text-xs opacity-50 mt-4 pt-4 border-t border-dashed border-background/30">
              <p>Obrigado pela preferencia!</p>
              <p className="mt-1">Powered by Ordr POS</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          <Button onClick={onPrint} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  )
}