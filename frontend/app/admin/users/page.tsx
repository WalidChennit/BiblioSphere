"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateNINWithMessage } from "dz-nin-checker"
import { apiFetch } from "@/lib/api"

type ApiRole = "admin" | "personnel" | "etudiant" | "membre_public"

type ApiUser = {
  id: number
  email: string
  prenom: string
  nom: string
  nin: string
  matricule: string | null
  dateDeNaissance: string
  telephone: string
  role: ApiRole
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
}

function passwordStrength(password: string): { score: number } {
  const p = password
  let score = 0
  if (!p) return { score: 0 }
  if (p.length >= 8) score += 1
  if (/[a-z]/.test(p)) score += 1
  if (/[A-Z]/.test(p)) score += 1
  if (/[0-9]/.test(p)) score += 1
  if (/[^A-Za-z0-9]/.test(p)) score += 1
  return { score }
}

function strengthMeta(score: number): { label: string; color: string; width: string } {
  // score is 0..5
  const labelByScore: Record<number, string> = {
    0: "",
    1: "Very weak",
    2: "Weak",
    3: "Medium",
    4: "Strong",
    5: "Very strong",
  }
  const colorByScore: Record<number, string> = {
    0: "bg-slate-200",
    1: "bg-red-500",
    2: "bg-orange-500",
    3: "bg-amber-500",
    4: "bg-green-500",
    5: "bg-emerald-600",
  }
  const widthByScore: Record<number, string> = {
    0: "0%",
    1: "20%",
    2: "40%",
    3: "60%",
    4: "80%",
    5: "100%",
  }

  return {
    label: labelByScore[score] ?? "",
    color: colorByScore[score] ?? "bg-slate-200",
    width: widthByScore[score] ?? "0%",
  }
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

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState("")
  const [users, setUsers] = useState<ApiUser[]>([])

  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [createError, setCreateError] = useState("")
  const [creating, setCreating] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nin: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  })

  const strength = passwordStrength(newUserForm.password)
  const strengthUi = strengthMeta(strength.score)

  const ninError = useMemo(() => {
    const raw = newUserForm.nin.trim()
    if (!raw) return ""
    if (!/^\d{18}$/.test(raw)) return "NIN must be exactly 18 digits"
    const result = validateNINWithMessage(raw)
    if (!result?.isValid) {
      return typeof result?.message === "string" ? result.message.replace(/^❌\s*/, "") : "Invalid NIN"
    }
    return ""
  }, [newUserForm.nin])

  const phoneError = useMemo(() => {
    const raw = newUserForm.phone.trim()
    if (!raw) return ""
    if (!/^0[567]\d{8}$/.test(raw)) return "Phone must be 10 digits and start with 05, 06, or 07"
    return ""
  }, [newUserForm.phone])

  const loadUsers = async () => {
    setLoadingUsers(true)
    setUsersError("")
    try {
      const res = await apiFetch(`/users`)
      if (!res.ok) {
        const msg = await parseErrorMessage(res)
        throw new Error(msg || "Failed to load users")
      }
      const data = (await res.json()) as ApiUser[]
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setUsersError(e instanceof Error ? e.message : "Failed to load users")
    } finally {
      setLoadingUsers(false)
    }
  }

  const toggleUserStatus = async (user: ApiUser) => {
    if (user.id === 0) return
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      const res = await apiFetch(`/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        const msg = await parseErrorMessage(res)
        throw new Error(msg || "Failed to update status")
      }
      await loadUsers()
    } catch (e) {
      setUsersError(e instanceof Error ? e.message : "Failed to update status")
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const handleAddUser = async () => {
    setCreateError("")

    if (!newUserForm.firstName || !newUserForm.lastName || !newUserForm.email || !newUserForm.nin || !newUserForm.phone || !newUserForm.birthDate) {
      setCreateError("Please fill in all required fields")
      return
    }

    if (ninError) {
      setCreateError(ninError)
      return
    }

    if (phoneError) {
      setCreateError(phoneError)
      return
    }

    if (newUserForm.password !== newUserForm.confirmPassword) {
      setCreateError("Passwords do not match")
      return
    }

    if (newUserForm.password.length < 8) {
      setCreateError("Password must be at least 8 characters")
      return
    }
    if (!/[a-z]/.test(newUserForm.password) || !/[A-Z]/.test(newUserForm.password) || !/[0-9]/.test(newUserForm.password)) {
      setCreateError("Password must include lowercase, uppercase and a number")
      return
    }
    if (strength.score < 3) {
      setCreateError("Password strength is too low")
      return
    }

    setCreating(true)
    try {
      const payload = {
        email: newUserForm.email,
        firstname: newUserForm.firstName,
        lastname: newUserForm.lastName,
        nin: newUserForm.nin,
        birthDate: newUserForm.birthDate,
        phone: newUserForm.phone,
        role: "personnel" as const,
        password: newUserForm.password,
      }

      const res = await apiFetch(`/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const msg = await parseErrorMessage(res)
        throw new Error(msg || "Failed to create user")
      }

      setNewUserForm({
        firstName: "",
        lastName: "",
        email: "",
        nin: "",
        phone: "",
        birthDate: "",
        password: "",
        confirmPassword: "",
      })
      setShowAddUserForm(false)
      await loadUsers()
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create user")
    } finally {
      setCreating(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const name = `${u.prenom} ${u.nom}`.toLowerCase()
    const email = (u.email || "").toLowerCase()
    const q = searchQuery.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  return (
    <div className="p-6 space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>List of all users + add personal users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <Input placeholder="Search by name or email" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-md" />
            <Button onClick={() => setShowAddUserForm((v) => !v)} className="bg-amber-600 hover:bg-amber-700">
              {showAddUserForm ? "Close" : "Add Personal User"}
            </Button>
          </div>

          {usersError && <div className="text-sm text-red-600">{usersError}</div>}

          {showAddUserForm && (
            <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Add New Personal User (Librarian)</h3>

              {createError && <div className="text-sm text-red-600">{createError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First name</Label>
                  <Input value={newUserForm.firstName} onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Last name</Label>
                  <Input value={newUserForm.lastName} onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="05xxxxxxxx"
                    value={newUserForm.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10)
                      setNewUserForm({ ...newUserForm, phone: digitsOnly })
                    }}
                  />
                  {phoneError && <div className="text-xs text-red-600">{phoneError}</div>}
                </div>
                <div className="space-y-1">
                  <Label>Birth date</Label>
                  <Input type="date" value={newUserForm.birthDate} onChange={(e) => setNewUserForm({ ...newUserForm, birthDate: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>NIN</Label>
                  <Input
                    inputMode="numeric"
                    maxLength={18}
                    placeholder="18 digits"
                    value={newUserForm.nin}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 18)
                      setNewUserForm({ ...newUserForm, nin: digitsOnly })
                    }}
                  />
                  {ninError && <div className="text-xs text-red-600">{ninError}</div>}
                </div>
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input type="password" value={newUserForm.password} onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })} />
                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${strengthUi.color}`} style={{ width: strengthUi.width }} />
                    </div>
                    {strengthUi.label && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Strength: {strengthUi.label}</div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Confirm password</Label>
                  <Input
                    type="password"
                    value={newUserForm.confirmPassword}
                    onChange={(e) => setNewUserForm({ ...newUserForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button disabled={creating} onClick={() => void handleAddUser()} className="bg-amber-600 hover:bg-amber-700">
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          )}

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-slate-500">
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                        <td className="py-3 px-4 font-medium">{u.prenom} {u.nom}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              u.status === "ACTIVE"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            onClick={() => void toggleUserStatus(u)}
                            size="sm"
                            variant={u.status === "ACTIVE" ? "destructive" : "outline"}
                            className="gap-2"
                          >
                            {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
