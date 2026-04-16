'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingCart,
  Package,
  Printer,
  Monitor,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/PDV', icon: ShoppingCart, label: 'PDV', description: 'Ponto de Venda' },
  { href: '/produtos', icon: Package, label: 'Produtos', description: 'Gerenciar cardápio' },
  { href: '/pedidos', icon: ClipboardList, label: 'Pedidos', description: 'Visualizar Pedidos' },
  { href: '/clientes', icon: Users, label: 'Clientes', description: 'Cadastro de clientes' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios', description: 'Vendas e análises' },
  { href: '/impressoras', icon: Printer, label: 'Impressoras', description: 'Configurar impressoras' },
  { href: '/dispositivos', icon: Monitor, label: 'Dispositivos', description: 'Gerenciar terminais' },
  { href: '/configuracoes', icon: Settings, label: 'Configurações', description: 'Ajustes do sistema' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  return (
    <aside
      className={`flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/PDV" className="flex items-center gap-2">
            <span className="text-xl font-bold text-sidebar-primary">Ordr</span>
            <span className="text-xs text-sidebar-foreground/60 font-medium">POS</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/PDV" className="mx-auto">
            <span className="text-xl font-bold text-sidebar-primary">O</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      {!isActive && (
                        <span className="text-xs text-sidebar-foreground/50">{item.description}</span>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-2 text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
