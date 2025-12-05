"use client"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, BookMarked, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data for borrowed books timeline
const borrowData = [
  { date: "Jan 1", borrowed: 2, reserved: 1 },
  { date: "Jan 8", borrowed: 3, reserved: 2 },
  { date: "Jan 15", borrowed: 5, reserved: 3 },
  { date: "Jan 22", borrowed: 4, reserved: 4 },
  { date: "Jan 29", borrowed: 6, reserved: 3 },
  { date: "Feb 5", borrowed: 7, reserved: 5 },
  { date: "Feb 12", borrowed: 8, reserved: 4 },
]

// Mock data for book categories
const categoryData = [
  { name: "Science", value: 15 },
  { name: "Fiction", value: 12 },
  { name: "History", value: 8 },
  { name: "Self-Help", value: 6 },
  { name: "Others", value: 9 },
]

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

// Mock borrowed books
const borrowedBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    dueDate: "2025-02-15",
    daysLeft: 3,
    status: "active",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    dueDate: "2025-02-20",
    daysLeft: 8,
    status: "active",
  },
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    dueDate: "2025-02-05",
    daysLeft: -2,
    status: "overdue",
  },
]

// Mock overdue books data
const overdueBooks = [
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    dueDate: "2025-02-05",
    daysOverdue: 2,
    isbn: "978-0743273565",
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    dueDate: "2025-01-25",
    daysOverdue: 17,
    isbn: "978-0062316097",
  },
]

// Mock monthly borrowing trends data
const monthlyTrends = [
  { month: "Jan", borrowed: 4, reserved: 2, returned: 3 },
  { month: "Feb", borrowed: 6, reserved: 3, returned: 4 },
  { month: "Mar", borrowed: 8, reserved: 4, returned: 6 },
  { month: "Apr", borrowed: 5, reserved: 2, returned: 5 },
  { month: "May", borrowed: 7, reserved: 5, returned: 6 },
  { month: "Jun", borrowed: 9, reserved: 4, returned: 8 },
]

export default function StudentDashboard() {
  return (
    <div className="p-6 space-y-6">
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
            <p className="text-3xl font-bold text-slate-900 dark:text-white">18</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">This semester</p>
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
            <p className="text-3xl font-bold text-slate-900 dark:text-white">5</p>
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
            <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
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
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{overdueBooks.length}</p>
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
                    <h3 className="font-semibold text-slate-900 dark:text-white">{book.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">by {book.author}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ISBN: {book.isbn}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    {book.daysOverdue} days overdue
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-red-600 dark:text-red-400">Due: {book.dueDate}</span>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">by {book.author}</p>
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
