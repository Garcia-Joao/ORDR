import { apiFetch } from './client'

export type OrdersReportSummary = {
  summary: {
    totalOrders: number
    grossRevenue: number
    averageTicket: number
    totalItemsSold: number
    statusCounts: {
      pending: number
      paid: number
      cancelled: number
    }
  }
  charts: {
    salesByDay: Array<{
      date: string
      orders: number
      revenue: number
    }>
    topProductsByQuantity: Array<{
      productId: string
      name: string
      quantity: number
      revenue: number
    }>
    topProductsByRevenue: Array<{
      productId: string
      name: string
      quantity: number
      revenue: number
    }>
  }
  recentOrders: Array<{
    id: string
    comanda: number
    total: number
    status: 'pending' | 'paid' | 'cancelled'
    createdAt: string
    itemsCount: number
  }>
}

export async function getOrdersReportSummary(fromDate?: string, toDate?: string) {
  const params = new URLSearchParams()

  if (fromDate) {
    params.set('fromDate', fromDate)
  }

  if (toDate) {
    params.set('toDate', toDate)
  }

  const query = params.toString()
  const path = query
    ? `/orders/report/summary?${query}`
    : '/orders/report/summary'

  return apiFetch<OrdersReportSummary>(path)
}