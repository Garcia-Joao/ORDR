'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BarChart3,
  ShoppingCart,
  Wallet,
  Package,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getOrdersReportSummary, type OrdersReportSummary } from '@/lib/api/reports'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function RelatoriosPage() {
  const [data, setData] = useState<OrdersReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fromDate, setFromDate] = useState(() => toDateInputValue(new Date()))
  const [toDate, setToDate] = useState(() => toDateInputValue(new Date()))

  const fromDateRef = useRef<HTMLInputElement>(null)
  const toDateRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const summary = await getOrdersReportSummary(
          fromDate || undefined,
          toDate || undefined
        )
        setData(summary)
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [fromDate, toDate])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-muted-foreground">Carregando relatórios...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-muted-foreground">Não foi possível carregar os relatórios.</span>
      </div>
    )
  }

  const statusData = [
    { name: 'Pendentes', value: data.summary.statusCounts.pending },
    { name: 'Pagos', value: data.summary.statusCounts.paid },
    { name: 'Cancelados', value: data.summary.statusCounts.cancelled },
  ]

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-sm text-muted-foreground">De</span>
            <button
              type="button"
              onClick={() => fromDateRef.current?.showPicker?.()}
              className="text-muted-foreground hover:text-foreground"
            >
              <Calendar className="h-4 w-4" />
            </button>
            <input
              ref={fromDateRef}
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-sm text-foreground outline-none"
              max={toDate || undefined}
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-sm text-muted-foreground">Até</span>
            <button
              type="button"
              onClick={() => toDateRef.current?.showPicker?.()}
              className="text-muted-foreground hover:text-foreground"
            >
              <Calendar className="h-4 w-4" />
            </button>
            <input
              ref={toDateRef}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-sm text-foreground outline-none"
              min={fromDate || undefined}
            />
          </div>

          <button
            onClick={() => {
              const today = toDateInputValue(new Date())
              setFromDate(today)
              setToDate(today)
            }}
            className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
          >
            Hoje
          </button>

          <button
            onClick={() => {
              setFromDate('')
              setToDate('')
            }}
            className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
          >
            Limpar datas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <ReportCard
          title="Total de Pedidos"
          value={String(data.summary.totalOrders)}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <ReportCard
          title="Faturamento"
          value={formatBRL(data.summary.grossRevenue)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <ReportCard
          title="Ticket Médio"
          value={formatBRL(data.summary.averageTicket)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <ReportCard
          title="Itens Vendidos"
          value={String(data.summary.totalItemsSold)}
          icon={<Package className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Vendas por Dia</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === 'revenue' ? formatBRL(value) : value
                  }
                />
                <Bar dataKey="revenue" name="revenue" radius={[6, 6, 0, 0]} fill='#8a3f03'/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Pedidos por Status</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  fill='#8a3f03'
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Top Produtos por Quantidade
          </h2>
          <div className="space-y-3">
            {data.charts.topProductsByQuantity.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.quantity} unidades
                  </p>
                </div>
                <span className="font-semibold text-primary">
                  {formatBRL(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Top Produtos por Faturamento
          </h2>
          <div className="space-y-3">
            {data.charts.topProductsByRevenue.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.quantity} unidades
                  </p>
                </div>
                <span className="font-semibold text-primary">
                  {formatBRL(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Pedidos Recentes</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 text-sm text-muted-foreground">Pedido</th>
                <th className="py-3 pr-4 text-sm text-muted-foreground">Comanda</th>
                <th className="py-3 pr-4 text-sm text-muted-foreground">Itens</th>
                <th className="py-3 pr-4 text-sm text-muted-foreground">Status</th>
                <th className="py-3 pr-4 text-sm text-muted-foreground">Total</th>
                <th className="py-3 pr-4 text-sm text-muted-foreground">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-mono text-sm">#{order.id}</td>
                  <td className="py-3 pr-4">{order.comanda}</td>
                  <td className="py-3 pr-4">{order.itemsCount}</td>
                  <td className="py-3 pr-4 capitalize">{order.status}</td>
                  <td className="py-3 pr-4 font-medium">{formatBRL(order.total)}</td>
                  <td className="py-3 pr-4">
                    {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ReportCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}