'use client'

import { useMemo, useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import type {
  Product,
  CategoryConfig,
  ProductVariationGroup,
  OrderItemVariationSelection,
} from '@/lib/pos-types'
import { formatBRL } from '@/lib/pos-types'

interface ProductGridProps {
  category: string
  products: Product[]
  categories: CategoryConfig[]
  onAddProduct: (
    product: Product,
    variationSelections?: OrderItemVariationSelection[]
  ) => void
}

type SelectionState = Record<string, Set<string>>

export function ProductGrid({ category, products, onAddProduct }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [groupSelections, setGroupSelections] = useState<SelectionState>({})

  const filteredProducts = products.filter((p) => p.category === category)

  const variationGroups = selectedProduct?.variationGroups ?? []

  const selectionCount = useMemo(
    () =>
      Object.values(groupSelections).reduce((sum, selectedSet) => sum + selectedSet.size, 0),
    [groupSelections]
  )

  const getOptionModifier = (product: Product, optionId: string) => {
    for (const group of product.variationGroups ?? []) {
      const option = group.options.find((o) => o.id === optionId)
      if (option) return option.priceModifier
    }
    return 0
  }

  const selectedTotalModifier = useMemo(() => {
    if (!selectedProduct) return 0

    let total = 0
    for (const optionIds of Object.values(groupSelections)) {
      for (const optionId of optionIds) {
        total += getOptionModifier(selectedProduct, optionId)
      }
    }
    return total
  }, [groupSelections, selectedProduct])

  const buildVariationSelections = (): OrderItemVariationSelection[] => {
    return Object.entries(groupSelections)
      .filter(([, selectedSet]) => selectedSet.size > 0)
      .map(([groupId, selectedSet]) => ({
        groupId,
        selectedOptionIds: Array.from(selectedSet),
      }))
  }

  const resetSelection = () => {
    setSelectedProduct(null)
    setGroupSelections({})
  }

  const hasGroups = (product: Product) =>
    !!product.variationGroups && product.variationGroups.length > 0

  const isGroupSatisfied = (group: ProductVariationGroup) => {
    const selected = groupSelections[group.id]
    const count = selected?.size ?? 0
    return !group.required || count > 0
  }

  const allRequiredGroupsSatisfied = useMemo(() => {
    if (!selectedProduct) return true
    return variationGroups.every(isGroupSatisfied)
  }, [selectedProduct, variationGroups, groupSelections])

  const handleProductClick = (product: Product) => {
    if (hasGroups(product)) {
      if (selectedProduct?.id === product.id) {
        resetSelection()
      } else {
        setSelectedProduct(product)
        setGroupSelections({})
      }
    } else {
      onAddProduct(product)
    }
  }

  const handleOptionToggle = (
    group: ProductVariationGroup,
    optionId: string
  ) => {
    if (!selectedProduct) return

    setGroupSelections((prev) => {
      const current = prev[group.id] ?? new Set<string>()

      if (group.selectionType === 'single') {
        return {
          ...prev,
          [group.id]: new Set([optionId]),
        }
      }

      const next = new Set(current)
      if (next.has(optionId)) {
        next.delete(optionId)
      } else {
        next.add(optionId)
      }

      return {
        ...prev,
        [group.id]: next,
      }
    })
  }

  const handleAddSelected = () => {
    if (!selectedProduct) return
    if (!allRequiredGroupsSatisfied) return

    const variationSelections = buildVariationSelections()
    onAddProduct(
      selectedProduct,
      variationSelections.length > 0 ? variationSelections : undefined
    )
    resetSelection()
  }

  const handleAddWithoutVariation = () => {
    if (!selectedProduct) return

    const hasRequiredGroups = variationGroups.some((group) => group.required)
    if (hasRequiredGroups) return

    onAddProduct(selectedProduct)
    resetSelection()
  }

const getProjectedTotal = (
  group: ProductVariationGroup,
  optionId: string
) => {
  if (!selectedProduct) return 0

  let totalModifier = 0

  for (const currentGroup of variationGroups) {
    const currentSelected = groupSelections[currentGroup.id] ?? new Set<string>()
    let projectedSelection = new Set(currentSelected)

    if (currentGroup.id === group.id) {
      if (currentGroup.selectionType === 'single') {
        projectedSelection = new Set([optionId])
      } else {
        if (!projectedSelection.has(optionId)) {
          projectedSelection.add(optionId)
        }
      }
    }

    for (const selectedOptionId of projectedSelection) {
      totalModifier += getOptionModifier(selectedProduct, selectedOptionId)
    }
  }

  return selectedProduct.price + totalModifier
}

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            const productHasGroups = hasGroups(product)
            const isSelected = selectedProduct?.id === product.id

            return (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className={`relative flex flex-col items-center justify-center p-6 rounded-xl active:scale-95 transition-all border min-h-30 ${
                  isSelected
                    ? 'bg-primary/20 border-primary ring-2 ring-primary'
                    : 'bg-secondary border-border hover:border-primary/50 hover:bg-secondary/80'
                } group`}
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {product.emoji}
                </span>
                <span className="text-sm font-medium text-foreground text-center leading-tight">
                  {product.name}
                </span>
                <span className="text-lg font-bold text-primary mt-1">
                  {formatBRL(product.price)}
                </span>
                {productHasGroups && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <span className="text-4xl mb-4">📦</span>
            <p className="text-lg font-medium">Nenhum produto nesta categoria</p>
          </div>
        )}
      </div>

      {selectedProduct && variationGroups.length > 0 && (
        <div className="w-80 border-l border-border bg-card flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedProduct.emoji}</span>
              <span className="font-medium text-foreground">{selectedProduct.name}</span>
            </div>
            <button
              onClick={resetSelection}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3 border-b border-border space-y-1">
            <p className="text-sm text-muted-foreground">
              {selectionCount > 0
                ? `${selectionCount} selecao${selectionCount !== 1 ? 'oes' : ''}`
                : 'Selecione as opcoes'}
            </p>
            <p className="text-sm font-medium text-foreground">
              Total atual: {formatBRL(selectedProduct.price + selectedTotalModifier)}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {variationGroups.map((group) => {
              const selectedSet = groupSelections[group.id] ?? new Set<string>()

              return (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {group.selectionType === 'single'
                          ? 'Escolha unica'
                          : 'Escolha multipla'}
                        {group.required ? ' • obrigatorio' : ' • opcional'}
                      </p>
                    </div>

                    {!isGroupSatisfied(group) && (
                      <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded">
                        obrigatório
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = selectedSet.has(option.id)
                      const finalPrice = getProjectedTotal(group, option.id)

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleOptionToggle(group, option.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-lg hover:bg-secondary/80 active:scale-[0.98] transition-all border ${
                            isSelected
                              ? 'bg-primary/20 border-primary'
                              : 'bg-secondary border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-left">
                            <span className="font-medium text-foreground">
                              {option.name}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {group.selectionType === 'single'
                                ? 'Seleciona apenas esta opcao'
                                : 'Pode combinar com outras'}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-primary">
                              {formatBRL(finalPrice)}
                            </span>
                            {option.priceModifier !== 0 && (
                              <p className="text-xs text-muted-foreground">
                                {option.priceModifier > 0 ? '+' : ''}
                                {formatBRL(option.priceModifier)}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-3 border-t border-border space-y-2">
            <button
              onClick={handleAddSelected}
              disabled={!allRequiredGroupsSatisfied}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar
            </button>

            {!variationGroups.some((group) => group.required) && (
              <button
                onClick={handleAddWithoutVariation}
                className="w-full py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Adicionar sem opcoes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}