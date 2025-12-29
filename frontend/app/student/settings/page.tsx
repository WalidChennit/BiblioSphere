"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Bell, Lock, X, Eye, EyeOff } from "lucide-react"
import { apiChangeMyPassword, apiMe, apiUpdateMe } from "@/lib/student"
import { useTheme } from "@/components/ThemeProvider"

export default function StudentSettingsPage() {
  const { theme, setTheme } = useTheme()

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nin: "",
    dateOfBirth: "",
    matricule: "",
  })

  const [sessionUser, setSessionUser] = useState<{ id: number; email: string; role: string } | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string>("")
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    dueDateReminders: true,
    reservationNotifications: true,
  })

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  })

  const isStudent = useMemo(() => sessionUser?.role === "etudiant", [sessionUser?.role])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoadingProfile(true)
        setProfileError("")

        const me = await apiMe()
        if (cancelled) return
        if (!me.user) {
          setSessionUser(null)
          setProfileError("You are not logged in")
          return
        }

        setSessionUser(me.user)

        // Fetch full profile using the existing users listing (no dedicated endpoint yet)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/users`, {
          credentials: "include",
          cache: "no-store",
        })
        if (!res.ok) throw new Error(await res.text())
        const users = (await res.json()) as Array<any>
        const full = users.find((u) => u.id === me.user!.id)
        if (!full) throw new Error("User not found")

        setProfile({
          firstName: full.prenom || "",
          lastName: full.nom || "",
          email: full.email || "",
          phone: full.telephone || "",
          nin: full.nin || "",
          dateOfBirth: full.dateDeNaissance ? String(full.dateDeNaissance).slice(0, 10) : "",
          matricule: full.matricule || "",
        })
      } catch (e) {
        if (cancelled) return
        setProfileError(e instanceof Error ? e.message : "Failed to load profile")
      } finally {
        if (cancelled) return
        setLoadingProfile(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  const handleSaveProfile = async () => {
    setProfileError("")
    setProfileSuccess(false)

    if (!sessionUser) {
      setProfileError("You are not logged in")
      return
    }

    try {
      setSavingProfile(true)

      const payload = {
        email: profile.email,
        telephone: profile.phone,
        ...(isStudent ? { matricule: profile.matricule } : {}),
      }

      const updated = await apiUpdateMe(payload)
      setProfile({
        firstName: updated.user.prenom || "",
        lastName: updated.user.nom || "",
        email: updated.user.email || "",
        phone: updated.user.telephone || "",
        nin: updated.user.nin || "",
        dateOfBirth: updated.user.dateDeNaissance ? String(updated.user.dateDeNaissance).slice(0, 10) : "",
        matricule: updated.user.matricule || "",
      })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 2000)
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleNotificationChange = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
    setPasswordError("")
  }

  const handleUpdatePassword = async () => {
    setPasswordError("")
    setPasswordSuccess(false)

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Please fill in all password fields")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password")
      return
    }

    try {
      setSavingPassword(true)
      await apiChangeMyPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : "Failed to update password")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-amber-600 dark:text-amber-500" />
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your profile and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md text-sm">
              Profile updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={handleProfileChange}
                readOnly
                className="mt-1 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={handleProfileChange}
                readOnly
                className="mt-1 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleProfileChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="nin">National ID (NIN)</Label>
              <Input
                id="nin"
                name="nin"
                value={profile.nin}
                onChange={handleProfileChange}
                readOnly
                className="mt-1 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={profile.dateOfBirth}
                onChange={handleProfileChange}
                readOnly
                className="mt-1 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
              />
            </div>
            <div>
              <Label htmlFor="matricule">Student ID (Matricule)</Label>
              <Input
                id="matricule"
                name="matricule"
                value={profile.matricule}
                onChange={handleProfileChange}
                readOnly={!isStudent}
                className={
                  isStudent
                    ? "mt-1"
                    : "mt-1 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                }
              />
            </div>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={loadingProfile || savingProfile || !sessionUser}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {savingProfile ? "Saving..." : loadingProfile ? "Loading..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "emailAlerts", label: "Email Alerts", description: "Receive important notifications via email" },
            { key: "smsAlerts", label: "SMS Alerts", description: "Receive SMS notifications for urgent matters" },
            {
              key: "dueDateReminders",
              label: "Due Date Reminders",
              description: "Get reminded before books are due for return",
            },
            {
              key: "reservationNotifications",
              label: "Reservation Notifications",
              description: "Get notified when reserved books are ready for pickup",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 border rounded-lg border-slate-200 dark:border-slate-800"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
              <button
                onClick={() => handleNotificationChange(item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications]
                    ? "bg-amber-600 dark:bg-amber-500"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how BiblioSphere looks on this device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Theme</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Light / Dark / System</p>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Change Password</Label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Update your password regularly to keep your account secure
            </p>
            <Button onClick={() => setShowPasswordModal(true)} variant="outline">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                  setPasswordError("")
                  setPasswordSuccess(false)
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md text-sm">
                  Password updated successfully!
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="bg-slate-50 dark:bg-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((s) => ({ ...s, current: !s.current }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    aria-label={showPasswords.current ? "Hide current password" : "Show current password"}
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.next ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="bg-slate-50 dark:bg-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((s) => ({ ...s, next: !s.next }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    aria-label={showPasswords.next ? "Hide new password" : "Show new password"}
                  >
                    {showPasswords.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="bg-slate-50 dark:bg-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    aria-label={showPasswords.confirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleUpdatePassword} className="flex-1 bg-amber-600 hover:bg-amber-700">
                  {savingPassword ? "Updating..." : "Update Password"}
                </Button>
                <Button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                    setPasswordError("")
                    setPasswordSuccess(false)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
