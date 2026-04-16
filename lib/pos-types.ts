export interface ProductVariation {
  id: string
  name: string
  priceModifier: number // Can be positive, negative, or zero
}

export interface Product {
  id: string
  name: string
  price: number
  category: string
  emoji: string
  variations?: ProductVariation[]
  requiresVariation?: boolean // If true, must select a variation to add to order
  allowMultiple?: boolean // If true, can select multiple variations at once
}

export interface OrderItem {
  product: Product
  quantity: number
  selectedVariation?: ProductVariation
  selectedVariations?: ProductVariation[] // For multiple selections
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

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'drinks', name: 'Bebidas', emoji: '🥤' },
  { id: 'beer', name: 'Cervejas', emoji: '🍺' },
  { id: 'cocktails', name: 'Drinks', emoji: '🍸' },
  { id: 'food', name: 'Comidas', emoji: '🍔' },
  { id: 'snacks', name: 'Petiscos', emoji: '🍟' },
]

export const DEFAULT_PRODUCTS: Product[] = [
  // Bebidas
  { 
    id: '1', 
    name: 'Agua Mineral', 
    price: 5.0, 
    category: 'drinks', 
    emoji: '💧',
    variations: [
      { id: 'v1', name: 'Natural', priceModifier: 0 },
      { id: 'v2', name: 'Com Gelo', priceModifier: 0 },
      { id: 'v3', name: 'Com Limao', priceModifier: 1.0 },
      { id: 'v4', name: 'Com Gelo e Limao', priceModifier: 1.0 },
    ],
    requiresVariation: true
  },
  { id: '2', name: 'Refrigerante', price: 7.0, category: 'drinks', emoji: '🥤' },
  { id: '3', name: 'Suco Natural', price: 10.0, category: 'drinks', emoji: '🧃' },
  { id: '4', name: 'Energetico', price: 15.0, category: 'drinks', emoji: '⚡' },
  { id: '5', name: 'Agua com Gas', price: 6.0, category: 'drinks', emoji: '💧' },
  // Cervejas
  { id: '6', name: 'Brahma', price: 8.0, category: 'beer', emoji: '🍺' },
  { id: '7', name: 'Heineken', price: 12.0, category: 'beer', emoji: '🍺' },
  { id: '8', name: 'Skol', price: 7.0, category: 'beer', emoji: '🍺' },
  { id: '9', name: 'Corona', price: 15.0, category: 'beer', emoji: '🍺' },
  { id: '10', name: 'Budweiser', price: 10.0, category: 'beer', emoji: '🍺' },
  { id: '11', name: 'IPA Artesanal', price: 18.0, category: 'beer', emoji: '🍻' },
  // Drinks
  { id: '12', name: 'Caipirinha', price: 18.0, category: 'cocktails', emoji: '🍹' },
  { id: '13', name: 'Caipiroska', price: 20.0, category: 'cocktails', emoji: '🍹' },
  { id: '14', name: 'Mojito', price: 22.0, category: 'cocktails', emoji: '🍹' },
  { id: '15', name: 'Gin Tonica', price: 25.0, category: 'cocktails', emoji: '🍸' },
  { id: '16', name: 'Whisky', price: 28.0, category: 'cocktails', emoji: '🥃' },
  { id: '17', name: 'Vodka Red Bull', price: 30.0, category: 'cocktails', emoji: '🍸' },
  // Comidas
  { id: '18', name: 'Hamburguer', price: 35.0, category: 'food', emoji: '🍔' },
  { id: '19', name: 'Porcao de Batata', price: 25.0, category: 'food', emoji: '🍟' },
  { id: '20', name: 'Hot Dog', price: 18.0, category: 'food', emoji: '🌭' },
  { id: '21', name: 'Picanha', price: 65.0, category: 'food', emoji: '🥩' },
  { id: '22', name: 'Frango a Passarinho', price: 40.0, category: 'food', emoji: '🍗' },
  { 
    id: '28', 
    name: 'Empanada', 
    price: 12.0, 
    category: 'food', 
    emoji: '🥟',
    variations: [
      { id: 'e1', name: 'Carne', priceModifier: 0 },
      { id: 'e2', name: 'Frango', priceModifier: 0 },
      { id: 'e3', name: 'Queijo', priceModifier: 0 },
      { id: 'e4', name: 'Palmito', priceModifier: 2.0 },
      { id: 'e5', name: 'Camarao', priceModifier: 5.0 },
    ],
    requiresVariation: true
  },
  // Petiscos
  { id: '23', name: 'Porcao de Fritas', price: 20.0, category: 'snacks', emoji: '🍟' },
  { id: '24', name: 'Isca de Peixe', price: 35.0, category: 'snacks', emoji: '🐟' },
  { id: '25', name: 'Calabresa Acebolada', price: 30.0, category: 'snacks', emoji: '🌭' },
  { id: '26', name: 'Queijo Coalho', price: 22.0, category: 'snacks', emoji: '🧀' },
  { id: '27', name: 'Amendoim', price: 8.0, category: 'snacks', emoji: '🥜' },
]

// Helper to format currency in BRL
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// Get item final price (product price + variation modifier)
export function getItemPrice(item: OrderItem): number {
  const basePrice = item.product.price
  
  // Handle multiple variations
  if (item.selectedVariations && item.selectedVariations.length > 0) {
    const totalModifier = item.selectedVariations.reduce((sum, v) => sum + (v.priceModifier ?? 0), 0)
    return basePrice + totalModifier
  }
  
  // Single variation
  const modifier = item.selectedVariation?.priceModifier ?? 0
  return basePrice + modifier
}

// Sample orders for history
export function generateSampleOrders(): Order[] {
  const now = new Date()
  
  return [
    {
      id: 'A1B2C3',
      comanda: 42,
      items: [
        { product: DEFAULT_PRODUCTS[6], quantity: 3 }, // Heineken
        { product: DEFAULT_PRODUCTS[11], quantity: 2 }, // Caipirinha
        { product: DEFAULT_PRODUCTS[22], quantity: 1 }, // Porcao de Fritas
      ],
      total: 92.88,
      status: 'paid',
      createdAt: new Date(now.getTime() - 15 * 60000),
      paidAt: new Date(now.getTime() - 10 * 60000),
    },
    {
      id: 'D4E5F6',
      comanda: 15,
      items: [
        { product: DEFAULT_PRODUCTS[17], quantity: 2 }, // Hamburguer
        { product: DEFAULT_PRODUCTS[0], quantity: 2, selectedVariation: { id: 'v3', name: 'Com Limao', priceModifier: 1.0 } }, // Agua com Limao
        { product: DEFAULT_PRODUCTS[5], quantity: 4 }, // Brahma
      ],
      total: 119.88,
      status: 'paid',
      createdAt: new Date(now.getTime() - 45 * 60000),
      paidAt: new Date(now.getTime() - 40 * 60000),
    },
    {
      id: 'G7H8I9',
      comanda: 78,
      items: [
        { product: DEFAULT_PRODUCTS[14], quantity: 1 }, // Gin Tonica
        { product: DEFAULT_PRODUCTS[12], quantity: 1 }, // Caipirinha
      ],
      total: 46.44,
      status: 'pending',
      createdAt: new Date(now.getTime() - 5 * 60000),
    },
    {
      id: 'J1K2L3',
      comanda: 33,
      items: [
        { product: DEFAULT_PRODUCTS[20], quantity: 1 }, // Picanha
        { product: DEFAULT_PRODUCTS[8], quantity: 2 }, // Corona
        { product: DEFAULT_PRODUCTS[23], quantity: 1 }, // Isca de Peixe
      ],
      total: 140.40,
      status: 'paid',
      createdAt: new Date(now.getTime() - 90 * 60000),
      paidAt: new Date(now.getTime() - 75 * 60000),
    },
    {
      id: 'M4N5O6',
      comanda: 56,
      items: [
        { product: DEFAULT_PRODUCTS[1], quantity: 3 }, // Refrigerante
        { product: DEFAULT_PRODUCTS[18], quantity: 1 }, // Porcao de Batata
      ],
      total: 51.84,
      status: 'cancelled',
      createdAt: new Date(now.getTime() - 120 * 60000),
    },
  ]
}
