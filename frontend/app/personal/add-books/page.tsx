"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Plus, Book } from "lucide-react"
import { Check, ChevronsUpDown, X } from "lucide-react"

type Category = { id: number; name: string }
type Editor = { id: number; name: string }
type Author = { id: number; nom: string; prenom: string }

type Livre = {
  id: number
  titre: string
  isbn: string
  imageUrl?: string | null
  category?: { id: number; name: string } | null
  editor?: { id: number; name: string } | null
  authors?: Array<{ id: number; nom: string; prenom: string }> | null
}

const API_BASE = "/api"

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as T
}

export default function AddBooksPage() {
  const [books, setBooks] = useState<Livre[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editors, setEditors] = useState<Editor[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loadingRefs, setLoadingRefs] = useState(false)
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    isbn: "",
    categoryId: "",
    editorId: "",
    authorIds: [] as number[],
    langue: "",
    anneePublication: "",
    nombreExemplaires: "",
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [authorsOpen, setAuthorsOpen] = useState(false)

  const [categoryQuery, setCategoryQuery] = useState("")
  const [editorQuery, setEditorQuery] = useState("")
  const [authorQuery, setAuthorQuery] = useState("")

  const selectedAuthorIdsSet = useMemo(() => new Set(formData.authorIds), [formData.authorIds])

  const selectedCategory = useMemo(() => {
    const id = Number(formData.categoryId)
    if (!id) return undefined
    return categories.find((c) => c.id === id)
  }, [categories, formData.categoryId])

  const selectedEditor = useMemo(() => {
    const id = Number(formData.editorId)
    if (!id) return undefined
    return editors.find((e) => e.id === id)
  }, [editors, formData.editorId])

  const selectedAuthorsLabel = useMemo(() => {
    if (formData.authorIds.length === 0) return "Select authors"
    const selected = authors
      .filter((a) => selectedAuthorIdsSet.has(a.id))
      .map((a) => `${a.prenom} ${a.nom}`)
    if (selected.length === 0) return "Select authors"
    if (selected.length <= 2) return selected.join(", ")
    return `${selected.slice(0, 2).join(", ")} +${selected.length - 2}`
  }, [authors, formData.authorIds.length, selectedAuthorIdsSet])

  const currentYear = new Date().getFullYear()
  const yearOptions = useMemo(() => {
    const years: number[] = []
    for (let y = currentYear; y >= 1900; y--) years.push(y)
    return years
  }, [currentYear])

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [categories, categoryQuery])

  const filteredEditors = useMemo(() => {
    const q = editorQuery.trim().toLowerCase()
    if (!q) return editors
    return editors.filter((e) => e.name.toLowerCase().includes(q))
  }, [editors, editorQuery])

  const filteredAuthors = useMemo(() => {
    const q = authorQuery.trim().toLowerCase()
    if (!q) return authors
    return authors.filter((a) => `${a.prenom} ${a.nom}`.toLowerCase().includes(q))
  }, [authors, authorQuery])

  const refreshBooks = async () => {
    setLoadingBooks(true)
    try {
      const data = await apiGet<Livre[]>("/livres")
      setBooks(data)
    } finally {
      setLoadingBooks(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingRefs(true)
      setError(null)
      try {
        const [cats, eds, auths] = await Promise.all([
          apiGet<Category[]>("/categories"),
          apiGet<Editor[]>("/editors"),
          apiGet<Author[]>("/authors"),
        ])
        if (!mounted) return
        setCategories(cats)
        setEditors(eds)
        setAuthors(auths)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur lors du chargement")
      } finally {
        setLoadingRefs(false)
      }
    })()
    refreshBooks().catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggleAuthor = (authorId: number) => {
    setFormData((prev) => {
      const next = new Set(prev.authorIds)
      if (next.has(authorId)) next.delete(authorId)
      else next.add(authorId)
      return { ...prev, authorIds: Array.from(next) }
    })
  }

  const uploadCoverIfAny = async (): Promise<string | undefined> => {
    if (!coverFile) return undefined
    const fd = new FormData()
    fd.append("file", coverFile)
    const res = await fetch(`${API_BASE}/uploads/cover`, { method: "POST", body: fd })
    if (!res.ok) throw new Error(await res.text())
    const data = (await res.json()) as { imageUrl: string }
    return data.imageUrl
  }

  const handleAddBook = async () => {
    setSubmitting(true)
    setError(null)
    try {
      if (!formData.titre || !formData.isbn || !formData.categoryId || !formData.editorId) {
        throw new Error("Titre, ISBN, catégorie et éditeur sont obligatoires")
      }
      if (formData.authorIds.length === 0) {
        throw new Error("Choisis au moins un auteur")
      }

      const imageUrl = await uploadCoverIfAny()

      const payload = {
        titre: formData.titre,
        description: formData.description || undefined,
        isbn: formData.isbn,
        categoryId: Number(formData.categoryId),
        editorId: Number(formData.editorId),
        authorIds: formData.authorIds,
        langue: formData.langue || undefined,
        anneePublication: formData.anneePublication ? Number(formData.anneePublication) : undefined,
        nombreExemplaires: formData.nombreExemplaires ? Number(formData.nombreExemplaires) : undefined,
        imageUrl: imageUrl || undefined,
      }

      const res = await fetch(`${API_BASE}/livres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())

      setFormData({
        titre: "",
        description: "",
        isbn: "",
        categoryId: "",
        editorId: "",
        authorIds: [],
        langue: "",
        anneePublication: "",
        nombreExemplaires: "",
      })
      setCoverFile(null)
      setShowForm(false)
      await refreshBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSubmitting(false)
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

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

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
                  <Label htmlFor="titre">Book Title *</Label>
                  <Input
                    id="titre"
                    name="titre"
                    placeholder="Enter book title"
                    value={formData.titre}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Short description (optional)"
                    value={formData.description}
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
                  <Label htmlFor="categoryId">Category *</Label>
                  <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryOpen}
                        disabled={loadingRefs}
                        className="mt-1 w-full justify-between bg-white dark:bg-slate-950"
                      >
                        <span className="truncate text-left">
                          {selectedCategory?.name || "Select category"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search category..."
                          value={categoryQuery}
                          onValueChange={setCategoryQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {filteredCategories.map((c) => {
                              const isSelected = String(c.id) === formData.categoryId
                              return (
                                <CommandItem
                                  key={c.id}
                                  value={`${c.name} ${c.id}`}
                                  onSelect={() => {
                                    setFormData((p) => ({ ...p, categoryId: String(c.id) }))
                                    setCategoryOpen(false)
                                  }}
                                >
                                  <Check className={isSelected ? "h-4 w-4" : "h-4 w-4 opacity-0"} />
                                  <span className="truncate">{c.name}</span>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="editorId">Editor *</Label>
                  <Popover open={editorOpen} onOpenChange={setEditorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={editorOpen}
                        disabled={loadingRefs}
                        className="mt-1 w-full justify-between bg-white dark:bg-slate-950"
                      >
                        <span className="truncate text-left">{selectedEditor?.name || "Select editor"}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search editor..."
                          value={editorQuery}
                          onValueChange={setEditorQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No editor found.</CommandEmpty>
                          <CommandGroup>
                            {filteredEditors.map((ed) => {
                              const isSelected = String(ed.id) === formData.editorId
                              return (
                                <CommandItem
                                  key={ed.id}
                                  value={`${ed.name} ${ed.id}`}
                                  onSelect={() => {
                                    setFormData((p) => ({ ...p, editorId: String(ed.id) }))
                                    setEditorOpen(false)
                                  }}
                                >
                                  <Check className={isSelected ? "h-4 w-4" : "h-4 w-4 opacity-0"} />
                                  <span className="truncate">{ed.name}</span>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="langue">Language</Label>
                  <select
                    id="langue"
                    name="langue"
                    value={formData.langue}
                    onChange={(e) => setFormData((p) => ({ ...p, langue: e.target.value }))}
                    className="mt-1 w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:bg-slate-950 dark:border-slate-800"
                  >
                    <option value="">Select language</option>
                    <option value="English">English</option>
                    <option value="French">French</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="anneePublication">Publication Year</Label>
                  <select
                    id="anneePublication"
                    name="anneePublication"
                    value={formData.anneePublication}
                    onChange={(e) => setFormData((p) => ({ ...p, anneePublication: e.target.value }))}
                    className="mt-1 w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:bg-slate-950 dark:border-slate-800"
                  >
                    <option value="">Select year</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="nombreExemplaires">Copies</Label>
                  <Input
                    id="nombreExemplaires"
                    name="nombreExemplaires"
                    placeholder="e.g. 3"
                    value={formData.nombreExemplaires}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cover">Cover image</Label>
                  <Input
                    id="cover"
                    name="cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Authors *</Label>
                  <div className="mt-1 flex flex-col gap-2">
                    <Popover open={authorsOpen} onOpenChange={setAuthorsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={authorsOpen}
                          disabled={loadingRefs}
                          className="w-full justify-between bg-white dark:bg-slate-950"
                        >
                          <span className="truncate text-left">{selectedAuthorsLabel}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search authors..."
                            value={authorQuery}
                            onValueChange={setAuthorQuery}
                          />
                          <CommandList>
                            <CommandEmpty>No author found.</CommandEmpty>
                            <CommandGroup>
                              {filteredAuthors.map((a) => {
                                const fullName = `${a.prenom} ${a.nom}`
                                const checked = selectedAuthorIdsSet.has(a.id)
                                return (
                                  <CommandItem
                                    key={a.id}
                                    value={`${fullName} ${a.id}`}
                                    onSelect={() => handleToggleAuthor(a.id)}
                                  >
                                    <Check className={checked ? "h-4 w-4" : "h-4 w-4 opacity-0"} />
                                    <span className="truncate">{fullName}</span>
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {formData.authorIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {authors
                          .filter((a) => selectedAuthorIdsSet.has(a.id))
                          .map((a) => {
                            const fullName = `${a.prenom} ${a.nom}`
                            return (
                              <span
                                key={a.id}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                              >
                                <span className="max-w-[260px] truncate">{fullName}</span>
                                <button
                                  type="button"
                                  className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800"
                                  onClick={() => handleToggleAuthor(a.id)}
                                  aria-label={`Remove ${fullName}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            )
                          })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddBook} className="bg-amber-600 hover:bg-amber-700" disabled={submitting}>
                  {submitting ? "Saving..." : "Add Book"}
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">ISBN</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Editor</th>
                </tr>
              </thead>
              <tbody>
                {loadingBooks ? (
                  <tr>
                    <td className="py-3 px-4" colSpan={4}>
                      Loading...
                    </td>
                  </tr>
                ) : null}
                {books.map((book) => (
                  <tr
                    key={book.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Book className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        {book.titre}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{book.isbn}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded text-xs font-medium">
                        {book.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{book.editor?.name || "—"}</td>
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
