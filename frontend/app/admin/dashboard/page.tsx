"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { BookOpen, BookMarked, LogOut, Settings, TrendingUp, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"
import { ClientOnly } from "@/components/ClientOnly"
import { apiMe } from "@/lib/student"

type AdminStatsResponse = {
  kpis: {
    totalUsers: number
    totalBooks: number
    activeLoans: number
    overdue: number
  }
  kpiDeltas?: {
    totalUsersPct: number | null
    totalUsersLabel: string
    totalBooksPct: number | null
    totalBooksLabel: string
  }
  dashboardData: Array<{ month: string; users: number; books: number }>
  period?: string
  generatedAt: number
}

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 6 months")
  const [stats, setStats] = useState<AdminStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>("")

  useEffect(() => {
    let cancelled = false

    const periodParam =
      selectedPeriod === "Last year" ? "lastyear" : selectedPeriod === "All time" ? "alltime" : "last6months"

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [me, res] = await Promise.all([
          apiMe(),
          apiFetch(`/admin/stats?period=${encodeURIComponent(periodParam)}`, { cache: "no-store" }),
        ])
        const data = (await res.json()) as AdminStatsResponse
        if (cancelled) return

        if (me.user?.id) {
          try {
            const usersRes = await apiFetch("/users", { cache: "no-store" })
            if (usersRes.ok) {
              const users = (await usersRes.json()) as any[]
              const full = users.find((u) => u.id === me.user!.id)
              const name = full ? `${full.prenom ?? ""} ${full.nom ?? ""}`.trim() : ""
              setDisplayName(name)
            }
          } catch {
            // ignore
          }
        }

        setStats(data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load dashboard stats")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedPeriod])

  const dashboardData = useMemo(() => stats?.dashboardData ?? [], [stats])
  const kpis = stats?.kpis
  const deltas = stats?.kpiDeltas

  const renderPct = (v: number | null | undefined) => {
    if (v === null) return null
    if (typeof v !== "number" || Number.isNaN(v)) return null
    const sign = v > 0 ? "+" : ""
    return `${sign}${v}%`
  }

  const logout = async () => {
    try {
      await apiFetch(`/auth/logout`, { method: "POST" })
    } catch {
      // ignore
    }
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {displayName ? `Welcome, ${displayName}` : "Dashboard"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Library overview and analytics</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 pr-8 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>All time</option>
              </select>
              <TrendingUp className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? "…" : (kpis?.totalUsers ?? 0)}</div>
              {renderPct(deltas?.totalUsersPct) ? (
                <p
                  className={`text-xs mt-1 ${
                    (deltas?.totalUsersPct ?? 0) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {renderPct(deltas?.totalUsersPct)} {deltas?.totalUsersLabel || ""}
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All time</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? "…" : (kpis?.totalBooks ?? 0)}</div>
              {renderPct(deltas?.totalBooksPct) ? (
                <p
                  className={`text-xs mt-1 ${
                    (deltas?.totalBooksPct ?? 0) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {renderPct(deltas?.totalBooksPct)} {deltas?.totalBooksLabel || ""}
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All time</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Loans</CardTitle>
              <BookMarked className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? "…" : (kpis?.activeLoans ?? 0)}</div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">-3% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Overdue</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? "…" : (kpis?.overdue ?? 0)}</div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Users Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 min-h-[320px] min-w-0">
                <ClientOnly>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#d97706" strokeWidth={3} dot={{ fill: "#d97706" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ClientOnly>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Books Added</CardTitle>
              <CardDescription>New books added to catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 min-h-[320px] min-w-0">
                <ClientOnly>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="books" fill="#d97706" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ClientOnly>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
