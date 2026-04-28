const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export type PersonContractType = 'CLT' | 'FREELANCER' | 'PJ' | 'NONE' | 'OTHER'
export type PersonRateType = 'HOURLY' | 'DAILY' | 'EVENT' | 'MONTHLY' | 'NEGOTIABLE'

export type PersonFunction = {
    id: string
    name: string
    description?: string | null
}

export type PersonFunctionAssignment = {
    id: string
    detail?: string | null
    function: PersonFunction
}

export type ManagedPerson = {
    id: string
    name: string
    phone?: string | null
    email?: string | null
    city?: string | null
    contractType: PersonContractType
    salesEnvironmentId?: string | null
    salesEnvironment?: {
        id: string
        name: string
        color?: string | null
    } | null
    rateType: PersonRateType
    rateAmount?: number | string | null
    rating?: number | null
    observations?: string | null
    active: boolean
    internalCustomerId?: string | null
    functions: PersonFunctionAssignment[]
}

export type SavePersonPayload = {
    name: string
    phone?: string | null
    email?: string | null
    city?: string | null
    contractType: PersonContractType
    salesEnvironmentId?: string | null
    rateType: PersonRateType
    rateAmount?: number | null
    rating?: number | null
    observations?: string | null
    active?: boolean
    functions: {
        functionId: string
        detail?: string | null
    }[]
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(data?.error || `Erro na requisição (${response.status})`)
    }

    return data as T
}

export function getPeople() {
    return apiFetch<ManagedPerson[]>('/people')
}

export function getPersonFunctions() {
    return apiFetch<PersonFunction[]>('/people/functions')
}

export function createPersonFunction(payload: {
    name: string
    description?: string | null
}) {
    return apiFetch<PersonFunction>('/people/functions', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export function createPerson(payload: SavePersonPayload) {
    return apiFetch<ManagedPerson>('/people', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export function updatePerson(personId: string, payload: SavePersonPayload) {
    return apiFetch<ManagedPerson>(`/people/${personId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

export function deletePerson(personId: string) {
    return apiFetch<{ ok: true }>(`/people/${personId}`, {
        method: 'DELETE',
    })
}

type PersonActionResult = {
    ok: true
    removedFromInternalPdv?: boolean
    hasOpenOrders?: boolean
}

export function disablePerson(personId: string) {
    return apiFetch<PersonActionResult>(`/people/${personId}/disable`, {
        method: 'PATCH',
    })
}

export function restorePerson(personId: string) {
    return apiFetch<PersonActionResult>(`/people/${personId}/restore`, {
        method: 'PATCH',
    })
}

export function permanentlyDeletePerson(personId: string) {
    return apiFetch<PersonActionResult>(`/people/${personId}`, {
        method: 'DELETE',
    })
}