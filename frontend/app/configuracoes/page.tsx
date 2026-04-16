'use client'

import { useState } from 'react'
import { Settings, Store, Receipt, CreditCard, Bell, Shield, Save } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [businessName, setBusinessName] = useState('Bar do João')
  const [businessAddress, setBusinessAddress] = useState('Rua das Flores, 123 - Centro')
  const [businessPhone, setBusinessPhone] = useState('(11) 99999-9999')
  const [cnpj, setCnpj] = useState('12.345.678/0001-90')
  const [taxRate, setTaxRate] = useState('8')
  const [serviceCharge, setServiceCharge] = useState('10')
  const [autoCloseRegister, setAutoCloseRegister] = useState(true)
  const [printOnSale, setPrintOnSale] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(true)
  const [requireComanda, setRequireComanda] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-success text-success-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          <Save className="h-5 w-5" />
          {saved ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-6">
          {/* Business Info */}
          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Dados do Estabelecimento</h2>
                <p className="text-sm text-muted-foreground">Informações que aparecerão nos cupons</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Nome do Estabelecimento</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Endereço</label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                <input
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">CNPJ</label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </section>

          {/* Fiscal Settings */}
          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Receipt className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Configurações Fiscais</h2>
                <p className="text-sm text-muted-foreground">Taxas e impostos aplicados</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Taxa de Imposto (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Taxa de Serviço (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </section>

          {/* Payment Settings */}
          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-success/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Formas de Pagamento</h2>
                <p className="text-sm text-muted-foreground">Métodos aceitos no estabelecimento</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX'].map((method) => (
                <label key={method} className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-foreground">{method}</span>
                </label>
              ))}
            </div>
          </section>

          {/* System Settings */}
          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Shield className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Configurações do Sistema</h2>
                <p className="text-sm text-muted-foreground">Comportamento do PDV</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <div>
                  <span className="text-foreground font-medium">Fechar caixa automaticamente</span>
                  <p className="text-sm text-muted-foreground">Fecha o caixa às 23:59</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoCloseRegister}
                  onChange={(e) => setAutoCloseRegister(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <div>
                  <span className="text-foreground font-medium">Imprimir automaticamente</span>
                  <p className="text-sm text-muted-foreground">Imprime cupom após cada venda</p>
                </div>
                <input
                  type="checkbox"
                  checked={printOnSale}
                  onChange={(e) => setPrintOnSale(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <div>
                  <span className="text-foreground font-medium">Alertas sonoros</span>
                  <p className="text-sm text-muted-foreground">Tocar som em novos pedidos</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <div>
                  <span className="text-foreground font-medium">Exigir comanda</span>
                  <p className="text-sm text-muted-foreground">Obrigatório informar comanda para vender</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireComanda}
                  onChange={(e) => setRequireComanda(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
              </label>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Bell className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
                <p className="text-sm text-muted-foreground">Alertas e avisos do sistema</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Estoque baixo', desc: 'Avisa quando produto estiver acabando' },
                { label: 'Caixa ocioso', desc: 'Avisa após 5 minutos sem vendas' },
                { label: 'Impressora offline', desc: 'Avisa quando impressora desconectar' },
              ].map((notification) => (
                <label key={notification.label} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                  <div>
                    <span className="text-foreground font-medium">{notification.label}</span>
                    <p className="text-sm text-muted-foreground">{notification.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
