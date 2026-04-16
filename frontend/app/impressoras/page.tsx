'use client'

import { useState } from 'react'
import { Printer, Plus, Trash2, CheckCircle, XCircle, RefreshCw, Settings2 } from 'lucide-react'

interface PrinterDevice {
  id: string
  name: string
  model: string
  ip: string
  port: number
  status: 'online' | 'offline' | 'error'
  type: 'thermal' | 'kitchen' | 'bar'
  paperWidth: 58 | 80
  lastPrint?: Date
}

const SAMPLE_PRINTERS: PrinterDevice[] = [
  {
    id: '1',
    name: 'Caixa Principal',
    model: 'Elgin i9',
    ip: '192.168.1.100',
    port: 9100,
    status: 'online',
    type: 'thermal',
    paperWidth: 80,
    lastPrint: new Date(),
  },
  {
    id: '2',
    name: 'Cozinha',
    model: 'Epson TM-T20',
    ip: '192.168.1.101',
    port: 9100,
    status: 'online',
    type: 'kitchen',
    paperWidth: 80,
    lastPrint: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '3',
    name: 'Bar',
    model: 'Bematech MP-4200 TH',
    ip: '192.168.1.102',
    port: 9100,
    status: 'offline',
    type: 'bar',
    paperWidth: 58,
  },
]

const printerTypes = [
  { id: 'thermal', label: 'Térmica (Cupom)' },
  { id: 'kitchen', label: 'Cozinha' },
  { id: 'bar', label: 'Bar' },
]

export default function ImpressorasPage() {
  const [printers, setPrinters] = useState<PrinterDevice[]>(SAMPLE_PRINTERS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPrinter, setEditingPrinter] = useState<PrinterDevice | null>(null)
  const [testingPrinter, setTestingPrinter] = useState<string | null>(null)

  const handleDeletePrinter = (printerId: string) => {
    setPrinters((prev) => prev.filter((p) => p.id !== printerId))
  }

  const handleEditPrinter = (printer: PrinterDevice) => {
    setEditingPrinter(printer)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingPrinter(null)
    setIsModalOpen(true)
  }

  const handleTestPrint = async (printerId: string) => {
    setTestingPrinter(printerId)
    // Simulate test print
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setTestingPrinter(null)
  }

  const handleSavePrinter = (printerData: Omit<PrinterDevice, 'id' | 'status' | 'lastPrint'>) => {
    if (editingPrinter) {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === editingPrinter.id
            ? { ...p, ...printerData }
            : p
        )
      )
    } else {
      const newPrinter: PrinterDevice = {
        ...printerData,
        id: Math.random().toString(36).substring(2, 9),
        status: 'offline',
      }
      setPrinters((prev) => [...prev, newPrinter])
    }
    setIsModalOpen(false)
    setEditingPrinter(null)
  }

  const getStatusBadge = (status: PrinterDevice['status']) => {
    switch (status) {
      case 'online':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Online
          </span>
        )
      case 'offline':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Offline
          </span>
        )
      case 'error':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Erro
          </span>
        )
    }
  }

  const getTypeBadge = (type: PrinterDevice['type']) => {
    const labels = {
      thermal: 'Cupom',
      kitchen: 'Cozinha',
      bar: 'Bar',
    }
    return (
      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
        {labels[type]}
      </span>
    )
  }

  const onlinePrinters = printers.filter((p) => p.status === 'online').length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Printer className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Impressoras</h1>
          <span className="text-sm text-muted-foreground">
            {onlinePrinters} de {printers.length} online
          </span>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nova Impressora
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {printers.map((printer) => (
            <div
              key={printer.id}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${printer.status === 'online' ? 'bg-success/10' : 'bg-muted'}`}>
                    <Printer className={`h-6 w-6 ${printer.status === 'online' ? 'text-success' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{printer.name}</h3>
                    <p className="text-sm text-muted-foreground">{printer.model}</p>
                  </div>
                </div>
                {getStatusBadge(printer.status)}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Endereço IP</span>
                  <span className="font-mono text-foreground">{printer.ip}:{printer.port}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tipo</span>
                  {getTypeBadge(printer.type)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Largura do Papel</span>
                  <span className="text-foreground">{printer.paperWidth}mm</span>
                </div>
                {printer.lastPrint && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Última Impressão</span>
                    <span className="text-foreground">
                      {printer.lastPrint.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => handleTestPrint(printer.id)}
                  disabled={testingPrinter === printer.id || printer.status !== 'online'}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 ${testingPrinter === printer.id ? 'animate-spin' : ''}`} />
                  {testingPrinter === printer.id ? 'Testando...' : 'Teste'}
                </button>
                <button
                  onClick={() => handleEditPrinter(printer)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeletePrinter(printer.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {printers.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Printer className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma impressora configurada</p>
              <p className="text-sm">Adicione uma impressora para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Printer Modal */}
      {isModalOpen && (
        <PrinterModal
          printer={editingPrinter}
          onSave={handleSavePrinter}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPrinter(null)
          }}
        />
      )}
    </div>
  )
}

function PrinterModal({
  printer,
  onSave,
  onClose,
}: {
  printer: PrinterDevice | null
  onSave: (data: Omit<PrinterDevice, 'id' | 'status' | 'lastPrint'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(printer?.name || '')
  const [model, setModel] = useState(printer?.model || '')
  const [ip, setIp] = useState(printer?.ip || '')
  const [port, setPort] = useState(printer?.port.toString() || '9100')
  const [type, setType] = useState<PrinterDevice['type']>(printer?.type || 'thermal')
  const [paperWidth, setPaperWidth] = useState<58 | 80>(printer?.paperWidth || 80)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      model,
      ip,
      port: parseInt(port) || 9100,
      type,
      paperWidth,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl border border-border w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {printer ? 'Editar Impressora' : 'Nova Impressora'}
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
              placeholder="Ex: Caixa Principal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Modelo</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Elgin i9"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Endereço IP</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="192.168.1.100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Porta</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="9100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PrinterDevice['type'])}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {printerTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Largura do Papel</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paperWidth"
                  checked={paperWidth === 58}
                  onChange={() => setPaperWidth(58)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-foreground">58mm</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paperWidth"
                  checked={paperWidth === 80}
                  onChange={() => setPaperWidth(80)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-foreground">80mm</span>
              </label>
            </div>
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
              {printer ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
