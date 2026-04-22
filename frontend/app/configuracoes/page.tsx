'use client'

import { useEffect, useState } from 'react'
import {
  Settings,
  Building2,
  FlaskConical,
  Save,
  CheckCircle2,
  Plus,
  Loader2,
  ClipboardList,
} from 'lucide-react'
import { getMe, switchCompany, type AuthCompany, type AuthUser } from '@/lib/api/auth'
import { createTestCompany } from '@/lib/api/companies'

const REQUIRE_COMANDA_STORAGE_KEY = 'ordr-settings-require-comanda'

export default function ConfiguracoesPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [companies, setCompanies] = useState<AuthCompany[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copyDataToTest, setCopyDataToTest] = useState(true)
  const [isCreatingTestCompany, setIsCreatingTestCompany] = useState(false)
  const [requireComanda, setRequireComanda] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getMe()
        setUser(result.user)
        setCompanies(result.user.companies)
        setSelectedCompanyId(result.user.companyId)

        const savedRequireComanda = localStorage.getItem(REQUIRE_COMANDA_STORAGE_KEY)
        if (savedRequireComanda !== null) {
          setRequireComanda(savedRequireComanda === 'true')
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const selectedCompany =
    companies.find((company) => company.id === selectedCompanyId) || null

  const handleCreateTestCompany = async () => {
    try {
      setIsCreatingTestCompany(true)

      const result = await createTestCompany(copyDataToTest)

      alert(`Empresa de teste criada: ${result.company.name}`)

      const refreshed = await getMe()
      setUser(refreshed.user)
      setCompanies(refreshed.user.companies)
      setSelectedCompanyId(result.company.id)
    } catch (error: any) {
      console.error('Erro ao criar empresa de teste:', error)
      alert(error?.message || 'Erro ao criar empresa de teste')
    } finally {
      setIsCreatingTestCompany(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaved(false)

      localStorage.setItem(REQUIRE_COMANDA_STORAGE_KEY, String(requireComanda))

      if (selectedCompanyId && selectedCompanyId !== user?.companyId) {
        const result = await switchCompany(selectedCompanyId)

        setUser(result.user)
        setCompanies(result.user.companies)
        setSelectedCompanyId(result.user.companyId)

        localStorage.setItem('ordr-user', JSON.stringify(result.user))
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)

      window.location.reload()
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error)
      alert(error?.message || 'Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-muted-foreground">Carregando configurações...</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
            <p className="text-sm text-muted-foreground">
              Empresa ativa e comportamento do PDV
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            saved
              ? 'bg-success text-success-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {saved ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saved ? 'Salvo!' : isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-6">
          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Empresa ativa</h2>
                <p className="text-sm text-muted-foreground">
                  Escolha qual empresa será usada no sistema
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {companies.map((company) => {
                const isSelected = company.id === selectedCompanyId

                return (
                  <label
                    key={company.id}
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-secondary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="active-company"
                        value={company.id}
                        checked={isSelected}
                        onChange={() => setSelectedCompanyId(company.id)}
                        className="h-4 w-4"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {company.name}
                          </span>

                          {company.isTest && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/15 text-warning">
                              <FlaskConical className="h-3.5 w-3.5" />
                              Ambiente de teste
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          Papel neste ambiente: {company.role}
                        </p>
                      </div>
                    </div>

                    {user?.companyId === company.id && (
                      <span className="text-sm font-medium text-primary">
                        Atual
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </section>

          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Configurações do PDV</h2>
                <p className="text-sm text-muted-foreground">
                  Regras aplicadas na tela de vendas
                </p>
              </div>
            </div>

            <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <span className="text-foreground font-medium">
                  Exigir número da comanda
                </span>
                <p className="text-sm text-muted-foreground">
                  O PDV só permite finalizar o pedido se o número da comanda estiver preenchido
                </p>
              </div>

              <input
                type="checkbox"
                checked={requireComanda}
                onChange={(e) => setRequireComanda(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
            </label>
          </section>

          <section className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-3">
              Resumo do ambiente
            </h3>

            {selectedCompany ? (
              <div className="rounded-xl bg-secondary/40 border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Empresa selecionada</span>
                  <span className="font-medium text-foreground">
                    {selectedCompany.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipo de ambiente</span>
                  <span
                    className={`text-sm font-medium ${
                      selectedCompany.isTest ? 'text-warning' : 'text-success'
                    }`}
                  >
                    {selectedCompany.isTest ? 'Teste' : 'Produção'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma empresa selecionada.
              </p>
            )}
          </section>

          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-warning/10 rounded-lg">
                <FlaskConical className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Ambiente de teste
                </h2>
                <p className="text-sm text-muted-foreground">
                  Crie uma empresa de teste com base na empresa atual
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <span className="text-foreground font-medium">
                    Copiar estrutura da empresa atual
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Copia categorias, produtos e variações. Pedidos não são copiados.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={copyDataToTest}
                  onChange={(e) => setCopyDataToTest(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
              </label>

              <button
                onClick={handleCreateTestCompany}
                disabled={isCreatingTestCompany || !user?.companyId}
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium bg-warning text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingTestCompany ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Criando ambiente de teste...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Criar empresa de teste
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}