'use client'

import type { Product, CategoryConfig, OrderItemVariationSelection } from '@/lib/pos-types'
import { formatBRL, validateOrderItem } from '@/lib/pos-types'
import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductGridProps {
  category: string
  products: Product[]
  categories: CategoryConfig[]
  onAddProduct: (product: Product, variationSelections?: OrderItemVariationSelection[]) => void
}

export function ProductGrid({
  category,
  products,
  categories,
  onAddProduct,
}: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariations, setSelectedVariations] = useState<OrderItemVariationSelection[]>([])

  const visibleProducts = useMemo(() => {
    if (!category) {
      return products
    }

    return products.filter((product) => product.categoryId === category)
  }, [products, category])

  const handleProductClick = (product: Product) => {
    const hasVariations = (product.variationGroups?.length ?? 0) > 0

    if (!hasVariations) {
      onAddProduct(product)
      return
    }

    setSelectedProduct(product)
    setSelectedVariations([])
  }

  const handleToggleOption = (groupId: string, optionId: string, selectionType: 'single' | 'multiple') => {
    setSelectedVariations((prev) => {
      const existing = prev.find((selection) => selection.groupId === groupId)

      if (!existing) {
        return [
          ...prev,
          {
            groupId,
            selectedOptionIds: [optionId],
          },
        ]
      }

      if (selectionType === 'single') {
        return prev.map((selection) =>
          selection.groupId === groupId
            ? {
                ...selection,
                selectedOptionIds: [optionId],
              }
            : selection
        )
      }

      const alreadySelected = existing.selectedOptionIds.includes(optionId)

      return prev.map((selection) =>
        selection.groupId === groupId
          ? {
              ...selection,
              selectedOptionIds: alreadySelected
                ? selection.selectedOptionIds.filter((id) => id !== optionId)
                : [...selection.selectedOptionIds, optionId],
            }
          : selection
      )
    })
  }

  const handleConfirmVariations = () => {
    if (!selectedProduct) return

    const draftItem = {
      product: selectedProduct,
      quantity: 1,
      variationSelections: selectedVariations,
    }

    const errors = validateOrderItem(draftItem)

    if (errors.length > 0) {
      alert(errors[0])
      return
    }

    onAddProduct(selectedProduct, selectedVariations)
    setSelectedProduct(null)
    setSelectedVariations([])
  }

  const getRunningPriceForGroup = (groupId: string, optionId?: string) => {
    if (!selectedProduct) return 0

    let total = selectedProduct.price

    for (const selection of selectedVariations) {
      const group = selectedProduct.variationGroups?.find((g) => g.id === selection.groupId)
      if (!group) continue

      for (const selectedOptionId of selection.selectedOptionIds) {
        const option = group.options.find((o) => o.id === selectedOptionId)
        if (option) {
          total += option.priceModifier ?? 0
        }
      }
    }

    if (groupId && optionId) {
      const currentGroup = selectedProduct.variationGroups?.find((g) => g.id === groupId)
      if (!currentGroup) return total

      const currentSelection = selectedVariations.find((s) => s.groupId === groupId)
      const option = currentGroup.options.find((o) => o.id === optionId)

      if (!option) return total

      if (currentGroup.selectionType === 'single') {
        if (currentSelection?.selectedOptionIds.length) {
          const previouslySelected = currentGroup.options.find((o) =>
            currentSelection.selectedOptionIds.includes(o.id)
          )
          if (previouslySelected) {
            total -= previouslySelected.priceModifier ?? 0
          }
        }
        total += option.priceModifier ?? 0
      } else {
        const alreadySelected = currentSelection?.selectedOptionIds.includes(optionId)
        if (!alreadySelected) {
          total += option.priceModifier ?? 0
        }
      }
    }

    return total
  }

  const selectedCategory = categories.find((cat) => cat.id === category)

  return (
    <>
      <div className="flex-1 overflow-y-auto p-5">
        {visibleProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">
              {products.length === 0
                ? 'Nenhum produto cadastrado'
                : 'Nenhum produto encontrado'}
            </p>
            <p className="text-xs mt-1">
              {products.length === 0
                ? 'Cadastre produtos para começar'
                : 'Tente outra busca ou categoria'}
            </p>
          </div>
        ) : (
          <>
            {selectedCategory && category && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Categoria: <span className="font-medium text-foreground">{selectedCategory.name}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group text-left rounded-2xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all p-4 min-h-[120px] flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-3xl">{product.emoji ?? '🍽️'}</span>
                  </div>

                  <div className="mt-3 flex-1">
                    <h3 className="font-semibold text-foreground leading-tight">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-bold text-primary">
                      {formatBRL(product.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedProduct.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escolha as variações do produto
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(null)
                  setSelectedVariations([])
                }}
                className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
              {selectedProduct.variationGroups?.map((group) => {
                const selection = selectedVariations.find((s) => s.groupId === group.id)

                return (
                  <div key={group.id} className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {group.name}
                        {group.required && (
                          <span className="ml-2 text-xs text-warning">(obrigatório)</span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {group.selectionType === 'single'
                          ? 'Selecione uma opção'
                          : 'Selecione uma ou mais opções'}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      {group.options.map((option) => {
                        const isSelected =
                          selection?.selectedOptionIds.includes(option.id) ?? false

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              handleToggleOption(group.id, option.id, group.selectionType)
                            }
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-background hover:bg-secondary'
                            }`}
                          >
                            <div>
                              <p className="font-medium text-foreground">{option.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {option.priceModifier >= 0 ? '+' : ''}
                                {formatBRL(option.priceModifier)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Total com esta opção</p>
                              <p className="text-sm font-semibold text-primary">
                                {formatBRL(getRunningPriceForGroup(group.id, option.id))}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-border bg-card">
              <div>
                <p className="text-sm text-muted-foreground">Preço final</p>
                <p className="text-xl font-bold text-primary">
                  {formatBRL(getRunningPriceForGroup('', ''))}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProduct(null)
                    setSelectedVariations([])
                  }}
                >
                  Cancelar
                </Button>

                <Button 
                  onClick={handleConfirmVariations}
                  className="bg-primary text-primary-foreground hover:bg-primary/80"
                >
                  Adicionar ao pedido
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}