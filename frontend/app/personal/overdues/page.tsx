"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, Phone } from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function OverduesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [overdues, setOverdues] = useState<any[]>([])
  const [usersById, setUsersById] = useState<Map<number, any>>(new Map())
  const [actingId, setActingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const [resUsers, resEmprunts] = await Promise.all([
        apiFetch("/users", { cache: "no-store" }),
        apiFetch("/emprunts", { cache: "no-store" }),
      ])

      if (!resUsers.ok) throw new Error(await resUsers.text())
      if (!resEmprunts.ok) throw new Error(await resEmprunts.text())

      const users = (await resUsers.json()) as any[]
      const map = new Map<number, any>()
      for (const u of users) map.set(u.id, u)
      setUsersById(map)

      const emprunts = (await resEmprunts.json()) as any[]
      const now = Date.now()
      const overdue = (Array.isArray(emprunts) ? emprunts : []).filter((e) => {
        if (e?.returnedAt) return false
        const due = e?.dateRetour ? new Date(e.dateRetour).getTime() : NaN
        return Number.isFinite(due) && due < now
      })
      setOverdues(overdue)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const overdueCount = overdues.length

  const markReturned = async (empruntId: number) => {
    try {
      setActingId(empruntId)
      const res = await apiFetch(`/emprunts/${empruntId}/return`, { method: "PATCH" })
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark returned")
    } finally {
      setActingId(null)
    }
  }

  const formatDate = (value: any) => {
    if (!value) return "—"
    try {
      return new Date(value).toISOString().slice(0, 10)
    } catch {
      return String(value)
    }
  }

  const daysOverdue = (due: any) => {
    const ms = new Date().getTime() - new Date(due).getTime()
    if (!Number.isFinite(ms)) return null
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
  }

  const items = useMemo(() => {
    return overdues.map((e) => {
      const user = usersById.get(e.userId)
      return {
        id: e.id,
        bookTitle: e.livre?.titre || "—",
        bookISBN: e.livre?.isbn || "—",
        borrower: user ? `${user.prenom} ${user.nom}` : `User #${e.userId}`,
        borrowerEmail: user?.email || "—",
        borrowerPhone: user?.telephone || "—",
        dueDate: formatDate(e.dateRetour),
        daysOverdue: e.dateRetour ? daysOverdue(e.dateRetour) : null,
      }
    })
  }, [overdues, usersById])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
          Overdue Books
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Manage overdue items and contact borrowers</p>
      </div>

      {/* Summary Card */}
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400">Critical Alert</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `You have ${overdueCount} overdue books requiring immediate action`}
          </CardDescription>
        </CardHeader>
      </Card>

      {error ? (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      ) : null}

      {/* Overdues List */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Book Info */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Book</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{item.bookTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">ISBN</p>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{item.bookISBN}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Due Date</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{item.dueDate}</p>
                  </div>
                </div>

                {/* Borrower & Status Info */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Borrower</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{item.borrower}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Email</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{item.borrowerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Phone</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{item.borrowerPhone}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-sm font-semibold">
                      {typeof item.daysOverdue === "number" ? `${item.daysOverdue} days overdue` : "Overdue"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button className="gap-2" size="sm">
                  <Mail className="w-4 h-4" />
                  Send Email Reminder
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Phone className="w-4 h-4" />
                  Call Borrower
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actingId === item.id}
                  onClick={() => void markReturned(item.id)}
                >
                  Mark as Returned
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
