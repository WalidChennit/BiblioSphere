"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { BookOpen, Users, BookMarked, TrendingUp, LogOut, Settings, Plus, Zap } from "lucide-react"

const dashboardData = [
  { month: "Jan", users: 400, books: 240 },
  { month: "Feb", users: 500, books: 320 },
  { month: "Mar", users: 600, books: 400 },
  { month: "Apr", users: 800, books: 500 },
  { month: "May", users: 1000, books: 650 },
  { month: "Jun", users: 1200, books: 800 },
]

const defaultUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "student", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "public", status: "Active" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com", role: "personal", status: "Active" },
  { id: 4, name: "Bob Wilson", email: "bob@example.com", role: "student", status: "Active" },
]
export default function AdminDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState(defaultUsers)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
  const [newUserForm, setNewUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nin: "",
    phone: "",
    birthDate: "",
    role: "personal",
  })

  const handleAddUser = () => {
    if (
      newUserForm.firstName &&
      newUserForm.lastName &&
      newUserForm.email &&
      newUserForm.nin &&
      newUserForm.phone &&
      newUserForm.birthDate
    ) {
      const newUser = {
        id: users.length + 1,
        name: `${newUserForm.firstName} ${newUserForm.lastName}`,
        email: newUserForm.email,
        nin: newUserForm.nin,
        phone: newUserForm.phone,
        birthDate: newUserForm.birthDate,
        role: newUserForm.role,
        status: "Active",
      }
      setUsers([...users, newUser])
      setNewUserForm({
        firstName: "",
        lastName: "",
        email: "",
        nin: "",
        phone: "",
        birthDate: "",
        role: "personal",
      })
      setShowAddUserForm(false)
    }
  }

  const handleDeactivateUser = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" } : user,
      ),
    )
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-500" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back, Admin</h1>
          <p className="text-slate-600 dark:text-slate-400">Here's an overview of your library's performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">1,234</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">+12% from last month</p>
                </div>
                <Users className="w-8 h-8 text-amber-600 dark:text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">8,456</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">+8% from last month</p>
                </div>
                <BookMarked className="w-8 h-8 text-orange-600 dark:text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Readers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">856</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">+15% from last month</p>
                </div>
                <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Growth Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">23%</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">+5% from last month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>User and book statistics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="var(--color-primary)" name="Users" />
                  <Bar dataKey="books" fill="var(--color-secondary)" name="Books" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Engagement Trend</CardTitle>
              <CardDescription>Monthly active user trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="var(--color-primary)" name="Users" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User Management Section */}
        <Card className="border-0 shadow-sm mt-10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all library users (Students, Public, Personal)</CardDescription>
            </div>
            <Button onClick={() => setShowAddUserForm(!showAddUserForm)} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Personal User
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddUserForm && (
              <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Add New Personal User (Librarian)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="First Name"
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                  />
                  <Input
                    placeholder="Last Name"
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  />
                  <Input
                    placeholder="NIN (National ID)"
                    value={newUserForm.nin}
                    onChange={(e) => setNewUserForm({ ...newUserForm, nin: e.target.value })}
                  />
                  <Input
                    placeholder="Phone Number"
                    type="tel"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  />
                  <Input
                    placeholder="Date of Birth"
                    type="date"
                    value={newUserForm.birthDate}
                    onChange={(e) => setNewUserForm({ ...newUserForm, birthDate: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddUser} className="bg-amber-600 hover:bg-amber-700">
                    Add User
                  </Button>
                  <Button onClick={() => setShowAddUserForm(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => handleDeactivateUser(user.id)}
                          size="sm"
                          variant={user.status === "Active" ? "destructive" : "outline"}
                          className="gap-2"
                        >
                          <Zap className="w-3 h-3" />
                          {user.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
