import { apiFetch } from './client'
import type { Order } from '../pos-types'

export function createOrder(order: Order) {
  return apiFetch<Partial<Order>>('/pedido', {
    method: 'POST',
    body: JSON.stringify(order),
  })
}