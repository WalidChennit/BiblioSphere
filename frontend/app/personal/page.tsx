"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Book, BookOpen, Heart } from "lucide-react"

export default function PersonalDashboard() {
  // Mock overdues data
  const overdues = [
    { id: 1, title: "The Great Gatsby", borrower: "John Doe", daysOverdue: 5 },
    { id: 2, title: "To Kill a Mockingbird", borrower: "Jane Smith", daysOverdue: 12 },
    { id: 3, title: "1984", borrower: "Mike Johnson", daysOverdue: 8 },
  ]

  // Mock reservation data
  const nextReservations = [
    { id: 1, book: "The Hobbit", student: "Alice Brown", position: 1, status: "Ready for Pickup" },
    { id: 2, book: "Dune", student: "Bob Wilson", position: 2, status: "In Queue" },
    { id: 3, book: "Foundation", student: "Carol Davis", position: 3, status: "In Queue" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Book className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,840</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Books in collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Borrows</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Currently borrowed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
            <Heart className="h-4 w-4 text-pink-600 dark:text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
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
            {overdues.map((item) => (
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
            ))}
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
            {nextReservations.map((item) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
