"use client"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, BookMarked, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { apiMe, apiMyBorrowed, apiReturnEmprunt, apiStudentStats, apiMyReservations } from "@/lib/student"

type DashboardBorrowedBook = {
  id: number
  livreId: number
  dateRetour: string | null
  isOverdue?: boolean
  livre?: { titre: string; imageUrl?: string | null } | null
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

type DashboardStats = {
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

export default function StudentDashboard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meUserId, setMeUserId] = useState<number | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeBorrows, setActiveBorrows] = useState<DashboardBorrowedBook[]>([])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await apiMe()
      const uid = me.user?.id ?? null
      setMeUserId(uid)
      if (!uid) {
        setStats(null)
        setActiveBorrows([])
        return
      }

      const [s, emprunts] = await Promise.all([apiStudentStats(uid), apiMyBorrowed(uid)])
      setStats(s)
      setActiveBorrows((emprunts as any[]) as DashboardBorrowedBook[])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const overdueBooks = useMemo(() => {
    const nowMs = Date.now()
    return activeBorrows.filter((e) => {
      if (typeof e.isOverdue === "boolean") return e.isOverdue
      if (!e.dateRetour) return false
      const dueMs = new Date(e.dateRetour).getTime()
      return Number.isFinite(dueMs) && dueMs < nowMs
    })
  }, [activeBorrows])

  const borrowedBooks = useMemo(() => {
    const nowMs = Date.now()
    return activeBorrows.map((e) => {
      const dueMs = e.dateRetour ? new Date(e.dateRetour).getTime() : NaN
      const daysLeft = Number.isFinite(dueMs) ? Math.ceil((dueMs - nowMs) / (1000 * 60 * 60 * 24)) : 0
      const isOverdue = typeof e.isOverdue === "boolean" ? e.isOverdue : Number.isFinite(dueMs) && dueMs < nowMs
      return {
        id: e.id,
        title: e.livre?.titre ?? `Livre #${e.livreId}`,
        dueDate: e.dateRetour ? new Date(e.dateRetour).toISOString().slice(0, 10) : "—",
        daysLeft,
        status: isOverdue ? "overdue" : "active",
      }
    })
  }, [activeBorrows])

  const monthlyTrends = stats?.monthlyTrends ?? []
  const categoryData = stats?.categoryData ?? []

  const onReturnNow = async (empruntId: number) => {
    setError(null)
    try {
      await apiReturnEmprunt(empruntId)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Return failed")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {!meUserId && !loading && (
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 text-sm">
          Please login to see your dashboard.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Books Borrowed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.counts.borrowedTotal ?? 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Last 6 months</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <BookMarked className="w-4 h-4" />
              Reserved Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.counts.reservedPending ?? 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Waiting in queue</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Currently Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.counts.activeBorrowed ?? 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Currently reading</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Overdue Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats?.counts.overdue ?? overdueBooks.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Return soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart - Monthly Trends */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Borrowing Trends
            </CardTitle>
            <CardDescription>Your borrowing activity over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="borrowed" fill="hsl(var(--chart-1))" name="Borrowed" />
                <Bar dataKey="reserved" fill="hsl(var(--chart-2))" name="Reserved" />
                <Bar dataKey="returned" fill="hsl(var(--chart-3))" name="Returned" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Books by Category</CardTitle>
            <CardDescription>Distribution of books read</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Books */}
      {overdueBooks.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-red-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              Overdue Books - Action Required
            </CardTitle>
            <CardDescription>Please return these books as soon as possible to avoid penalties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{book.livre?.titre ?? `Livre #${book.livreId}`}</h3>
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    Overdue
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-red-600 dark:text-red-400">Due: {book.dateRetour ? new Date(book.dateRetour).toISOString().slice(0, 10) : "—"}</span>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => void onReturnNow(book.id)}>
                    Return Now
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Currently Reading */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Currently Reading</CardTitle>
          <CardDescription>Books you have borrowed with due dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {borrowedBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{book.title}</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                      book.status === "overdue"
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    {book.status === "overdue"
                      ? `${Math.abs(book.daysLeft)} days overdue`
                      : `${book.daysLeft} days left`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Due: {book.dueDate}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
