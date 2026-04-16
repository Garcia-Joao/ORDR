const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  })

  let data: any = null

  try {
    data = await response.json()
  } catch {}

  if (!response.ok) {
    console.error('API error', {
      path,
      status: response.status,
      data,
    })

    throw new Error(data?.error || `Erro na requisição (${response.status})`)
  }

  return data as T
}