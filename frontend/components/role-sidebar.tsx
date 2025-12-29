"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Home,
  Compass,
  BookMarked,
  Heart,
  BookPlus,
  Users,
  Library,
  UserSquare2,
  AlertCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react"

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

interface RoleSidebarProps {
  role: "student" | "personal" | "admin"
  children: React.ReactNode
}

export function RoleSidebar({ role, children }: RoleSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "student":
        return [
          { icon: Home, label: "Dashboard", href: "/student" },
          { icon: Compass, label: "Discover", href: "/student/discover" },
          { icon: BookMarked, label: "Borrowed", href: "/student/borrowed" },
          { icon: Heart, label: "Reservations", href: "/student/reservations" },
        ]
      case "personal":
        return [
          { icon: Home, label: "Dashboard", href: "/personal" },
          { icon: BookPlus, label: "Add Books", href: "/personal/add-books" },
          { icon: AlertCircle, label: "Overdues", href: "/personal/overdues" },
          { icon: Heart, label: "Reservations", href: "/personal/reservations" },
        ]
      case "admin":
        return [
          { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
          { icon: Users, label: "Users", href: "/admin/users" },
          { icon: Library, label: "Catalogue", href: "/admin/catalogue" },
          { icon: UserSquare2, label: "Authors & Editors", href: "/admin/people" },
        ]
      default:
        return []
    }
  }

  const getSettingsPath = (): string => {
    switch (role) {
      case "student":
        return "/student/settings"
      case "personal":
        return "/personal/settings"
      case "admin":
        return "/admin/settings"
      default:
        return "/"
    }
  }

  const getWelcomeMessage = (): string => {
    switch (role) {
      case "student":
        return "Welcome back, Student"
      case "personal":
        return "Welcome, Librarian"
      case "admin":
        return "Welcome, Admin"
      default:
        return "Welcome"
    }
  }

  const getInitial = (): string => {
    switch (role) {
      case "student":
        return "S"
      case "personal":
        return "L"
      case "admin":
        return "A"
      default:
        return "?"
    }
  }

  const navItems = getNavItems()
  const settingsPath = getSettingsPath()
  const welcomeMessage = getWelcomeMessage()
  const initial = getInitial()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-50`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">BiblioSphere</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors">
                <item.icon className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                {sidebarOpen && (
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                )}
              </button>
            </Link>
          ))}
        </nav>

        {/* Footer Items */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-3 py-4 space-y-2">
          <Link href={settingsPath}>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {sidebarOpen && <span className="text-sm text-slate-700 dark:text-slate-300">Settings</span>}
            </button>
          </Link>
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{welcomeMessage}</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
              {initial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
