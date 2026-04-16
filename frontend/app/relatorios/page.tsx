'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
} from 'lucide-react'

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const DAILY_SALES = [
  { day: 'Seg', sales: 1250 },
  { day: 'Ter', sales: 980 },
  { day: 'Qua', sales: 1420 },
  { day: 'Qui', sales: 1680 },
  { day: 'Sex', sales: 2340 },
  { day: 'Sáb', sales: 3150 },
  { day: 'Dom', sales: 2890 },
]

const TOP_PRODUCTS = [
  { name: 'Heineken', quantity: 145, revenue: 1740 },
  { name: 'Caipirinha', quantity: 98, revenue: 1960 },
  { name: 'Picanha', quantity: 67, revenue: 4020 },
  { name: 'Brahma', quantity: 120, revenue: 960 },
  { name: 'Gin Tonica', quantity: 52, revenue: 1300 },
]

const PAYMENT_METHODS = [
  { method: 'Cartão de Crédito', percentage: 45, amount: 6120 },
  { method: 'PIX', percentage: 35, amount: 4760 },
  { method: 'Cartão de Débito', percentage: 15, amount: 2040 },
  { method: 'Dinheiro', percentage: 5, amount: 680 },
]

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')

  const maxSales = Math.max(...DAILY_SALES.map((d) => d.sales))
  const totalWeekSales = DAILY_SALES.reduce((sum, d) => sum + d.sales, 0)
  const avgDailySales = totalWeekSales / 7

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Relatórios</h1>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setPeriod('today')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === 'today'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === 'week'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === 'month'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-success text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>+12%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Faturamento</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalWeekSales)}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-success" />
              </div>
              <div className="flex items-center gap-1 text-success text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>+8%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Pedidos</p>
            <p className="text-2xl font-bold text-foreground">342</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div className="flex items-center gap-1 text-destructive text-sm">
                <TrendingDown className="h-4 w-4" />
                <span>-3%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Clientes Atendidos</p>
            <p className="text-2xl font-bold text-foreground">186</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Calendar className="h-5 w-5 text-chart-2" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(avgDailySales / 49)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="col-span-2 bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Vendas por Dia</h2>
            <div className="flex items-end justify-between gap-4 h-64">
              {DAILY_SALES.map((data) => (
                <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex items-end justify-center h-48">
                    <div
                      className="w-full max-w-[48px] bg-primary/80 hover:bg-primary rounded-t-lg transition-all cursor-pointer"
                      style={{ height: `${(data.sales / maxSales) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{data.day}</span>
                  <span className="text-xs text-foreground font-mono">{formatCurrency(data.sales)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Formas de Pagamento</h2>
            <div className="space-y-4">
              {PAYMENT_METHODS.map((payment, index) => (
                <div key={payment.method}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">{payment.method}</span>
                    <span className="text-sm text-muted-foreground">{payment.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${payment.percentage}%`,
                        backgroundColor: `var(--chart-${index + 1})`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="col-span-3 bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Produtos Mais Vendidos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-4 text-sm font-medium text-muted-foreground">Posição</th>
                    <th className="text-left pb-4 text-sm font-medium text-muted-foreground">Produto</th>
                    <th className="text-right pb-4 text-sm font-medium text-muted-foreground">Quantidade</th>
                    <th className="text-right pb-4 text-sm font-medium text-muted-foreground">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_PRODUCTS.map((product, index) => (
                    <tr key={product.name} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <span
                          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0
                              ? 'bg-primary text-primary-foreground'
                              : index === 1
                              ? 'bg-chart-2/20 text-chart-2'
                              : index === 2
                              ? 'bg-warning/20 text-warning'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-foreground">{product.name}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-foreground">{product.quantity} unidades</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="font-mono text-foreground">{formatCurrency(product.revenue)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
