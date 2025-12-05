"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, X } from "lucide-react"

// Mock reserved books data
const reservedBooks = [
  {
    id: 1,
    title: "Educated",
    author: "Tara Westover",
    reservationDate: "2025-01-20",
    queuePosition: 1,
    estimatedWait: "2 weeks",
    status: "next-in-queue",
  },
  {
    id: 2,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    reservationDate: "2025-02-01",
    queuePosition: 3,
    estimatedWait: "4-5 weeks",
    status: "waiting",
  },
  {
    id: 3,
    title: "Dune",
    author: "Frank Herbert",
    reservationDate: "2025-02-05",
    queuePosition: 2,
    estimatedWait: "3 weeks",
    status: "waiting",
  },
  {
    id: 4,
    title: "Project Hail Mary",
    author: "Andy Weir",
    reservationDate: "2025-01-10",
    queuePosition: 1,
    estimatedWait: "1 week",
    status: "ready",
  },
]

const readyBooks = reservedBooks.filter((b) => b.status === "ready")
const waitingBooks = reservedBooks.filter((b) => b.status !== "ready")

export default function ReservationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Reservations</h1>
        <p className="text-slate-600 dark:text-slate-400">Track reserved books and queue positions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Ready for Pickup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">{readyBooks.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{reservedBooks.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ready for Pickup */}
      {readyBooks.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-500" />
              Ready for Pickup
            </CardTitle>
            <CardDescription>These books are available and waiting for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {readyBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{book.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">by {book.author}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Ready Now</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Reserved</span>
                    <p className="font-medium text-slate-900 dark:text-white">{book.reservationDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Queue Position</span>
                    <p className="font-medium text-slate-900 dark:text-white">#{book.queuePosition}</p>
                  </div>
                  <div></div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Pick Up
                    </Button>
                    <Button size="sm" variant="outline">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Waiting in Queue */}
      {waitingBooks.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Waiting in Queue
            </CardTitle>
            <CardDescription>Your position in the reservation queue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {waitingBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{book.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">by {book.author}</p>
                  </div>
                  <Badge variant="secondary">#{book.queuePosition} in queue</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Reserved</span>
                    <p className="font-medium text-slate-900 dark:text-white">{book.reservationDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Est. Wait</span>
                    <p className="font-medium text-slate-900 dark:text-white">{book.estimatedWait}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Position</span>
                    <p className="font-medium text-slate-900 dark:text-white">#{book.queuePosition}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => alert("Reservation cancelled")}>
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
