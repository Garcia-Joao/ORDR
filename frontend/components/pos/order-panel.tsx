'use client'

import { Minus, Plus, Trash2, Receipt, X, Printer, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { OrderItem } from '@/lib/pos-types'
import { formatBRL, getItemPrice } from '@/lib/pos-types'

interface OrderPanelProps {
  items: OrderItem[]
  orderId: string | null
  comandaNumber: number | null
  comandaName: string
  applyTax: boolean
  requireComanda: boolean
  taxRate?: number
  onUpdateQuantity: (itemKey: string, delta: number) => void
  onRemoveItem: (itemKey: string) => void
  onClearOrder: () => void
  onCharge: () => void
  onSetComandaNumber: (comanda: number | null) => void
  onSetComandaName: (name: string) => void
  onSetApplyTax: (value: boolean) => void
  isLoading?: boolean
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

export function OrderPanel({
  items,
  orderId,
  comandaNumber,
  comandaName,
  applyTax,
  requireComanda,
  taxRate = 0.1,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onCharge,
  onSetComandaNumber,
  onSetComandaName,
  onSetApplyTax,
  isLoading = false,
}: OrderPanelProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  )

  const tax = applyTax ? subtotal * taxRate : 0
  const total = subtotal + tax

  const isComandaValid = !requireComanda || comandaNumber !== null

  return (
    <div className="w-95 flex flex-col bg-card border-l border-border">
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
            disabled={isLoading}
            className="text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="px-5 py-3 border-b border-border bg-secondary/50 space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Número da comanda
          </label>

          <input
            type="number"
            min="1"
            max="999999"
            value={comandaNumber ?? ''}
            disabled={isLoading}
            onChange={(e) => {
              const val = e.target.value
              onSetComandaNumber(val ? parseInt(val, 10) : null)
            }}
            placeholder="N° da comanda"
            className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Nome da comanda
          </label>

          <input
            type="text"
            value={comandaName}
            disabled={isLoading}
            onChange={(e) => onSetComandaName(e.target.value)}
            placeholder="Ex: João / Mesa 3 / Cliente balcão"
            className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

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
              const variationLabels = getVariationLabels(item)

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

                    {variationLabels.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {variationLabels.map((label, index) => (
                          <p
                            key={`${itemKey}-variation-${index}`}
                            className="text-xs text-muted-foreground"
                          >
                            {label}
                          </p>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-primary font-semibold">
                      {formatBRL(itemPrice * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQuantity(itemKey, -1)}
                      disabled={isLoading}
                      className="h-8 w-8 flex items-center justify-center rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="w-8 text-center text-sm font-semibold text-foreground">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => onUpdateQuantity(itemKey, 1)}
                      disabled={isLoading}
                      className="h-8 w-8 flex items-center justify-center rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onRemoveItem(itemKey)}
                      disabled={isLoading}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/20 transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="border-t border-border p-5 space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Taxa ({Math.round(taxRate * 100)}%)</span>
            <input
              type="checkbox"
              checked={applyTax}
              disabled={isLoading}
              onChange={(e) => onSetApplyTax(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
              title="Aplicar taxa"
            />
          </div>

          <span>{formatBRL(tax)}</span>
        </div>

        <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-primary">{formatBRL(total)}</span>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Button
          onClick={onCharge}
          disabled={isLoading || items.length === 0 || !isComandaValid}
          className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Printer className="h-5 w-5 mr-2" />
              Imprimir
            </>
          )}
        </Button>

        {items.length > 0 && requireComanda && comandaNumber === null && !isLoading && (
          <p className="text-xs text-center text-warning mt-2">
            Informe o número da comanda
          </p>
        )}
      </div>
    </div>
  )
}