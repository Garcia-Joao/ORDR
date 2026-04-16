'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, Package, Tag, X, ChevronRight, GripVertical } from 'lucide-react'
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, type Product, type ProductVariation, type CategoryConfig } from '@/lib/pos-types'

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ProdutosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES)
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')

  // Load from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('ordr-categories')
    const savedProducts = localStorage.getItem('ordr-products')
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories))
      } catch {}
    }
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts))
      } catch {}
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('ordr-categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('ordr-products', JSON.stringify(products))
  }, [products])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsProductModalOpen(true)
  }

  const handleAddNewProduct = () => {
    setEditingProduct(null)
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p))
      )
    } else {
      const newProduct: Product = {
        ...productData,
        id: Math.random().toString(36).substring(2, 9),
      }
      setProducts((prev) => [...prev, newProduct])
    }
    setIsProductModalOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteCategory = (categoryId: string) => {
    // Remove category and update products in that category
    setCategories((prev) => prev.filter((c) => c.id !== categoryId))
    setProducts((prev) => prev.map((p) => p.category === categoryId ? { ...p, category: 'uncategorized' } : p))
  }

  const handleEditCategory = (category: CategoryConfig) => {
    setEditingCategory(category)
    setIsCategoryModalOpen(true)
  }

  const handleAddNewCategory = () => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = (categoryData: Omit<CategoryConfig, 'id'>) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...categoryData, id: editingCategory.id } : c))
      )
    } else {
      const newCategory: CategoryConfig = {
        ...categoryData,
        id: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
      }
      setCategories((prev) => [...prev, newCategory])
    }
    setIsCategoryModalOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Produtos</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Tag className="h-4 w-4 inline mr-1" />
            Categorias
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <>
          {/* Filters */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card/50">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddNewProduct}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors ml-auto"
            >
              <Plus className="h-5 w-5" />
              Novo Produto
            </button>
          </div>

          {/* Products Table */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Produto</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Variacoes</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Preco</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.emoji}</span>
                          <span className="font-medium text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-secondary-foreground">
                          {categories.find((c) => c.id === product.category)?.name || product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.variations && product.variations.length > 0 ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ChevronRight className="h-4 w-4" />
                            <span>{product.variations.length} opcoes</span>
                            {product.requiresVariation && (
                              <span className="ml-1 px-1.5 py-0.5 bg-warning/20 text-warning text-xs rounded">obrigatorio</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-foreground">{formatCurrency(product.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum produto encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros ou adicione um novo produto</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Categories Management */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
            <p className="text-sm text-muted-foreground">
              {categories.length} categoria{categories.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleAddNewCategory}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nova Categoria
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-4">
              {categories.map((category) => {
                const productCount = products.filter((p) => p.category === category.id).length
                return (
                  <div
                    key={category.id}
                    className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{category.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {productCount} produto{productCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsProductModalOpen(false)
            setEditingProduct(null)
          }}
        />
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setIsCategoryModalOpen(false)
            setEditingCategory(null)
          }}
        />
      )}
    </div>
  )
}

function ProductModal({
  product,
  categories,
  onSave,
  onClose,
}: {
  product: Product | null
  categories: CategoryConfig[]
  onSave: (data: Omit<Product, 'id'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(product?.name || '')
  const [price, setPrice] = useState(product?.price.toString() || '')
  const [category, setCategory] = useState(product?.category || categories[0]?.id || '')
  const [emoji, setEmoji] = useState(product?.emoji || '📦')
  const [variations, setVariations] = useState<ProductVariation[]>(product?.variations || [])
  const [requiresVariation, setRequiresVariation] = useState(product?.requiresVariation || false)
  const [allowMultiple, setAllowMultiple] = useState(product?.allowMultiple || false)
  const [newVariationName, setNewVariationName] = useState('')
  const [newVariationPrice, setNewVariationPrice] = useState('0')

  const handleAddVariation = () => {
    if (!newVariationName.trim()) return
    const newVariation: ProductVariation = {
      id: Math.random().toString(36).substring(2, 9),
      name: newVariationName.trim(),
      priceModifier: parseFloat(newVariationPrice) || 0,
    }
    setVariations((prev) => [...prev, newVariation])
    setNewVariationName('')
    setNewVariationPrice('0')
  }

  const handleRemoveVariation = (variationId: string) => {
    setVariations((prev) => prev.filter((v) => v.id !== variationId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      price: parseFloat(price) || 0,
      category,
      emoji,
      variations: variations.length > 0 ? variations : undefined,
      requiresVariation: variations.length > 0 ? requiresVariation : undefined,
      allowMultiple: variations.length > 0 ? allowMultiple : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ex: Cerveja Heineken"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-foreground mb-2">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground text-center text-2xl focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={2}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Preco Base</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variations Section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-foreground">Variacoes</label>
              {variations.length > 0 && (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={requiresVariation}
                      onChange={(e) => setRequiresVariation(e.target.checked)}
                      className="rounded border-border"
                    />
                    Obrigatorio
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={allowMultiple}
                      onChange={(e) => setAllowMultiple(e.target.checked)}
                      className="rounded border-border"
                    />
                    Escolha multipla
                  </label>
                </div>
              )}
            </div>

            {/* Existing Variations */}
            {variations.length > 0 && (
              <div className="space-y-2 mb-3">
                {variations.map((variation) => (
                  <div
                    key={variation.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <span className="font-medium text-foreground">{variation.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {variation.priceModifier >= 0 ? '+' : ''}{formatCurrency(variation.priceModifier)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(variation.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Variation */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newVariationName}
                onChange={(e) => setNewVariationName(e.target.value)}
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nome da variacao (ex: Com Limao)"
              />
              <input
                type="number"
                step="0.01"
                value={newVariationPrice}
                onChange={(e) => setNewVariationPrice(e.target.value)}
                className="w-24 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="+/-"
              />
              <button
                type="button"
                onClick={handleAddVariation}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Adicione variacoes como sabores ou opcoes. O modificador de preco e somado ao preco base.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {product ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CategoryModal({
  category,
  onSave,
  onClose,
}: {
  category: CategoryConfig | null
  onSave: (data: Omit<CategoryConfig, 'id'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(category?.name || '')
  const [emoji, setEmoji] = useState(category?.emoji || '📦')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, emoji })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl border border-border w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ex: Sobremesas"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-foreground mb-2">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground text-center text-2xl focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {category ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
