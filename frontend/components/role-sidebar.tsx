"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { apiListNotifications, apiMarkNotificationRead, type NotificationItem } from "@/lib/notifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const showUnreadDot = useMemo(() => unreadCount > 0, [unreadCount])

  const loadNotifications = async () => {
    try {
      const data = await apiListNotifications({ limit: 10 })
      setNotifications(data.items)
      setUnreadCount(data.unreadCount)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (notificationsOpen) loadNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsOpen])

  const onNotificationClick = async (n: NotificationItem) => {
    try {
      if (!n.readAt) await apiMarkNotificationRead(n.id)
    } catch {
      // ignore
    }
    if (n.href) router.push(n.href)
    setNotificationsOpen(false)
    loadNotifications()
  }

  const logout = async () => {
    try {
      await apiFetch(`/auth/logout`, { method: "POST" })
    } catch {
      // ignore
    }
    router.replace("/login")
    router.refresh()
  }

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
            onClick={logout}
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
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-end px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  {showUnreadDot && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} onSelect={() => onNotificationClick(n)} className="flex flex-col items-start gap-1">
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className={n.readAt ? "text-sm font-medium" : "text-sm font-semibold"}>{n.title}</span>
                        {!n.readAt && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{n.message}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
