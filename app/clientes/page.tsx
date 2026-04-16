'use client'

import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Users, CreditCard } from 'lucide-react'

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  comanda: number
  totalSpent: number
  visits: number
  createdAt: Date
}

const SAMPLE_CUSTOMERS: Customer[] = [
  { id: '1', name: 'João Silva', phone: '(11) 99999-1234', email: 'joao@email.com', comanda: 42, totalSpent: 450.00, visits: 12, createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Maria Santos', phone: '(11) 98888-5678', email: 'maria@email.com', comanda: 15, totalSpent: 280.50, visits: 8, createdAt: new Date('2024-02-20') },
  { id: '3', name: 'Pedro Oliveira', phone: '(11) 97777-9012', email: 'pedro@email.com', comanda: 78, totalSpent: 620.00, visits: 15, createdAt: new Date('2024-01-05') },
  { id: '4', name: 'Ana Costa', phone: '(11) 96666-3456', email: 'ana@email.com', comanda: 33, totalSpent: 180.00, visits: 5, createdAt: new Date('2024-03-10') },
  { id: '5', name: 'Carlos Ferreira', phone: '(11) 95555-7890', email: 'carlos@email.com', comanda: 56, totalSpent: 890.00, visits: 22, createdAt: new Date('2023-12-01') },
]

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>(SAMPLE_CUSTOMERS)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase()
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.phone.includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      customer.comanda.toString().includes(search)
    )
  })

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId))
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'totalSpent' | 'visits' | 'createdAt'>) => {
    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? { ...c, ...customerData }
            : c
        )
      )
    } else {
      const newCustomer: Customer = {
        ...customerData,
        id: Math.random().toString(36).substring(2, 9),
        totalSpent: 0,
        visits: 0,
        createdAt: new Date(),
      }
      setCustomers((prev) => [...prev, newCustomer])
    }
    setIsModalOpen(false)
    setEditingCustomer(null)
  }

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalVisits = customers.reduce((sum, c) => sum + c.visits, 0)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Clientes</h1>
          <span className="text-sm text-muted-foreground">
            {customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-border bg-card/50">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold text-foreground">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Users className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Visitas</p>
              <p className="text-2xl font-bold text-foreground">{totalVisits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, email ou comanda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Contato</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Comanda</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Total Gasto</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Visitas</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{customer.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">{customer.phone}</span>
                      <span className="text-xs text-muted-foreground">{customer.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-mono font-medium">
                      #{customer.comanda}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-foreground">{formatCurrency(customer.totalSpent)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-foreground">{customer.visits}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
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

          {filteredCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum cliente encontrado</p>
              <p className="text-sm">Tente ajustar a busca ou adicione um novo cliente</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Modal */}
      {isModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCustomer(null)
          }}
        />
      )}
    </div>
  )
}

function CustomerModal({
  customer,
  onSave,
  onClose,
}: {
  customer: Customer | null
  onSave: (data: Omit<Customer, 'id' | 'totalSpent' | 'visits' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(customer?.name || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [email, setEmail] = useState(customer?.email || '')
  const [comanda, setComanda] = useState(customer?.comanda.toString() || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      phone,
      email,
      comanda: parseInt(comanda) || 0,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl border border-border w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Comanda</label>
            <input
              type="number"
              min="1"
              value={comanda}
              onChange={(e) => setComanda(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Número da comanda"
              required
            />
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
              {customer ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
