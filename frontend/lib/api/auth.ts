import { apiFetch } from './client'

export interface AuthUser {
  id: string
  username: string
  role: string
  companyId: string
}

export interface LoginResponse {
  user: AuthUser
}

export function login(username: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout() {
  return apiFetch<{ ok: true }>('/auth/logout', {
    method: 'POST',
  })
}

export function me() {
  return apiFetch<{ user: AuthUser }>('/auth/me', {
    method: 'GET',
  })
}