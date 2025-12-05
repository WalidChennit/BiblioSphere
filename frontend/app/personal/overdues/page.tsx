"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, Phone } from "lucide-react"

export default function OverduesPage() {
  const overdues = [
    {
      id: 1,
      bookTitle: "The Great Gatsby",
      bookStatus: "Overdue",
      borrower: "John Doe",
      borrowerEmail: "john@example.com",
      borrowerPhone: "+1-234-567-8900",
      dueDate: "2025-01-10",
      daysOverdue: 14,
      bookISBN: "9780743273565",
    },
    {
      id: 2,
      bookTitle: "To Kill a Mockingbird",
      bookStatus: "Overdue",
      borrower: "Jane Smith",
      borrowerEmail: "jane@example.com",
      borrowerPhone: "+1-234-567-8901",
      dueDate: "2025-01-15",
      daysOverdue: 9,
      bookISBN: "9780061120084",
    },
    {
      id: 3,
      bookTitle: "1984",
      bookStatus: "Overdue",
      borrower: "Mike Johnson",
      borrowerEmail: "mike@example.com",
      borrowerPhone: "+1-234-567-8902",
      dueDate: "2025-01-18",
      daysOverdue: 6,
      bookISBN: "9780451524935",
    },
    {
      id: 4,
      bookTitle: "Pride and Prejudice",
      bookStatus: "Overdue",
      borrower: "Alice Brown",
      borrowerEmail: "alice@example.com",
      borrowerPhone: "+1-234-567-8903",
      dueDate: "2025-01-20",
      daysOverdue: 4,
      bookISBN: "9780141439518",
    },
  ]

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
          <CardDescription>You have {overdues.length} overdue books requiring immediate action</CardDescription>
        </CardHeader>
      </Card>

      {/* Overdues List */}
      <div className="space-y-4">
        {overdues.map((item) => (
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
                      {item.daysOverdue} days overdue
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
                <Button variant="outline" size="sm">
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
