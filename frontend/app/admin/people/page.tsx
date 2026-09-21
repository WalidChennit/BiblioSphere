"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"
import { ListPagination, PAGE_SIZE } from "@/components/list-pagination"

type Author = { id: number; nom: string; prenom: string }

type Editor = { id: number; name: string }

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

export default function AdminPeoplePage() {
  const [tab, setTab] = useState<"authors" | "editors">("authors")

  const [authors, setAuthors] = useState<Author[]>([])
  const [editors, setEditors] = useState<Editor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [authorFirst, setAuthorFirst] = useState("")
  const [authorLast, setAuthorLast] = useState("")
  const [creatingAuthor, setCreatingAuthor] = useState(false)

  const [authorSearch, setAuthorSearch] = useState("")

  const [editorName, setEditorName] = useState("")
  const [creatingEditor, setCreatingEditor] = useState(false)

  const [deletingAuthorId, setDeletingAuthorId] = useState<number | null>(null)
  const [deletingEditorId, setDeletingEditorId] = useState<number | null>(null)

  const [editorSearch, setEditorSearch] = useState("")

  const [authorPage, setAuthorPage] = useState(1)
  const [editorPage, setEditorPage] = useState(1)

  const loadAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [aRes, eRes] = await Promise.all([apiFetch(`/authors`), apiFetch(`/editors`)])
      if (!aRes.ok) throw new Error((await parseErrorMessage(aRes)) || "Failed to load authors")
      if (!eRes.ok) throw new Error((await parseErrorMessage(eRes)) || "Failed to load editors")

      const a = (await aRes.json()) as Author[]
      const e = (await eRes.json()) as Editor[]
      setAuthors(Array.isArray(a) ? a : [])
      setEditors(Array.isArray(e) ? e : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  const addAuthor = async () => {
    setError("")
    const prenom = authorFirst.trim()
    const nom = authorLast.trim()
    if (!prenom || !nom) return

    setCreatingAuthor(true)
    try {
      const res = await apiFetch(`/authors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, nom }),
      })
      if (!res.ok) throw new Error((await parseErrorMessage(res)) || "Failed to create author")
      setAuthorFirst("")
      setAuthorLast("")
      await loadAll()
      setTab("authors")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create author")
    } finally {
      setCreatingAuthor(false)
    }
  }

  const addEditor = async () => {
    setError("")
    const name = editorName.trim()
    if (!name) return

    setCreatingEditor(true)
    try {
      const res = await apiFetch(`/editors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error((await parseErrorMessage(res)) || "Failed to create editor")
      setEditorName("")
      await loadAll()
      setTab("editors")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create editor")
    } finally {
      setCreatingEditor(false)
    }
  }

  const deleteAuthor = async (id: number) => {
    setError("")
    if (!confirm("Delete this author?")) return

    setDeletingAuthorId(id)
    try {
      const res = await apiFetch(`/authors/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await parseErrorMessage(res)) || "Failed to delete author")
      await loadAll()
      setTab("authors")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete author")
    } finally {
      setDeletingAuthorId(null)
    }
  }

  const deleteEditor = async (id: number) => {
    setError("")
    if (!confirm("Delete this editor?")) return

    setDeletingEditorId(id)
    try {
      const res = await apiFetch(`/editors/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await parseErrorMessage(res)) || "Failed to delete editor")
      await loadAll()
      setTab("editors")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete editor")
    } finally {
      setDeletingEditorId(null)
    }
  }

  const filteredAuthors = authors.filter((a) => {
    const q = authorSearch.trim().toLowerCase()
    if (!q) return true
    const full = `${a.prenom || ""} ${a.nom || ""}`.toLowerCase()
    return full.includes(q)
  })

  const filteredEditors = editors.filter((e) => {
    const q = editorSearch.trim().toLowerCase()
    if (!q) return true
    return (e.name || "").toLowerCase().includes(q)
  })

  useEffect(() => {
    setAuthorPage(1)
  }, [authorSearch])

  useEffect(() => {
    setEditorPage(1)
  }, [editorSearch])

  const authorTotalPages = Math.max(1, Math.ceil(filteredAuthors.length / PAGE_SIZE))
  const paginatedAuthors = filteredAuthors.slice((authorPage - 1) * PAGE_SIZE, authorPage * PAGE_SIZE)

  const editorTotalPages = Math.max(1, Math.ceil(filteredEditors.length / PAGE_SIZE))
  const paginatedEditors = filteredEditors.slice((editorPage - 1) * PAGE_SIZE, editorPage * PAGE_SIZE)

  return (
    <div className="p-6 space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Authors & Editors</CardTitle>
          <CardDescription>Add authors/editors and view their lists</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant={tab === "authors" ? "default" : "outline"} onClick={() => setTab("authors")}>
              Authors
            </Button>
            <Button variant={tab === "editors" ? "default" : "outline"} onClick={() => setTab("editors")}>
              Editors
            </Button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          {tab === "authors" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="space-y-1">
                  <Label>First name</Label>
                  <Input value={authorFirst} onChange={(e) => setAuthorFirst(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Last name</Label>
                  <Input value={authorLast} onChange={(e) => setAuthorLast(e.target.value)} />
                </div>
                <Button disabled={creatingAuthor} onClick={() => void addAuthor()} className="bg-amber-600 hover:bg-amber-700">
                  {creatingAuthor ? "Creating..." : "Add author"}
                </Button>
              </div>

              <div className="max-w-md">
                <Input
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  placeholder="Search authors..."
                  className="bg-white dark:bg-slate-950"
                />
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-3 px-4 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 font-semibold">First name</th>
                      <th className="text-left py-3 px-4 font-semibold">Last name</th>
                      <th className="text-right py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-6 px-4 text-slate-500">Loading...</td>
                      </tr>
                    ) : (
                      paginatedAuthors.map((a) => (
                        <tr key={a.id} className="border-b border-slate-200 dark:border-slate-800">
                          <td className="py-3 px-4">{a.id}</td>
                          <td className="py-3 px-4 font-medium">{a.prenom}</td>
                          <td className="py-3 px-4 font-medium">{a.nom}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={deletingAuthorId === a.id}
                              onClick={() => void deleteAuthor(a.id)}
                            >
                              {deletingAuthorId === a.id ? "Deleting..." : "Delete"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <ListPagination page={authorPage} totalPages={authorTotalPages} onPageChange={setAuthorPage} />
            </div>
          )}

          {tab === "editors" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="space-y-1 md:col-span-2">
                  <Label>Name</Label>
                  <Input value={editorName} onChange={(e) => setEditorName(e.target.value)} />
                </div>
                <Button disabled={creatingEditor} onClick={() => void addEditor()} className="bg-amber-600 hover:bg-amber-700">
                  {creatingEditor ? "Creating..." : "Add editor"}
                </Button>
              </div>

              <div className="max-w-md">
                <Input
                  value={editorSearch}
                  onChange={(e) => setEditorSearch(e.target.value)}
                  placeholder="Search editors..."
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
                      paginatedEditors.map((e) => (
                        <tr key={e.id} className="border-b border-slate-200 dark:border-slate-800">
                          <td className="py-3 px-4">{e.id}</td>
                          <td className="py-3 px-4 font-medium">{e.name}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={deletingEditorId === e.id}
                              onClick={() => void deleteEditor(e.id)}
                            >
                              {deletingEditorId === e.id ? "Deleting..." : "Delete"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <ListPagination page={editorPage} totalPages={editorTotalPages} onPageChange={setEditorPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
