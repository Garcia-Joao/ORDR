export interface ProductVariationOption {
  id: string
  name: string
  priceModifier: number // can be positive, negative, or zero
}

export interface ProductVariationGroup {
  id: string
  name: string
  required: boolean
  selectionType: 'single' | 'multiple'
  options: ProductVariationOption[]
}

export interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  categoryId?: string | null
  emoji?: string | null
  active?: boolean
  variationGroups?: ProductVariationGroup[]
}

export interface OrderItemVariationSelection {
  groupId: string
  selectedOptionIds: string[]
}

export interface OrderItem {
  product: Product
  quantity: number
  variationSelections?: OrderItemVariationSelection[]
}

export interface Order {
  id: string
  comanda: number
  items: OrderItem[]
  total: number
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: Date
  paidAt?: Date
}

export interface CategoryConfig {
  id: string
  name: string
  emoji: string
}

export const DEFAULT_CATEGORIES: CategoryConfig[] = []
export const DEFAULT_PRODUCTS: Product[] = []

export function formatBRL(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// Get item final price (product price + variation modifier)
export function getItemPrice(item: OrderItem): number {
  const basePrice = item.product.price
  const groups = item.product.variationGroups ?? []
  const selections = item.variationSelections ?? []

  let totalModifier = 0

  for (const selection of selections) {
    const group = groups.find(g => g.id === selection.groupId)
    if (!group) continue

    for (const optionId of selection.selectedOptionIds) {
      const option = group.options.find(o => o.id === optionId)
      if (!option) continue
      totalModifier += option.priceModifier ?? 0
    }
  }

  return basePrice + totalModifier
}

export function validateOrderItem(item: OrderItem): string[] {
  const errors: string[] = []
  const groups = item.product.variationGroups ?? []
  const selections = item.variationSelections ?? []

  for (const group of groups) {
    const selection = selections.find(s => s.groupId === group.id)
    const selectedCount = selection?.selectedOptionIds.length ?? 0

    if (group.required && selectedCount === 0) {
      errors.push(`Seleção obrigatória não preenchida: ${group.name}`)
      continue
    }

    if (group.selectionType === 'single' && selectedCount > 1) {
      errors.push(`A categoria ${group.name} permite apenas uma opção`)
    }

    if (selection) {
      for (const optionId of selection.selectedOptionIds) {
        const exists = group.options.some(o => o.id === optionId)
        if (!exists) {
          errors.push(`Opção inválida em ${group.name}: ${optionId}`)
        }
      }
    }
  }

  return errors
}

// Sample orders for history
export function generateSampleOrders(): Order[] {
  return []
}
