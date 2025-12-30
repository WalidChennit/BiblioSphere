import { apiFetch } from "@/lib/api"

export type NotificationItem = {
  id: number
  createdAt: string
  readAt: string | null
  type: string
  title: string
  message: string
  href: string | null
}

export async function apiListNotifications(params?: { unreadOnly?: boolean; limit?: number }) {
  const q = new URLSearchParams()
  if (params?.unreadOnly) q.set("unreadOnly", "1")
  if (params?.limit) q.set("limit", String(params.limit))
  const res = await apiFetch(`/notifications${q.toString() ? `?${q.toString()}` : ""}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load notifications")
  return (await res.json()) as { items: NotificationItem[]; unreadCount: number }
}

export async function apiMarkNotificationRead(id: number) {
  const res = await apiFetch(`/notifications/${id}/read`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to mark notification read")
  return (await res.json()) as { ok: boolean }
}

export async function apiMarkAllNotificationsRead() {
  const res = await apiFetch(`/notifications/read-all`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to mark all notifications read")
  return (await res.json()) as { ok: boolean }
}
