'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, Package, Tag, X, ChevronRight, GripVertical } from 'lucide-react'
import {
  type Product,
  type ProductVariationGroup,
  type ProductVariationOption,
  type CategoryConfig,
} from '@/lib/pos-types'
import { createProduct, deleteProduct, getProducts, updateProduct } from '@/lib/api/products'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/lib/api/categories'

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ProdutosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [categories, setCategories] = useState<CategoryConfig[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ])

        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsProductModalOpen(true)
  }

  const handleAddNewProduct = () => {
    setEditingProduct(null)
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, productData)
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p))
        )
      } else {
        const created = await createProduct(productData)
        setProducts((prev) => [...prev, created])
      }

      setIsProductModalOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId)
      setCategories((prev) => prev.filter((c) => c.id !== categoryId))

      if (selectedCategory === categoryId) {
        setSelectedCategory('all')
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
    }
  }

  const handleEditCategory = (category: CategoryConfig) => {
    setEditingCategory(category)
    setIsCategoryModalOpen(true)
  }

  const handleAddNewCategory = () => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = async (categoryData: Omit<CategoryConfig, 'id'>) => {
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, categoryData)
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? updated : c))
        )
      } else {
        const created = await createCategory(categoryData)
        setCategories((prev) => [...prev, created])
      }

      setIsCategoryModalOpen(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
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
          <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card/50">
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
                          {categories.find((c) => c.id === product.categoryId)?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.variationGroups && product.variationGroups.length > 0 ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ChevronRight className="h-4 w-4" />
                            <span>{product.variationGroups.length} grupos</span>
                            {product.variationGroups.some((g) => g.required) && (
                              <span className="ml-1 px-1.5 py-0.5 bg-warning/20 text-warning text-xs rounded">
                                obrigatorio
                              </span>
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
                const productCount = products.filter((p) => p.categoryId === category.id).length

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
  const [categoryId, setCategoryId] = useState(product?.categoryId || '')
  const [emoji, setEmoji] = useState(product?.emoji || '📦')
  const [variationGroups, setVariationGroups] = useState<ProductVariationGroup[]>(
    product?.variationGroups || []
  )

  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupRequired, setNewGroupRequired] = useState(false)
  const [newGroupSelectionType, setNewGroupSelectionType] = useState<'single' | 'multiple'>('single')

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return

    const newGroup: ProductVariationGroup = {
      id: Math.random().toString(36).substring(2, 9),
      name: newGroupName.trim(),
      required: newGroupRequired,
      selectionType: newGroupSelectionType,
      options: [],
    }

    setVariationGroups((prev) => [...prev, newGroup])
    setNewGroupName('')
    setNewGroupRequired(false)
    setNewGroupSelectionType('single')
  }

  const handleRemoveGroup = (groupId: string) => {
    setVariationGroups((prev) => prev.filter((g) => g.id !== groupId))
  }

  const handleUpdateGroup = (
    groupId: string,
    updates: Partial<ProductVariationGroup>
  ) => {
    setVariationGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    )
  }

  const handleAddOption = (groupId: string, optionName: string, optionPrice: string) => {
    if (!optionName.trim()) return

    const newOption: ProductVariationOption = {
      id: Math.random().toString(36).substring(2, 9),
      name: optionName.trim(),
      priceModifier: parseFloat(optionPrice) || 0,
    }

    setVariationGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: [...g.options, newOption] }
          : g
      )
    )
  }

  const handleRemoveOption = (groupId: string, optionId: string) => {
    setVariationGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.filter((o) => o.id !== optionId) }
          : g
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSave({
      name,
      price: parseFloat(price) || 0,
      categoryId,
      emoji,
      variationGroups: variationGroups.length > 0 ? variationGroups : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl border border-border w-full max-w-3xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-foreground mb-2">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground text-center text-2xl"
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
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                required
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Grupos de Variacao
              </label>

              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 mb-4">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Fruta"
                  className="px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                />
                <select
                  value={newGroupSelectionType}
                  onChange={(e) =>
                    setNewGroupSelectionType(e.target.value as 'single' | 'multiple')
                  }
                  className="px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                >
                  <option value="single">Unica</option>
                  <option value="multiple">Multipla</option>
                </select>
                <label className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={newGroupRequired}
                    onChange={(e) => setNewGroupRequired(e.target.checked)}
                  />
                  Obrigatorio
                </label>
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {variationGroups.map((group) => (
                  <VariationGroupEditor
                    key={group.id}
                    group={group}
                    onRemove={() => handleRemoveGroup(group.id)}
                    onUpdate={(updates) => handleUpdateGroup(group.id, updates)}
                    onAddOption={(name, price) => handleAddOption(group.id, name, price)}
                    onRemoveOption={(optionId) => handleRemoveOption(group.id, optionId)}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Exemplo: Fruta (obrigatorio, unica), Destilado (obrigatorio, unica),
              Ajustes (opcional, multipla).
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              {product ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function VariationGroupEditor({
  group,
  onRemove,
  onUpdate,
  onAddOption,
  onRemoveOption,
}: {
  group: ProductVariationGroup
  onRemove: () => void
  onUpdate: (updates: Partial<ProductVariationGroup>) => void
  onAddOption: (name: string, price: string) => void
  onRemoveOption: (optionId: string) => void
}) {
  const [newOptionName, setNewOptionName] = useState('')
  const [newOptionPrice, setNewOptionPrice] = useState('0')

  return (
    <div className="border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={group.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground"
        />
        <select
          value={group.selectionType}
          onChange={(e) =>
            onUpdate({ selectionType: e.target.value as 'single' | 'multiple' })
          }
          className="px-3 py-2 bg-input border border-border rounded-lg text-foreground"
        >
          <option value="single">Unica</option>
          <option value="multiple">Multipla</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={group.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
          />
          Obrigatorio
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {group.options.length > 0 && (
        <div className="space-y-2">
          {group.options.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <span className="font-medium text-foreground">{option.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {option.priceModifier >= 0 ? '+' : ''}
                  {formatCurrency(option.priceModifier)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveOption(option.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newOptionName}
          onChange={(e) => setNewOptionName(e.target.value)}
          className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground"
          placeholder="Nome da opcao"
        />
        <input
          type="number"
          step="0.01"
          value={newOptionPrice}
          onChange={(e) => setNewOptionPrice(e.target.value)}
          className="w-28 px-3 py-2 bg-input border border-border rounded-lg text-foreground"
          placeholder="+/-"
        />
        <button
          type="button"
          onClick={() => {
            onAddOption(newOptionName, newOptionPrice)
            setNewOptionName('')
            setNewOptionPrice('0')
          }}
          className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg"
        >
          <Plus className="h-4 w-4" />
        </button>
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