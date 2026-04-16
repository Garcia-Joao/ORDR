'use client'

import { Printer, X, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Order } from '@/lib/pos-types'
import { formatBRL, getItemPrice } from '@/lib/pos-types'

interface TicketPreviewProps {
  order: Order
  onClose: () => void
  onPrint: () => void
}

export function TicketPreview({ order, onClose, onPrint }: TicketPreviewProps) {
  const subtotal = order.items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  )
  const tax = subtotal * 0.08

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Detalhes do Pedido</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Ticket Content */}
        <div className="p-6">
          <div className="bg-foreground text-background rounded-lg p-6 font-mono text-sm">
            {/* Store Header */}
            <div className="text-center border-b border-dashed border-background/30 pb-4 mb-4">
              <h4 className="text-xl font-bold">ORDR</h4>
              <p className="text-xs opacity-70 mt-1">Bar & Eventos POS</p>
            </div>

            {/* Order Info */}
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
                  {order.createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Hora</span>
                <span>
                  {order.createdAt.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-background/30 pb-4 mb-4 space-y-2">
              <p className="text-xs opacity-70 mb-2">ITENS</p>
              {order.items.map((item, index) => {
                const itemPrice = getItemPrice(item)
                const itemKey = item.selectedVariation 
                  ? `${item.product.id}-${item.selectedVariation.id}` 
                  : `${item.product.id}-${index}`
                return (
                  <div key={itemKey} className="flex justify-between">
                    <div>
                      <span>{item.quantity}x {item.product.name}</span>
                      {item.selectedVariation && (
                        <span className="text-xs opacity-70 block ml-4">
                          {item.selectedVariation.name}
                        </span>
                      )}
                    </div>
                    <span>{formatBRL(itemPrice * item.quantity)}</span>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
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
                <span>{formatBRL(order.total)}</span>
              </div>
            </div>

            {/* Status Badge */}
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

            {/* QR Code Placeholder */}
            <div className="flex flex-col items-center mt-6 pt-4 border-t border-dashed border-background/30">
              <div className="h-16 w-16 bg-background/20 rounded-lg flex items-center justify-center mb-2">
                <QrCode className="h-10 w-10 text-background" />
              </div>
              <p className="text-xs opacity-70">Escaneie para recibo digital</p>
            </div>

            {/* Footer */}
            <div className="text-center text-xs opacity-50 mt-4 pt-4 border-t border-dashed border-background/30">
              <p>Obrigado pela preferencia!</p>
              <p className="mt-1">Powered by Ordr POS</p>
            </div>
          </div>
        </div>

        {/* Actions */}
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
