export const API_BASE = "/api"

export async function apiFetch(input: string, init: RequestInit = {}) {
  const url = input.startsWith("http") ? input : `${API_BASE}${input.startsWith("/") ? input : `/${input}`}`
  return fetch(url, {
    ...init,
    credentials: "include",
  })
}
