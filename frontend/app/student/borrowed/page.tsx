"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"

// Mock borrowed books data
const borrowedBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    borrowDate: "2025-01-15",
    dueDate: "2025-02-15",
    daysLeft: 3,
    status: "active",
    renewals: 1,
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    borrowDate: "2025-01-22",
    dueDate: "2025-02-20",
    daysLeft: 8,
    status: "active",
    renewals: 0,
  },
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    borrowDate: "2024-12-05",
    dueDate: "2025-02-05",
    daysLeft: -2,
    status: "overdue",
    renewals: 2,
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    borrowDate: "2024-12-10",
    dueDate: "2025-01-25",
    daysLeft: -17,
    status: "overdue",
    renewals: 1,
  },
  {
    id: 5,
    title: "1984",
    author: "George Orwell",
    borrowDate: "2025-02-01",
    dueDate: "2025-03-01",
    daysLeft: 22,
    status: "active",
    renewals: 0,
  },
]

export default function BorrowedPage() {
  const activeBorrowed = borrowedBooks.filter((b) => b.status === "active")
  const overdue = borrowedBooks.filter((b) => b.status === "overdue")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Borrowed Books</h1>
        <p className="text-slate-600 dark:text-slate-400">Track all your borrowed books and manage renewals</p>
      </div>

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
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{borrowedBooks.length}</p>
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
            {activeBorrowed.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{book.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">by {book.author}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {book.daysLeft} days left
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Borrowed</span>
                    <p className="font-medium text-slate-900 dark:text-white">{book.borrowDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Due Date</span>
                    <p className="font-medium text-slate-900 dark:text-white">{book.dueDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Renewals</span>
                    <p className="font-medium text-slate-900 dark:text-white">{book.renewals}/3</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      Renew
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Overdue Books */}
      {overdue.length > 0 && (
        <Card className="border-0 shadow-sm border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              Overdue Books
            </CardTitle>
            <CardDescription>Please return these books as soon as possible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdue.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{book.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">by {book.author}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    {Math.abs(book.daysLeft)} days overdue
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Borrowed</span>
                    <p className="font-medium text-slate-900 dark:text-white">{book.borrowDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Due Date</span>
                    <p className="font-medium text-red-600 dark:text-red-400 font-bold">{book.dueDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500">Renewals</span>
                    <p className="font-medium text-slate-900 dark:text-white">{book.renewals}/3</p>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Return Now
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
