"use client"

import { useEffect, useMemo, useState } from "react"
import { apiMe, apiMyBorrowed, apiRenewEmprunt, apiReturnEmprunt } from "@/lib/student"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import { ListPagination, PAGE_SIZE } from "@/components/list-pagination"

type Emprunt = {
  id: number
  userId: number
  livreId: number
  dateEmprunt: string
  dateRetour: string | null
  returnedAt?: string | null
  renouvellement?: number
  isOverdue?: boolean
  createdAt: string
  livre?: {
    id: number
    titre: string
    isbn: string
    imageUrl?: string | null
  } | null
}

const API_BASE = "/api"

export default function BorrowedPage() {
  const [meUserId, setMeUserId] = useState<number | null>(null)
  const [items, setItems] = useState<Emprunt[]>([])
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [draftReturnDateById, setDraftReturnDateById] = useState<Record<number, string>>({})
  const [activePage, setActivePage] = useState(1)
  const [overduePage, setOverduePage] = useState(1)

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
      const data = (await apiMyBorrowed(uid)) as Emprunt[]
      setItems(data)

      setDraftReturnDateById((prev) => {
        const next = { ...prev }
        for (const e of data) {
          if (e.dateRetour && !next[e.id]) {
            next[e.id] = new Date(e.dateRetour).toISOString().slice(0, 10)
          }
        }
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load borrowed books")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const activeBorrowed = useMemo(() => items.filter((e) => !e.returnedAt), [items])
  const overdue = useMemo(() => {
    const nowMs = Date.now()
    return activeBorrowed.filter((e) => {
      if (typeof e.isOverdue === "boolean") return e.isOverdue
      if (!e.dateRetour) return false
      const dueMs = new Date(e.dateRetour).getTime()
      return Number.isFinite(dueMs) && dueMs < nowMs
    })
  }, [activeBorrowed])

  const activeTotalPages = Math.max(1, Math.ceil(activeBorrowed.length / PAGE_SIZE))
  const paginatedActiveBorrowed = activeBorrowed.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE)

  const overdueTotalPages = Math.max(1, Math.ceil(overdue.length / PAGE_SIZE))
  const paginatedOverdue = overdue.slice((overduePage - 1) * PAGE_SIZE, overduePage * PAGE_SIZE)

  const onReturn = async (empruntId: number) => {
    setActingId(empruntId)
    setError(null)
    try {
      await apiReturnEmprunt(empruntId)
      setMessage("Book returned.")
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Return failed")
    } finally {
      setActingId(null)
      setTimeout(() => setMessage(null), 2500)
    }
  }

  const maxDaysForRenewalIndex = (renouvellement: number) => {
    // rules from user: initial 15 days, 2nd renew 10, 3rd renew 5
    if (renouvellement === 0) return 15
    if (renouvellement === 1) return 10
    if (renouvellement === 2) return 5
    return 0
  }

  const clientValidateReturnDate = (emprunt: Emprunt, dateStr: string): string | null => {
    if (!dateStr) return "Choose a return date"
    const chosen = new Date(`${dateStr}T00:00:00`)
    const currentDue = emprunt.dateRetour ? new Date(emprunt.dateRetour) : null
    if (Number.isNaN(chosen.getTime())) return "Invalid date"
    if (!currentDue || Number.isNaN(currentDue.getTime())) return "Current due date missing"
    if (chosen.getTime() <= currentDue.getTime()) return "New due date must be after current due date"

    const renewCount = emprunt.renouvellement ?? 0
    if (renewCount >= 3) return "No more renewals allowed"
    const maxDays = maxDaysForRenewalIndex(renewCount)
    if (maxDays <= 0) return "No more renewals allowed"
    const diffDays = (chosen.getTime() - currentDue.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays > maxDays + 1e-9) return `Max +${maxDays} days from current due date`
    return null
  }

  const onRenew = async (emprunt: Emprunt) => {
    const dateStr = draftReturnDateById[emprunt.id] || ""
    const err = clientValidateReturnDate(emprunt, dateStr)
    if (err) {
      setError(err)
      return
    }

    setActingId(emprunt.id)
    setError(null)
    try {
      // Send ISO date to backend
      const iso = new Date(`${dateStr}T00:00:00.000Z`).toISOString()
      await apiRenewEmprunt(emprunt.id, iso)
      setMessage("Renewed.")
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Renew failed")
    } finally {
      setActingId(null)
      setTimeout(() => setMessage(null), 2500)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Borrowed Books</h1>
        <p className="text-slate-600 dark:text-slate-400">Track all your borrowed books and manage renewals</p>
      </div>

      {!meUserId && !loading && (
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 text-sm">
          Please login to see your borrowed books.
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

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Borrows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeBorrowed.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{overdue.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{items.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Borrowed Books */}
      {activeBorrowed.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
              Active Borrows
            </CardTitle>
            <CardDescription>Books you currently have borrowed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paginatedActiveBorrowed.map((emprunt) => (
              
              <div
                key={emprunt.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-14 h-20 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
                      {emprunt.livre?.imageUrl ? (
                        <img
                          src={emprunt.livre.imageUrl.startsWith("http") ? emprunt.livre.imageUrl : `${API_BASE}${emprunt.livre.imageUrl}`}
                          alt={emprunt.livre?.titre || "Book"}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {emprunt.livre?.titre || `Livre #${emprunt.livreId}`}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{emprunt.livre?.isbn || ""}</p>
                    </div>
                  </div>
                  {overdue.some((x) => x.id === emprunt.id) ? (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Overdue</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Borrowed</span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {new Date(emprunt.dateEmprunt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Emprunt ID</span>
                    <p className="font-medium text-slate-900 dark:text-white">#{emprunt.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Book</span>
                    <p className="font-medium text-slate-900 dark:text-white">#{emprunt.livreId}</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingId === emprunt.id}
                      onClick={() => void onReturn(emprunt.id)}
                    >
                      Return
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">ISBN</span>
                    <p className="font-medium text-slate-900 dark:text-white font-mono">{emprunt.livre?.isbn || "—"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Due date</span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {emprunt.dateRetour ? new Date(emprunt.dateRetour).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Created</span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {emprunt.createdAt ? new Date(emprunt.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-500 dark:text-slate-500 mb-1">Choose new return date</label>
                    <input
                      type="date"
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm"
                      value={draftReturnDateById[emprunt.id] || ""}
                      onChange={(e) => setDraftReturnDateById((p) => ({ ...p, [emprunt.id]: e.target.value }))}
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      Renewals used: {emprunt.renouvellement ?? 0}/3 · Max extension: +{maxDaysForRenewalIndex(emprunt.renouvellement ?? 0)} days
                    </p>
                  </div>
                  <div className="flex md:justify-end">
                    <Button
                      size="sm"
                      disabled={actingId === emprunt.id || (emprunt.renouvellement ?? 0) >= 3}
                      onClick={() => void onRenew(emprunt)}
                    >
                      Renew
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <ListPagination page={activePage} totalPages={activeTotalPages} onPageChange={setActivePage} />
          </CardContent>
        </Card>
      )}

      {/* Overdue Books */}
      {overdue.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
              Overdue
            </CardTitle>
            <CardDescription>Books past their due date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paginatedOverdue.map((emprunt) => (
              <div
                key={emprunt.id}
                className="p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {emprunt.livre?.titre || `Livre #${emprunt.livreId}`}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{emprunt.livre?.isbn || ""}</p>
                    <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                      Due: {emprunt.dateRetour ? new Date(emprunt.dateRetour).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" disabled={actingId === emprunt.id} onClick={() => void onReturn(emprunt.id)}>
                    Return
                  </Button>
                </div>
              </div>
            ))}
            <ListPagination page={overduePage} totalPages={overdueTotalPages} onPageChange={setOverduePage} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
