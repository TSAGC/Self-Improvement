import { getApiUrlOverride } from "@/lib/preferences"

const DEFAULT_API_URL = "http://localhost:4000"

export function getApiBaseUrl() {
  const override = getApiUrlOverride()
  if (override) return override
  const url = import.meta.env.VITE_API_URL
  if (typeof url === "string" && url.length > 0) return url
  return DEFAULT_API_URL
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`)
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`POST ${path} failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`PATCH ${path} failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error(`DELETE ${path} failed: ${res.status}`)
  }
  return (await res.json()) as T
}
