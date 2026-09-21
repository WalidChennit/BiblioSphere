"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book } from "lucide-react"
import { ListPagination, PAGE_SIZE } from "@/components/list-pagination"

type Livre = {
  id: number
  titre: string
  isbn: string
  imageUrl?: string | null
  category?: { id: number; name: string } | null
  editor?: { id: number; name: string } | null
  authors?: Array<{ id: number; nom: string; prenom: string }> | null
  stockDisponible?: number
  stockTotal?: number
}

const API_BASE = "/api"

export default function PersonalBooksPage() {
  const [books, setBooks] = useState<Livre[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/livres`, { cache: "no-store" })
      if (!res.ok) throw new Error(await res.text())
      setBooks((await res.json()) as Livre[])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE))
  const paginatedBooks = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Books</h1>
          <p className="text-slate-600 dark:text-slate-400">All books in collection</p>
        </div>
        <Button onClick={load} variant="outline">
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">{error}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Books</CardTitle>
          <CardDescription>{loading ? "Loading..." : `${books.length} book(s)`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedBooks.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950"
              >
                <div className="flex gap-3">
                  {b.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${API_BASE}${b.imageUrl}`}
                      alt={b.titre}
                      className="w-16 h-24 object-cover rounded border border-slate-200 dark:border-slate-800"
                    />
                  ) : (
                    <div className="w-16 h-24 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      <Book className="w-5 h-5 text-slate-400" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{b.titre}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{b.isbn}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {b.authors?.length
                        ? b.authors.map((a) => `${a.prenom} ${a.nom}`).join(", ")
                        : "—"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {b.category?.name || "Uncategorized"} • {b.editor?.name || "No editor"}
                    </div>
                    {typeof b.stockDisponible === "number" && typeof b.stockTotal === "number" ? (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Stock: {b.stockDisponible}/{b.stockTotal}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  )
}
