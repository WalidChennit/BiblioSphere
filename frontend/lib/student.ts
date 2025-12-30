import { apiFetch } from "./api"

export type MeResponse = {
  user: {
    id: number
    email: string
    role: string
  } | null
}

export async function apiMe(): Promise<MeResponse> {
  const res = await apiFetch("/auth/me", { cache: "no-store" })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as MeResponse
}

export type UpdateMeInput = {
  email?: string
  telephone?: string
  matricule?: string
}

export type UpdateMeResponse = {
  ok: boolean
  user: {
    id: number
    email: string
    prenom: string
    nom: string
    nin: string
    matricule: string | null
    dateDeNaissance: string
    telephone: string
    role: string
    status: string
    createdAt: string
  }
}

export async function apiUpdateMe(data: UpdateMeInput): Promise<UpdateMeResponse> {
  const res = await apiFetch("/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as UpdateMeResponse
}

export async function apiChangeMyPassword(input: {
  currentPassword: string
  newPassword: string
}): Promise<{ ok: true }> {
  const res = await apiFetch("/users/me/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as { ok: true }
}

export async function apiBorrow(livreId: number, userId: number) {
  const res = await apiFetch("/emprunts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ livreId, userId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as unknown
}

export async function apiReturnEmprunt(empruntId: number) {
  const res = await apiFetch(`/emprunts/${empruntId}/return`, {
    method: "PATCH",
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as unknown
}

export async function apiRenewEmprunt(empruntId: number, dateRetour: string) {
  const res = await apiFetch(`/emprunts/${empruntId}/renew`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dateRetour }),
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as unknown
}

export async function apiReserve(livreId: number, userId: number, dateReservation?: string, dateReservationDue?: string) {
  const res = await apiFetch("/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      livreId,
      userId,
      ...(dateReservation ? { dateReservation } : {}),
      ...(dateReservationDue ? { dateReservationDue } : {}),
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as unknown
}

export async function apiPickupReservation(reservationId: number) {
  const res = await apiFetch(`/reservations/${reservationId}/pickup`, {
    method: "PATCH",
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as unknown
}

export async function apiCancelReservation(reservationId: number) {
  const res = await apiFetch(`/reservations/${reservationId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as unknown
}

export async function apiMyBorrowed(userId: number) {
  const res = await apiFetch(`/emprunts/user/${userId}`, { cache: "no-store" })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as unknown
}

export async function apiMyReservations(userId: number) {
  const res = await apiFetch(`/reservations/user/${userId}`, { cache: "no-store" })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as unknown
}

export type StudentStatsResponse = {
  counts: {
    borrowedTotal: number
    reservedPending: number
    reservedAvailable: number
    activeBorrowed: number
    overdue: number
  }
  monthlyTrends: Array<{ month: string; borrowed: number; reserved: number; returned: number }>
  categoryData: Array<{ name: string; value: number }>
}

export async function apiStudentStats(userId: number) {
  const res = await apiFetch(`/student/${userId}/stats`, { cache: "no-store" })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as StudentStatsResponse
}

export type NotificationPrefs = {
  // Student
  studentNewBooks?: boolean
  studentReservationAvailable?: boolean
  studentBorrowDueSoon?: boolean

  // Personnel
  personnelReservationAlerts?: boolean
  personnelBorrowAlerts?: boolean
  personnelAuthorAdded?: boolean
}

export async function apiGetMyNotificationPrefs(): Promise<{ ok: true; prefs: NotificationPrefs }> {
  const res = await apiFetch("/users/me/notification-prefs", { cache: "no-store" })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as { ok: true; prefs: NotificationPrefs }
}

export async function apiUpdateMyNotificationPrefs(
  patch: NotificationPrefs,
): Promise<{ ok: true; prefs: NotificationPrefs }> {
  const res = await apiFetch("/users/me/notification-prefs", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as { ok: true; prefs: NotificationPrefs }
}
