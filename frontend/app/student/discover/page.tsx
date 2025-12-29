"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Filter, X, Heart, BookMarked, Eye, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiBorrow, apiCancelReservation, apiMe, apiMyBorrowed, apiMyReservations, apiReserve } from "@/lib/student"

type ApiCategory = { id: number; name: string }
type ApiEditor = { id: number; name: string }
type ApiAuthor = { id: number; nom: string; prenom: string }

type ApiLivre = {
  id: number
  titre: string
  isbn: string
  description?: string | null
  langue?: string | null
  anneePublication?: number | null
  imageUrl?: string | null
  category?: ApiCategory | null
  editor?: ApiEditor | null
  auteurs?: Array<{ author: ApiAuthor }> | null
}

type UiBook = {
  id: number
  titre: string
  isbn: string
  description?: string | null
  langue?: string | null
  anneePublication?: number | null
  imageUrl?: string | null
  categoryName?: string | null
  editorName?: string | null
  authorsLabel: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001"

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    credentials: "include",
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as T
}

function normalizeUiBook(b: ApiLivre): UiBook {
  const authors = (b.auteurs || [])
    .map((x) => x?.author)
    .filter(Boolean)
    .map((a) => `${a!.prenom} ${a!.nom}`.trim())
    .filter(Boolean)
  return {
    id: b.id,
    titre: b.titre,
    isbn: b.isbn,
    description: b.description ?? null,
    langue: b.langue ?? null,
    anneePublication: b.anneePublication ?? null,
    imageUrl: b.imageUrl ?? null,
    categoryName: b.category?.name ?? null,
    editorName: b.editor?.name ?? null,
    authorsLabel: authors.length ? authors.join(", ") : "—",
  }
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [language, setLanguage] = useState("all")
  const [author, setAuthor] = useState("all")
  const [isbn, setIsbn] = useState("")

  const [books, setBooks] = useState<UiBook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedBook, setSelectedBook] = useState<UiBook | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [meUserId, setMeUserId] = useState<number | null>(null)
  const [acting, setActing] = useState(false)
  const [borrowedLivreIds, setBorrowedLivreIds] = useState<Set<number>>(new Set())
  const [reservationByLivreId, setReservationByLivreId] = useState<Map<number, { id: number; statut: string }>>(new Map())
  const [reservationDate, setReservationDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [reservationDueDate, setReservationDueDate] = useState<string>(() => {
    const start = new Date()
    const due = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
    return due.toISOString().slice(0, 10)
  })

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<ApiLivre[]>("/livres")
      setBooks(data.map(normalizeUiBook))
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load books"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()

    ;(async () => {
      try {
        const me = await apiMe()
        const uid = me.user?.id ?? null
        setMeUserId(uid)
        if (uid) {
          try {
            const [emprunts, reservations] = await Promise.all([apiMyBorrowed(uid), apiMyReservations(uid)])
            const borrowedSet = new Set<number>()
            for (const e of emprunts as any[]) borrowedSet.add(e.livreId)
            const resMap = new Map<number, { id: number; statut: string }>()
            for (const r of reservations as any[]) resMap.set(r.livreId, { id: r.id, statut: r.statut })
            setBorrowedLivreIds(borrowedSet)
            setReservationByLivreId(resMap)
          } catch {
            // ignore
          }
        }
      } catch {
        setMeUserId(null)
      }
    })()
  }, [])

  const refreshMyState = async (uid: number) => {
    const [emprunts, reservations] = await Promise.all([apiMyBorrowed(uid), apiMyReservations(uid)])
    const borrowedSet = new Set<number>()
    for (const e of emprunts as any[]) borrowedSet.add(e.livreId)
    const resMap = new Map<number, { id: number; statut: string }>()
    for (const r of reservations as any[]) resMap.set(r.livreId, { id: r.id, statut: r.statut })
    setBorrowedLivreIds(borrowedSet)
    setReservationByLivreId(resMap)
  }

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    for (const b of books) if (b.categoryName) set.add(b.categoryName)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [books])

  const languageOptions = useMemo(() => {
    const set = new Set<string>()
    for (const b of books) if (b.langue) set.add(b.langue)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [books])

  const authorOptions = useMemo(() => {
    const set = new Set<string>()
    for (const b of books) {
      if (!b.authorsLabel || b.authorsLabel === "—") continue
      for (const part of b.authorsLabel.split(",")) {
        const name = part.trim()
        if (name) set.add(name)
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [books])

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const isbnQ = isbn.trim()

    return books.filter((book) => {
      const matchesSearch =
        !q ||
        book.titre.toLowerCase().includes(q) ||
        book.authorsLabel.toLowerCase().includes(q) ||
        book.isbn.includes(searchQuery)

      const matchesCategory = category === "all" || book.categoryName === category
      const matchesLanguage = language === "all" || book.langue === language
      const matchesAuthor = author === "all" || book.authorsLabel.split(",").map((x) => x.trim()).includes(author)
      const matchesIsbn = !isbnQ || book.isbn.includes(isbnQ)

      return matchesSearch && matchesCategory && matchesLanguage && matchesAuthor && matchesIsbn
    })
  }, [author, books, category, isbn, language, searchQuery])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const requireLogin = (): number | null => {
    if (!meUserId) {
      setActionMessage("Please login first to borrow or reserve.")
      setTimeout(() => setActionMessage(null), 2500)
      return null
    }
    return meUserId
  }

  const onBorrow = async (book: UiBook) => {
    const uid = requireLogin()
    if (!uid) return

    if (borrowedLivreIds.has(book.id)) {
      setActionMessage("You already borrowed this book.")
      setTimeout(() => setActionMessage(null), 2500)
      return
    }

    setActing(true)
    try {
      await apiBorrow(book.id, uid)
      setActionMessage(`Borrowed: “${book.titre}”.`)
      await refresh()
      await refreshMyState(uid)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Borrow failed"
      setActionMessage(msg)
    } finally {
      setActing(false)
      setTimeout(() => setActionMessage(null), 3500)
    }
  }

  const onReserve = async (book: UiBook) => {
    const uid = requireLogin()
    if (!uid) return

    if (reservationByLivreId.has(book.id)) {
      setActionMessage("You already have a reservation for this book.")
      setTimeout(() => setActionMessage(null), 2500)
      return
    }

    setActing(true)
    try {
      const iso = new Date(`${reservationDate}T00:00:00.000Z`).toISOString()
      const dueIso = reservationDueDate ? new Date(`${reservationDueDate}T00:00:00.000Z`).toISOString() : undefined
      await apiReserve(book.id, uid, iso, dueIso)
      setActionMessage(`Reserved: “${book.titre}”.`)
      await refresh()
      await refreshMyState(uid)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reservation failed"
      setActionMessage(msg)
    } finally {
      setActing(false)
      setTimeout(() => setActionMessage(null), 3500)
    }
  }

  const onCancelReservationForBook = async (book: UiBook) => {
    const uid = requireLogin()
    if (!uid) return
    const res = reservationByLivreId.get(book.id)
    if (!res) return

    setActing(true)
    try {
      await apiCancelReservation(res.id)
      setActionMessage("Reservation cancelled.")
      await refresh()
      await refreshMyState(uid)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Cancel failed"
      setActionMessage(msg)
    } finally {
      setActing(false)
      setTimeout(() => setActionMessage(null), 3500)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Discover</h1>
          <p className="text-slate-600 dark:text-slate-400">Find books by title, author, category, language, or ISBN</p>
        </div>

      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {actionMessage && (
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 text-sm">
          {actionMessage}
        </div>
      )}
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white dark:bg-slate-900">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-white dark:bg-slate-900">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languageOptions.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={author} onValueChange={setAuthor}>
            <SelectTrigger className="bg-white dark:bg-slate-900">
              <SelectValue placeholder="Author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {authorOptions.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Input
              type="text"
              placeholder="Filter by ISBN..."
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="bg-white dark:bg-slate-900"
            />
          </div>

          {(searchQuery !== "" || category !== "all" || language !== "all" || author !== "all" || isbn !== "") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setCategory("all")
                setLanguage("all")
                setAuthor("all")
                setIsbn("")
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Found {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
      </div>

      {/* Books Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="group cursor-pointer">
            <div
              className="relative mb-4 rounded-lg overflow-hidden aspect-[3/4] bg-slate-200 dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow"
              onClick={() => setSelectedBook(book)}
            >
              {/* Book Cover */}
              {book.imageUrl ? (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-900">
                  <img
                    src={book.imageUrl.startsWith("http") ? book.imageUrl : `${API_BASE}${book.imageUrl}`}
                    alt={book.titre}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center relative">
                  <span className="text-white text-center px-4 font-serif text-sm font-bold line-clamp-3">
                    {book.titre}
                  </span>
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-4">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedBook(book)
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={acting}
                  onClick={(e) => {
                    e.stopPropagation()
                    void onBorrow(book)
                  }}
                >
                  <BookMarked className="w-4 h-4 mr-1" />
                  Borrow
                </Button>
                {reservationByLivreId.has(book.id) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acting}
                    onClick={(e) => {
                      e.stopPropagation()
                      void onCancelReservationForBook(book)
                    }}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acting}
                    onClick={(e) => {
                      e.stopPropagation()
                      void onReserve(book)
                    }}
                  >
                    Reserve
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(book.id)
                  }}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(book.id) ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Book Info */}
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">{book.titre}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">{book.authorsLabel}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {book.categoryName || "Uncategorized"}
              </Badge>
              <span className="text-xs text-slate-600 dark:text-slate-400">{book.langue || "—"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBook(null)}
        >
          <Card
            className="w-full max-w-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <button
                onClick={() => setSelectedBook(null)}
                className="float-right p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-3 gap-6 mt-4">
                {/* Book Cover */}
                <div className="h-72 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  {selectedBook.imageUrl ? (
                    <img
                      src={selectedBook.imageUrl.startsWith("http") ? selectedBook.imageUrl : `${API_BASE}${selectedBook.imageUrl}`}
                      alt={selectedBook.titre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <span className="text-white text-center px-4 font-serif font-bold text-lg">{selectedBook.titre}</span>
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedBook.titre}</h2>
                    <p className="text-lg text-amber-600 dark:text-amber-500">{selectedBook.authorsLabel}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">ISBN:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{selectedBook.isbn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Editor:</span>
                      <span className="text-slate-900 dark:text-white">{selectedBook.editorName || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Published:</span>
                      <span className="text-slate-900 dark:text-white">{selectedBook.anneePublication ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Language:</span>
                      <span className="text-slate-900 dark:text-white">{selectedBook.langue || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Category:</span>
                      <Badge>{selectedBook.categoryName || "Uncategorized"}</Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedBook.description || "No description provided."}
                    </p>
                  </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Reservation date
                        </label>
                        <input
                          type="date"
                          className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm"
                          value={reservationDate}
                          onChange={(e) => setReservationDate(e.target.value)}
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                          Used to compute queue order when book is out of stock.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Reservation due date
                        </label>
                        <input
                          type="date"
                          className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm"
                          value={reservationDueDate}
                          onChange={(e) => setReservationDueDate(e.target.value)}
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                          Optional: last day to pick up before expiration.
                        </p>
                      </div>
                    </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-2">
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => void onBorrow(selectedBook)}
                      disabled={acting}
                    >
                      <BookMarked className="w-4 h-4 mr-2" />
                      Borrow This Book
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => void onReserve(selectedBook)}
                      disabled={acting}
                    >
                      Reserve This Book
                    </Button>
                    {reservationByLivreId.has(selectedBook.id) ? (
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => void onCancelReservationForBook(selectedBook)}
                        disabled={acting}
                      >
                        Cancel Reservation
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => toggleFavorite(selectedBook.id)}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${favorites.includes(selectedBook.id) ? "fill-current" : ""}`} />
                      {favorites.includes(selectedBook.id) ? "Remove from Favorites" : "Add to Favorites"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
