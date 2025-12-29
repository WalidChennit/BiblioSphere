export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

export async function apiFetch(input: string, init: RequestInit = {}) {
  const url = input.startsWith("http") ? input : `${API_BASE}${input.startsWith("/") ? input : `/${input}`}`
  return fetch(url, {
    ...init,
    credentials: "include",
  })
}
