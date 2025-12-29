import type React from "react"

import { RoleSidebar } from "@/components/role-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleSidebar role="admin">{children}</RoleSidebar>
}
