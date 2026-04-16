'use client'

import { Clock, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

interface HeaderProps {
  registerOpen: boolean
  onToggleRegister: () => void
}

export function Header({ registerOpen, onToggleRegister }: HeaderProps) {
  const [time, setTime] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Ordr</span>
          <span className="text-muted-foreground font-normal text-sm ml-2">POS</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-success" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
          <span className={`text-sm ${isOnline ? 'text-success' : 'text-destructive'}`}>
            {isOnline ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-mono" suppressHydrationWarning>
            {time?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || '--:--'}
          </span>
        </div>

        {/* Register Status */}
        <button
          onClick={onToggleRegister}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            registerOpen
              ? 'bg-success/20 text-success hover:bg-success/30'
              : 'bg-destructive/20 text-destructive hover:bg-destructive/30'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${registerOpen ? 'bg-success' : 'bg-destructive'}`} />
          Caixa {registerOpen ? 'Aberto' : 'Fechado'}
        </button>
      </div>
    </header>
  )
}
