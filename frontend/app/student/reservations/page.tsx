"use client"

import { useEffect, useMemo, useState } from "react"
import { apiCancelReservation, apiMe, apiMyReservations, apiPickupReservation } from "@/lib/student"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, XCircle } from "lucide-react"
import { ListPagination, PAGE_SIZE } from "@/components/list-pagination"

type Reservation = {
  id: number
  userId: number
  livreId: number
  dateReservation: string
  dateReservationDue?: string | null
  statut: "disponible" | "en_attente" | string
  createdAt: string
  livre?: {
    id: number
    titre: string
    isbn: string
    imageUrl?: string | null
  } | null
  queuePosition?: number | null
}

const API_BASE = "/api"

export default function ReservationsPage() {
  const [meUserId, setMeUserId] = useState<number | null>(null)
  const [items, setItems] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [didAutoPickup, setDidAutoPickup] = useState(false)
  const [page, setPage] = useState(1)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await apiMe()
      const uid = me.user?.id ?? null
      setMeUserId(uid)
      if (!uid) {
        setItems([])
        return
      }
      const data = (await apiMyReservations(uid)) as Reservation[]

      // Auto-pickup runs once per page load to avoid repeated pickup calls.
      if (!didAutoPickup) {
        const nowMs = Date.now()
        const dueToPickup = data.filter((r) => {
          const startMs = r.dateReservation ? new Date(r.dateReservation).getTime() : NaN
          if (r.statut !== "disponible") return false
          return Number.isFinite(startMs) && startMs <= nowMs
        })

        setDidAutoPickup(true)
        if (dueToPickup.length) {
          await Promise.allSettled(dueToPickup.map((r) => apiPickupReservation(r.id)))
          const dataAfter = (await apiMyReservations(uid)) as Reservation[]
          setItems(dataAfter)
          return
        }
      }

      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reservations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const available = useMemo(() => items.filter((r) => r.statut === "disponible"), [items])
  const pending = useMemo(() => items.filter((r) => r.statut === "en_attente"), [items])

  const visible = useMemo(() => {
    const now = new Date().getTime()
    return items.filter((r) => {
      const startMs = r.dateReservation ? new Date(r.dateReservation).getTime() : NaN
      // If start date has arrived AND it's available, it should move to borrowed via pickup.
      if (r.statut === "disponible" && Number.isFinite(startMs) && startMs <= now) return false
      return true
    })
  }, [items])

  const sortedVisible = useMemo(
    () => visible.slice().sort((a, b) => new Date(b.dateReservation).getTime() - new Date(a.dateReservation).getTime()),
    [visible],
  )
  const totalPages = Math.max(1, Math.ceil(sortedVisible.length / PAGE_SIZE))
  const paginatedVisible = sortedVisible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const onCancel = async (id: number) => {
    setActingId(id)
    setError(null)
    try {
      await apiCancelReservation(id)
      setMessage("Reservation cancelled.")
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed")
    } finally {
      setActingId(null)
      setTimeout(() => setMessage(null), 2500)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Reservations</h1>
        <p className="text-slate-600 dark:text-slate-400">Track and cancel your reservations</p>
      </div>

      {!meUserId && !loading && (
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 text-sm">
          Please login to see your reservations.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200 text-sm">
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{available.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{pending.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{items.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            Reservations
          </CardTitle>
          <CardDescription>Your reservations (available and pending)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {visible.length === 0 && !loading ? (
            <div className="text-sm text-slate-600 dark:text-slate-400">No reservations yet.</div>
          ) : (
            paginatedVisible.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-20 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
                        {r.livre?.imageUrl ? (
                          <img
                            src={r.livre.imageUrl.startsWith("http") ? r.livre.imageUrl : `${API_BASE}${r.livre.imageUrl}`}
                            alt={r.livre?.titre || "Book"}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{r.livre?.titre || `Livre #${r.livreId}`}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{r.livre?.isbn || ""}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary">{r.statut}</Badge>
                          {r.statut === "disponible" ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Ready (available)
                            </Badge>
                          ) : null}
                          {typeof r.queuePosition === "number" && r.statut === "en_attente" ? (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                              Queue position #{r.queuePosition}
                            </Badge>
                          ) : null}
                        </div>

                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-500">Reservation date</span>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {r.dateReservation ? new Date(r.dateReservation).toLocaleDateString() : "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-500">Due date</span>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {r.dateReservationDue ? new Date(r.dateReservationDue).toLocaleDateString() : "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-500">Reservation ID</span>
                            <p className="font-medium text-slate-900 dark:text-white">#{r.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" disabled={actingId === r.id} onClick={() => void onCancel(r.id)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ))
          )}

          <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  )
}
