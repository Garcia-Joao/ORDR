const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

function getCompanyIdFromStorage() {
  if (typeof window === 'undefined') return null

  try {
    const rawUser = localStorage.getItem('ordr-user')
    if (!rawUser) return null

    const user = JSON.parse(rawUser)

    return (
      user.companyId ??
      user.company?.id ??
      user.companies?.[0]?.id ??
      null
    )
  } catch {
    return null
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const companyId = getCompanyIdFromStorage()

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(companyId ? { 'x-company-id': companyId } : {}),
      ...(options?.headers || {}),
    },
  })

  let data: any = null
  const text = await response.text()

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text ? { raw: text } : null
  }

  if (!response.ok) {
    console.error('API error', {
      path,
      status: response.status,
      statusText: response.statusText,
      data,
    })

    throw new Error(
      data?.error ||
        response.statusText ||
        `Erro na requisição (${response.status})`
    )
  }

  return data as T
}
