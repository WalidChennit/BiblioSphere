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
  const router = useRouter()

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    // Mock signup - replace with actual authentication
    console.log("Signup attempt:", formData)

    if (formData.role === "student") {
      router.push("/student")
    } else if (formData.role === "admin") {
      router.push("/dashboard")
    } else {
      router.push("/discover")
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
                    placeholder="NIN"
                    value={formData.nin}
                    onChange={handleChange}
                    className="bg-slate-50 dark:bg-slate-900"
                  />
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

              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Create Account
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
