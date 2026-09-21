"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"
import { ListPagination, PAGE_SIZE } from "@/components/list-pagination"

type Category = { id: number; name: string }

type Editor = { id: number; name: string }

type Author = { id: number; nom: string; prenom: string }

type Book = {
  id: number
  titre: string
  isbn: string
  langue: string
  anneePublication: number
  description?: string | null
  imageUrl?: string | null
  category?: { id: number; name: string } | null
  editor?: { id: number; name: string } | null
  auteurs?: Array<{ author?: Author | null }>
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as any
    if (typeof data?.message === "string") return data.message
    if (Array.isArray(data?.message)) return data.message.join("\n")
    if (typeof data?.error === "string") return data.error
  } catch {
    // ignore
  }
  try {
    return await res.text()
  } catch {
    return "Request failed"
  }
}

export default function AdminCataloguePage() {
  const [tab, setTab] = useState<"categories" | "books">("books")

  const [categories, setCategories] = useState<Category[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [newCategoryName, setNewCategoryName] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)

  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null)
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null)

  const [categorySearch, setCategorySearch] = useState("")

  // Filters
  const [filterCategoryId, setFilterCategoryId] = useState<string>("")
  const [filterLang, setFilterLang] = useState("")
  const [filterIsbn, setFilterIsbn] = useState("")
  const [filterAuthor, setFilterAuthor] = useState("")
  const [filterEditor, setFilterEditor] = useState("")

  const [categoryPage, setCategoryPage] = useState(1)
  const [bookPage, setBookPage] = useState(1)

  const loadAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [catsRes, booksRes] = await Promise.all([apiFetch(`/categories`), apiFetch(`/livres`)])
      if (!catsRes.ok) throw new Error((await parseErrorMessage(catsRes)) || "Failed to load categories")
      if (!booksRes.ok) throw new Error((await parseErrorMessage(booksRes)) || "Failed to load books")

      const cats = (await catsRes.json()) as Category[]
      const bs = (await booksRes.json()) as Book[]
      setCategories(Array.isArray(cats) ? cats : [])
      setBooks(Array.isArray(bs) ? bs : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  const createCategory = async () => {
    setError("")
    const name = newCategoryName.trim()
    if (!name) return

    setCreatingCategory(true)
    try {
      const res = await apiFetch(`/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error((await parseErrorMessage(res)) || "Failed to create category")
      setNewCategoryName("")
      await loadAll()
      setTab("categories")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create category")
    } finally {
      setCreatingCategory(false)
    }
  }

  const deleteCategory = async (id: number) => {
    setError("")
    if (!confirm("Delete this category?")) return

    setDeletingCategoryId(id)
    try {
      const res = await apiFetch(`/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await parseErrorMessage(res)) || "Failed to delete category")
      await loadAll()
      setTab("categories")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete category")
    } finally {
      setDeletingCategoryId(null)
    }
  }

  const deleteBook = async (id: number) => {
    setError("")
    if (!confirm("Delete this book?")) return

    setDeletingBookId(id)
    try {
      const res = await apiFetch(`/livres/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await parseErrorMessage(res)) || "Failed to delete book")
      await loadAll()
      setTab("books")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete book")
    } finally {
      setDeletingBookId(null)
    }
  }

  const filteredBooks = useMemo(() => {
    const catId = filterCategoryId ? Number(filterCategoryId) : null
    const lang = filterLang.trim().toLowerCase()
    const isbn = filterIsbn.trim().toLowerCase()
    const authorQ = filterAuthor.trim().toLowerCase()
    const editorQ = filterEditor.trim().toLowerCase()

    return books.filter((b) => {
      if (catId && b.category?.id !== catId) return false
      if (lang && (b.langue || "").toLowerCase() !== lang) return false
      if (isbn && !(b.isbn || "").toLowerCase().includes(isbn)) return false

      if (authorQ) {
        const authors = (b.auteurs || []).map((x) => `${x.author?.prenom || ""} ${x.author?.nom || ""}`.toLowerCase())
        if (!authors.some((n) => n.includes(authorQ))) return false
      }

      if (editorQ) {
        const edName = (b.editor?.name || "").toLowerCase()
        if (!edName.includes(editorQ)) return false
      }

      return true
    })
  }, [books, filterAuthor, filterCategoryId, filterEditor, filterIsbn, filterLang])

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => (c.name || "").toLowerCase().includes(q))
  }, [categories, categorySearch])

  useEffect(() => {
    setBookPage(1)
  }, [filterAuthor, filterCategoryId, filterEditor, filterIsbn, filterLang])

  useEffect(() => {
    setCategoryPage(1)
  }, [categorySearch])

  const bookTotalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE))
  const paginatedBooks = filteredBooks.slice((bookPage - 1) * PAGE_SIZE, bookPage * PAGE_SIZE)

  const categoryTotalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE))
  const paginatedCategories = filteredCategories.slice((categoryPage - 1) * PAGE_SIZE, categoryPage * PAGE_SIZE)

  return (
    <div className="p-6 space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Catalogue</CardTitle>
          <CardDescription>Categories + Books (with filters)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant={tab === "books" ? "default" : "outline"} onClick={() => setTab("books")}>
              Books
            </Button>
            <Button variant={tab === "categories" ? "default" : "outline"} onClick={() => setTab("categories")}>
              Categories
            </Button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          {tab === "categories" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="space-y-1 md:col-span-2">
                  <Label>New category</Label>
                  <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Science" />
                </div>
                <Button disabled={creatingCategory} onClick={() => void createCategory()} className="bg-amber-600 hover:bg-amber-700">
                  {creatingCategory ? "Creating..." : "Add category"}
                </Button>
              </div>

              <div className="max-w-md">
                <Input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories..."
                  className="bg-white dark:bg-slate-950"
                />
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-3 px-4 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-right py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="py-6 px-4 text-slate-500">Loading...</td>
                      </tr>
                    ) : (
                      paginatedCategories.map((c) => (
                        <tr key={c.id} className="border-b border-slate-200 dark:border-slate-800">
                          <td className="py-3 px-4">{c.id}</td>
                          <td className="py-3 px-4 font-medium">{c.name}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={deletingCategoryId === c.id}
                              onClick={() => void deleteCategory(c.id)}
                            >
                              {deletingCategoryId === c.id ? "Deleting..." : "Delete"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <ListPagination page={categoryPage} totalPages={categoryTotalPages} onPageChange={setCategoryPage} />
            </div>
          )}

          {tab === "books" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <select
                    className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm"
                    value={filterCategoryId}
                    onChange={(e) => setFilterCategoryId(e.target.value)}
                  >
                    <option value="">All</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label>Language</Label>
                  <Input value={filterLang} onChange={(e) => setFilterLang(e.target.value)} placeholder="fr / en / ar" />
                </div>

                <div className="space-y-1">
                  <Label>ISBN</Label>
                  <Input value={filterIsbn} onChange={(e) => setFilterIsbn(e.target.value)} placeholder="Search ISBN" />
                </div>

                <div className="space-y-1">
                  <Label>Author</Label>
                  <Input value={filterAuthor} onChange={(e) => setFilterAuthor(e.target.value)} placeholder="Name" />
                </div>

                <div className="space-y-1">
                  <Label>Editor</Label>
                  <Input value={filterEditor} onChange={(e) => setFilterEditor(e.target.value)} placeholder="Name" />
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="text-left py-3 px-4 font-semibold">Title</th>
                        <th className="text-left py-3 px-4 font-semibold">ISBN</th>
                        <th className="text-left py-3 px-4 font-semibold">Lang</th>
                        <th className="text-left py-3 px-4 font-semibold">Category</th>
                        <th className="text-left py-3 px-4 font-semibold">Editor</th>
                        <th className="text-left py-3 px-4 font-semibold">Authors</th>
                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="py-6 px-4 text-slate-500">Loading...</td>
                        </tr>
                      ) : (
                        paginatedBooks.map((b) => (
                          <tr key={b.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                            <td className="py-3 px-4 font-medium">{b.titre}</td>
                            <td className="py-3 px-4">{b.isbn}</td>
                            <td className="py-3 px-4">{b.langue}</td>
                            <td className="py-3 px-4">{b.category?.name || "—"}</td>
                            <td className="py-3 px-4">{b.editor?.name || "—"}</td>
                            <td className="py-3 px-4">
                              {(b.auteurs || [])
                                .map((x) => `${x.author?.prenom || ""} ${x.author?.nom || ""}`.trim())
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                                disabled={deletingBookId === b.id}
                                onClick={() => void deleteBook(b.id)}
                              >
                                {deletingBookId === b.id ? "Deleting..." : "Delete"}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <ListPagination page={bookPage} totalPages={bookTotalPages} onPageChange={setBookPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
