import { apiFetch } from './client'
import type { Order } from '../pos-types'
import { getItemPrice } from '../pos-types'

export type CreateOrderResponse = {
  id: string
  comanda: number
  comandaName?: string | null
  total: number
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: string | Date
  paidAt?: string | Date | null
}

type OrdersListResponse = Array<Order & {
  total: number | string
  createdAt: string
  paidAt?: string | null
}>

export function createOrder(order: Order) {
  return apiFetch<CreateOrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      id: order.id,
      comanda: order.comanda,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      paidAt: order.paidAt ?? null,
      orderItems: order.items.map((item) => {
        const unitPrice = Number(getItemPrice(item) ?? 0)
        const totalPrice = unitPrice * item.quantity

        return {
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          notes: null,
          variations: (item.variationSelections ?? []).map((selection) => {
            const group = item.product.variationGroups?.find(
              (g) => g.id === selection.groupId
            )

            return {
              groupId: selection.groupId,
              options: selection.selectedOptionIds.map((optionId) => {
                const option = group?.options.find((o) => o.id === optionId)

                return {
                  optionId,
                  priceModifier: Number(option?.priceModifier ?? 0),
                }
              }),
            }
          }),
        }
      }),
    }),
  })
}

export function getOrders(includeCancelled = true) {
  const query = includeCancelled ? '?includeCancelled=true' : ''
  return apiFetch<OrdersListResponse>(`/orders${query}`)
}

export function cancelOrder(orderId: string) {
  return apiFetch<CreateOrderResponse>(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
  })
}