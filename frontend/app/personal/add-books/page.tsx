"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Book } from "lucide-react"

export default function AddBooksPage() {
  const [books, setBooks] = useState([
    {
      id: 1,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      isbn: "9781250301697",
      category: "Mystery",
      addedDate: "2025-01-15",
    },
    {
      id: 2,
      title: "Atomic Habits",
      author: "James Clear",
      isbn: "9780735211292",
      category: "Self-Help",
      addedDate: "2025-01-14",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddBook = () => {
    if (formData.title && formData.author && formData.isbn) {
      setBooks([
        ...books,
        {
          id: books.length + 1,
          ...formData,
          addedDate: new Date().toISOString().split("T")[0],
        },
      ])
      setFormData({ title: "", author: "", isbn: "", category: "" })
      setShowForm(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Add Books</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage library collection</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Book
        </Button>
      </div>

      {/* Add Book Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Book Entry</CardTitle>
            <CardDescription>Add a new book to the library collection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Book Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter book title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    name="author"
                    placeholder="Enter author name"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="isbn">ISBN *</Label>
                  <Input
                    id="isbn"
                    name="isbn"
                    placeholder="Enter ISBN"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="Enter category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddBook} className="bg-amber-600 hover:bg-amber-700">
                  Add Book
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Added Books</CardTitle>
          <CardDescription>Books added to the collection ({books.length})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Author</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">ISBN</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Date Added</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr
                    key={book.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Book className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        {book.title}
                      </div>
                    </td>
                    <td className="py-3 px-4">{book.author}</td>
                    <td className="py-3 px-4 font-mono text-xs">{book.isbn}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded text-xs font-medium">
                        {book.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{book.addedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
