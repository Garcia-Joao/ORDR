import { apiFetch } from './client'
import type { Product } from '../pos-types'

export function getProducts(includeInactive = false) {
  const query = includeInactive ? '?includeInactive=true' : ''
  return apiFetch<Product[]>(`/products${query}`, {
    method: 'GET',
  })
}

export function getProductById(id: string) {
  return apiFetch<Product>(`/products/${id}`, {
    method: 'GET',
  })
}

export function createProduct(data: Omit<Product, 'id'>) {
  return apiFetch<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>) {
  return apiFetch<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteProduct(id: string) {
  return apiFetch<{ ok: true }>(`/products/${id}`, {
    method: 'DELETE',
  })
}