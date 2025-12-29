"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Book, BookOpen, Heart } from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function PersonalDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [stats, setStats] = useState<any>(null)
  const [usersById, setUsersById] = useState<Map<number, any>>(new Map())

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError("")

        const [resStats, resUsers] = await Promise.all([
          apiFetch("/personal/stats", { cache: "no-store" }),
          apiFetch("/users", { cache: "no-store" }),
        ])
        if (!resStats.ok) throw new Error(await resStats.text())
        if (!resUsers.ok) throw new Error(await resUsers.text())

        const data = (await resStats.json()) as any
        const users = (await resUsers.json()) as any[]
        const map = new Map<number, any>()
        for (const u of users) map.set(u.id, u)

        if (cancelled) return
        setStats(data)
        setUsersById(map)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const kpis = stats?.kpis || {
    totalBooks: 0,
    activeBorrows: 0,
    overdueItems: 0,
    pendingReservations: 0,
  }

  const overdues = useMemo(() => {
    const list = (stats?.overdues || []) as any[]
    return list.map((o) => {
      const u = usersById.get(o.userId)
      const borrower = u ? `${u.prenom} ${u.nom}` : `User #${o.userId}`
      const dueMs = o.dueDate ? new Date(o.dueDate).getTime() : NaN
      const daysOverdue = Number.isFinite(dueMs) ? Math.max(0, Math.floor((Date.now() - dueMs) / 86400000)) : 0
      return { id: o.id, title: o.title || "—", borrower, daysOverdue }
    })
  }, [stats, usersById])

  const nextReservations = useMemo(() => {
    const list = (stats?.readyReservations || []) as any[]
    return list.map((r) => {
      const u = usersById.get(r.userId)
      const student = u ? `${u.prenom} ${u.nom}` : `User #${r.userId}`
      return { id: r.id, book: r.title || "—", student, position: 0, status: "Ready for Pickup" }
    })
  }, [stats, usersById])

  const borrows = useMemo(() => {
    const list = (stats?.borrows || []) as any[]
    return list.map((b) => {
      const u = usersById.get(b.userId)
      const borrower = u ? `${u.prenom} ${u.nom}` : `User #${b.userId}`
      const borrowedAt = b.borrowedAt ? String(b.borrowedAt).slice(0, 10) : "—"
      const dueDate = b.dueDate ? String(b.dueDate).slice(0, 10) : "—"
      return {
        id: b.id,
        title: b.title || "—",
        borrower,
        borrowedAt,
        dueDate,
      }
    })
  }, [stats, usersById])

  return (
    <div className="p-6 space-y-6">
      {error ? (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Book className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "…" : kpis.totalBooks}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Books in collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Borrows</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "…" : kpis.activeBorrows}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Currently borrowed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "…" : kpis.overdueItems}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
            <Heart className="h-4 w-4 text-pink-600 dark:text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "…" : kpis.pendingReservations}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">In queue</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Books */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Overdue Books</CardTitle>
          <CardDescription>Books not returned on time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overdues.length ? (
              overdues.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Borrowed by: {item.borrower}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">{item.daysOverdue} days</p>
                  <p className="text-xs text-slate-500">overdue</p>
                </div>
              </div>
              ))
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400">No overdue books.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations Status</CardTitle>
          <CardDescription>Current reservation queue and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nextReservations.length ? (
              nextReservations.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.book}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Reserved by: {item.student}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{item.status}</p>
                  <p className="text-xs text-slate-500">Position #{item.position}</p>
                </div>
              </div>
              ))
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400">No ready reservations.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Borrows (All Users) */}
      <Card>
        <CardHeader>
          <CardTitle>Active Borrows</CardTitle>
          <CardDescription>Latest active borrows across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[220px] overflow-y-auto pr-2">
            <div className="space-y-3">
              {borrows.length ? (
                borrows.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">Borrowed by: {item.borrower}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600 dark:text-slate-400">
                      <div>Borrowed: {item.borrowedAt}</div>
                      <div>Due: {item.dueDate}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-400">No active borrows.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
