import { apiFetch } from './client'

export type AuthCompany = {
  id: string
  name: string
  isTest: boolean
  role: string
}

export type AuthUser = {
  id: string
  username: string
  role: string
  companyId: string
  companies: AuthCompany[]
}

export function login(username: string, password: string) {
  return apiFetch<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout() {
  return apiFetch<{ ok: true }>('/auth/logout', {
    method: 'POST',
  })
}

export function getMe() {
  return apiFetch<{ user: AuthUser }>('/auth/me')
}

export function switchCompany(companyId: string) {
  return apiFetch<{ user: AuthUser }>('/auth/switch-company', {
    method: 'POST',
    body: JSON.stringify({ companyId }),
  })
}