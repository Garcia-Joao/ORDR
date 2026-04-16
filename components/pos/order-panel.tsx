'use client'

import { Minus, Plus, Trash2, CreditCard, Receipt, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { OrderItem } from '@/lib/pos-types'
import { formatBRL, getItemPrice } from '@/lib/pos-types'

interface OrderPanelProps {
  items: OrderItem[]
  orderId: string | null
  comanda: number | null
  onUpdateQuantity: (itemKey: string, delta: number) => void
  onRemoveItem: (itemKey: string) => void
  onClearOrder: () => void
  onCharge: () => void
  onSetComanda: (comanda: number | null) => void
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

export function OrderPanel({
  items,
  orderId,
  comanda,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onCharge,
  onSetComanda,
}: OrderPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <div className="w-95 flex flex-col bg-card border-l border-border">
      {/* Order Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Pedido Atual</h2>
          {orderId && (
            <p className="text-sm text-muted-foreground font-mono" suppressHydrationWarning>
              #{orderId}
            </p>
          )}
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearOrder}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Comanda Input */}
      <div className="px-5 py-3 border-b border-border bg-secondary/50">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Comanda
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="999"
            value={comanda ?? ''}
            onChange={(e) => {
              const val = e.target.value
              onSetComanda(val ? parseInt(val, 10) : null)
            }}
            placeholder="N° da comanda"
            className="flex-1 h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Receipt className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Nenhum item no pedido</p>
            <p className="text-xs mt-1">Toque nos produtos para adicionar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const itemKey = getItemKey(item)
              const itemPrice = getItemPrice(item)
              const selectedVars = item.selectedVariations
              const hasMultipleVariations = selectedVars && selectedVars.length > 0
              const variationModifier = hasMultipleVariations
                ? selectedVars.reduce((sum, v) => sum + (v.priceModifier ?? 0), 0)
                : item.selectedVariation?.priceModifier ?? 0
              
              return (
                <div
                  key={itemKey}
                  className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                >
                  <span className="text-2xl">{item.product.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product.name}
                    </p>
                    {hasMultipleVariations && selectedVars && (
                      <p className="text-xs text-muted-foreground">
                        {selectedVars.map(v => v.name).join(', ')}
                      </p>
                    )}
                    {item.selectedVariation && !hasMultipleVariations && (
                      <p className="text-xs text-muted-foreground">
                        {item.selectedVariation.name}
                        {variationModifier > 0 && ` (+${formatBRL(variationModifier)})`}
                      </p>
                    )}
                    <p className="text-sm text-primary font-semibold">
                      {formatBRL(itemPrice * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQuantity(itemKey, -1)}
                      className="h-8 w-8 flex items-center justify-center rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(itemKey, 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(itemKey)}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/20 transition-colors ml-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t border-border p-5 space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Taxa (8%)</span>
          <span>{formatBRL(tax)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-primary">{formatBRL(total)}</span>
        </div>
      </div>

      {/* Charge Button */}
      <div className="p-5 pt-0">
        <Button
          onClick={onCharge}
          disabled={items.length === 0 || comanda === null}
          className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard className="h-5 w-5 mr-2" />
          Cobrar {formatBRL(total)}
        </Button>
        {items.length > 0 && comanda === null && (
          <p className="text-xs text-center text-warning mt-2">
            Informe o numero da comanda
          </p>
        )}
      </div>
    </div>
  )
}
