'use client'

import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import type { Product, ProductVariation, CategoryConfig } from '@/lib/pos-types'
import { formatBRL } from '@/lib/pos-types'

interface ProductGridProps {
  category: string
  products: Product[]
  categories: CategoryConfig[]
  onAddProduct: (product: Product, variation?: ProductVariation, variations?: ProductVariation[]) => void
}

export function ProductGrid({ category, products, onAddProduct }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariations, setSelectedVariations] = useState<Set<string>>(new Set())

  const filteredProducts = products.filter((p) => p.category === category)

  const handleProductClick = (product: Product) => {
    if (product.variations && product.variations.length > 0) {
      // Toggle: close if same product is clicked again
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null)
        setSelectedVariations(new Set())
      } else {
        setSelectedProduct(product)
        setSelectedVariations(new Set())
      }
    } else {
      onAddProduct(product)
    }
  }

  const handleVariationToggle = (variation: ProductVariation) => {
    if (!selectedProduct) return
    
    const isMultiple = selectedProduct.allowMultiple
    
    if (!isMultiple) {
      // Single selection - immediately add to cart
      onAddProduct(selectedProduct, variation)
      setSelectedProduct(null)
      setSelectedVariations(new Set())
    } else {
      // Multiple selection mode - toggle
      const newSelected = new Set(selectedVariations)
      if (newSelected.has(variation.id)) {
        newSelected.delete(variation.id)
      } else {
        newSelected.add(variation.id)
      }
      setSelectedVariations(newSelected)
    }
  }

  const handleAddSelected = () => {
    if (!selectedProduct || !selectedProduct.variations) return
    
    // Multiple selection - add as single item with all selected variations
    const selectedVars = selectedProduct.variations.filter(v => selectedVariations.has(v.id))
    onAddProduct(selectedProduct, undefined, selectedVars)
    
    setSelectedProduct(null)
    setSelectedVariations(new Set())
  }

  const handleAddWithoutVariation = () => {
    if (selectedProduct && !selectedProduct.requiresVariation) {
      onAddProduct(selectedProduct)
      setSelectedProduct(null)
      setSelectedVariations(new Set())
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Product Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            const hasVariations = product.variations && product.variations.length > 0
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
                {hasVariations && (
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

      {/* Variations Panel */}
      {selectedProduct && selectedProduct.variations && (
        <div className="w-70 border-l border-border bg-card flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedProduct.emoji}</span>
              <span className="font-medium text-foreground">{selectedProduct.name}</span>
            </div>
            <button
              onClick={() => {
                setSelectedProduct(null)
                setSelectedVariations(new Set())
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3 border-b border-border">
            <p className="text-sm text-muted-foreground">
              {selectedProduct.allowMultiple 
                ? `Selecione as variacoes (${selectedVariations.size} selecionada${selectedVariations.size !== 1 ? 's' : ''}):` 
                : 'Selecione uma opcao:'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {selectedProduct.variations.map((variation) => {
              const finalPrice = selectedProduct.price + variation.priceModifier
              const isSelected = selectedVariations.has(variation.id)
              return (
                <button
                  key={variation.id}
                  onClick={() => handleVariationToggle(variation)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg hover:bg-secondary/80 active:scale-[0.98] transition-all border ${
                    isSelected
                      ? 'bg-primary/20 border-primary'
                      : 'bg-secondary border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium text-foreground">{variation.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-primary">{formatBRL(finalPrice)}</span>
                    {variation.priceModifier !== 0 && (
                      <p className="text-xs text-muted-foreground">
                        {variation.priceModifier > 0 ? '+' : ''}{formatBRL(variation.priceModifier)}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Add buttons */}
          <div className="p-3 border-t border-border space-y-2">
            {/* Add with selected variations */}
            {selectedVariations.size > 0 && (
              <button
                onClick={handleAddSelected}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {selectedProduct.allowMultiple ? 'Adicionar' :  'Adicionar'}
              </button>
            )}
            
            {/* Add without variation - always show when not required */}
            {!selectedProduct.requiresVariation && (
              <button
                onClick={handleAddWithoutVariation}
                className="w-full py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Adicionar sem variacao
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
