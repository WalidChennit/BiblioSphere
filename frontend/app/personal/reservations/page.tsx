"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { ListPagination, PAGE_SIZE } from "@/components/list-pagination"

export default function ReservationsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [reservations, setReservations] = useState<any[]>([])
  const [usersById, setUsersById] = useState<Map<number, any>>(new Map())
  const [actingId, setActingId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const [resUsers, resReservations] = await Promise.all([
        apiFetch("/users", { cache: "no-store" }),
        apiFetch("/reservations", { cache: "no-store" }),
      ])

      if (!resUsers.ok) throw new Error(await resUsers.text())
      if (!resReservations.ok) throw new Error(await resReservations.text())

      const users = (await resUsers.json()) as any[]
      const map = new Map<number, any>()
      for (const u of users) map.set(u.id, u)
      setUsersById(map)

      const data = (await resReservations.json()) as any[]
      setReservations(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const stats = useMemo(() => {
    const ready = reservations.filter((r) => r.statut === "disponible").length
    const queued = reservations.filter((r) => r.statut === "en_attente").length
    return { ready, queued, total: reservations.length }
  }, [reservations])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ready for Pickup":
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
      case "In Queue":
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready for Pickup":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
      case "In Queue":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400"
    }
  }

  const toUiStatus = (statut: string) => {
    if (statut === "disponible") return "Ready for Pickup"
    if (statut === "en_attente") return "In Queue"
    return statut
  }

  const computeQueuePosition = (livreId: number, dateReservation: string) => {
    const list = reservations
      .filter((r) => r.livreId === livreId && r.statut === "en_attente")
      .slice()
      .sort((a, b) => String(a.dateReservation).localeCompare(String(b.dateReservation)))
    const idx = list.findIndex((r) => String(r.dateReservation) === String(dateReservation))
    return idx === -1 ? null : idx + 1
  }

  const cancelReservation = async (id: number) => {
    try {
      setActingId(id)
      const res = await apiFetch(`/reservations/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed")
    } finally {
      setActingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(reservations.length / PAGE_SIZE))
  const paginatedReservations = reservations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const checkoutReservation = async (id: number) => {
    try {
      setActingId(id)
      const res = await apiFetch(`/reservations/${id}/pickup`, { method: "PATCH" })
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed")
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-8 h-8 text-pink-600 dark:text-pink-500" />
          Reservations Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Track and manage book reservations</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-500">
              {stats.ready}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">
              {stats.queued}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      ) : null}

      {/* Reservations List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-slate-600 dark:text-slate-400">Loading...</CardContent>
          </Card>
        ) : null}

        {paginatedReservations.map((reservation) => {
          const uiStatus = toUiStatus(reservation.statut)
          const user = usersById.get(reservation.userId)
          const reservedBy = user ? `${user.prenom} ${user.nom}` : `User #${reservation.userId}`
          const reservedDate = reservation.dateReservation ? String(reservation.dateReservation).slice(0, 10) : "—"
          const position =
            reservation.statut === "disponible"
              ? 0
              : reservation.queuePosition ?? computeQueuePosition(reservation.livreId, reservation.dateReservation)
          const isbn = reservation.livre?.isbn || "—"

          return (
          <Card key={reservation.id}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Book & Reservation Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Book Title</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {reservation.livre?.titre || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">ISBN</p>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{isbn}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Reserved Date</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{reservedDate}</p>
                  </div>
                </div>

                {/* Student & Status Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Reserved by</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{reservedBy}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Position in Queue</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {typeof position === "number" ? (position === 0 ? "Ready" : `#${position}`) : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(uiStatus)}
                        <span
                          className={`px-3 py-1 mt-2 rounded-full text-sm font-semibold ${getStatusColor(uiStatus)}`}
                        >
                          {uiStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status-specific Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                {uiStatus === "Ready for Pickup" && (
                  <>
                    <Button
                      size="sm"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      disabled={actingId === reservation.id}
                      onClick={() => void checkoutReservation(reservation.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Checkout Book
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actingId === reservation.id}
                      onClick={() => void cancelReservation(reservation.id)}
                    >
                      Cancel Reservation
                    </Button>
                  </>
                )}
                {uiStatus === "In Queue" && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>In queue</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actingId === reservation.id}
                      onClick={() => void cancelReservation(reservation.id)}
                    >
                      Cancel Reservation
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )})}
      </div>

      <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
