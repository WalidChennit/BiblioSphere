"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { validateNINWithMessage } from "dz-nin-checker"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001"

function passwordStrength(password: string): { score: number; label: string; color: string } {
  const p = password
  if (!p) return { score: 0, label: "", color: "bg-slate-200" }

  let score = 0
  if (p.length >= 8) score += 1
  if (/[a-z]/.test(p)) score += 1
  if (/[A-Z]/.test(p)) score += 1
  if (/[0-9]/.test(p)) score += 1
  if (/[^A-Za-z0-9]/.test(p)) score += 1

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

  return { score, label: labelByScore[score] || "", color: colorByScore[score] || "bg-slate-200" }
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

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nin: "",
    matricule: "",
    dateOfBirth: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "public",
  })
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const strength = passwordStrength(formData.password)

  const ninError = (() => {
    const raw = formData.nin.trim()
    if (!raw) return ""
    if (!/^\d{18}$/.test(raw)) return "NIN must be exactly 18 digits"
    const result = validateNINWithMessage(raw)
    if (!result?.isValid) {
      return typeof result?.message === "string" ? result.message.replace(/^❌\s*/, "") : "Invalid NIN"
    }
    return ""
  })()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.nin ||
      !formData.phoneNumber ||
      !formData.dateOfBirth
    ) {
      setError("Please fill in all required fields")
      setSubmitting(false)
      return
    }

    if (ninError) {
      setError(ninError)
      setSubmitting(false)
      return
    }

    if (formData.role === "student" && !formData.matricule) {
      setError("Student ID (Matricule) is required for students")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Password constraints (degré)
    // Required: >= 8 chars, at least 1 lowercase, 1 uppercase, 1 number.
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setSubmitting(false)
      return
    }
    if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError("Password must include lowercase, uppercase and a number")
      setSubmitting(false)
      return
    }

    // Optional but recommended: enforce at least Medium strength
    if (strength.score < 3) {
      setError("Password strength is too low")
      setSubmitting(false)
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      setSubmitting(false)
      return
    }

    try {
      const payload = {
        email: formData.email,
        firstname: formData.firstName,
        lastname: formData.lastName,
        nin: formData.nin,
        matricule: formData.role === "student" ? formData.matricule : undefined,
        birthDate: formData.dateOfBirth,
        phone: formData.phoneNumber,
        role: formData.role === "student" ? "etudiant" : "membre_public",
        password: formData.password,
      }

      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const msg = await parseErrorMessage(res)
        throw new Error(msg || "Signup failed")
      }

      // No auth session implemented yet: always redirect to login.
      router.push("/login")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-500" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">LibraryHub</span>
          </Link>
        </div>

        {/* Signup Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join our community and start exploring thousands of books</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public User</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nin">National ID (NIN) *</Label>
                  <Input
                    id="nin"
                    name="nin"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{18}"
                    maxLength={18}
                    placeholder="18 digits"
                    value={formData.nin}
                    onChange={handleChange}
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                  {ninError ? (
                    <div className="text-xs text-red-600 dark:text-red-400">{ninError}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                {formData.role === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="matricule">Student ID (Matricule) *</Label>
                    <Input
                      id="matricule"
                      name="matricule"
                      type="text"
                      placeholder="STU2025001"
                      value={formData.matricule}
                      onChange={handleChange}
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-slate-50 dark:bg-slate-900"
                />
                {formData.password ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Password strength</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{strength.label}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${strength.color}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Min 8 chars, uppercase, lowercase, number.
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  I agree to the{" "}
                  <Link href="#" className="text-amber-600 dark:text-amber-500 hover:underline">
                    Terms of Service
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-amber-600 dark:text-amber-500 font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
