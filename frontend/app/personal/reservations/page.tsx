"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function ReservationsPage() {
  const reservations = [
    {
      id: 1,
      bookTitle: "The Hobbit",
      isbn: "9780547928227",
      reservedBy: "Alice Brown",
      reservedDate: "2025-01-20",
      status: "Ready for Pickup",
      position: 1,
      waitingTime: "0 days",
    },
    {
      id: 2,
      bookTitle: "Dune",
      isbn: "9780143111597",
      reservedBy: "Bob Wilson",
      reservedDate: "2025-01-19",
      status: "In Queue",
      position: 2,
      waitingTime: "~3 days",
    },
    {
      id: 3,
      bookTitle: "Foundation",
      isbn: "9780553293357",
      reservedBy: "Carol Davis",
      reservedDate: "2025-01-18",
      status: "In Queue",
      position: 3,
      waitingTime: "~7 days",
    },
    {
      id: 4,
      bookTitle: "Neuromancer",
      isbn: "9780441569595",
      reservedBy: "David Lee",
      reservedDate: "2025-01-17",
      status: "In Queue",
      position: 4,
      waitingTime: "~10 days",
    },
  ]

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
              {reservations.filter((r) => r.status === "Ready for Pickup").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">
              {reservations.filter((r) => r.status === "In Queue").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{reservations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Book & Reservation Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Book Title</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{reservation.bookTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">ISBN</p>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{reservation.isbn}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Reserved Date</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{reservation.reservedDate}</p>
                  </div>
                </div>

                {/* Student & Status Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Reserved by</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{reservation.reservedBy}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Position in Queue</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">#{reservation.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(reservation.status)}
                        <span
                          className={`px-3 py-1 mt-2 rounded-full text-sm font-semibold ${getStatusColor(reservation.status)}`}
                        >
                          {reservation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status-specific Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                {reservation.status === "Ready for Pickup" && (
                  <>
                    <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Checkout Book
                    </Button>
                    <Button variant="outline" size="sm">
                      Cancel Reservation
                    </Button>
                  </>
                )}
                {reservation.status === "In Queue" && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Estimated wait: {reservation.waitingTime}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Cancel Reservation
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
