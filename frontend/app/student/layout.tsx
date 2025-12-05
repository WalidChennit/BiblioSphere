"use client"

import type React from "react"
import { RoleSidebar } from "@/components/role-sidebar"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleSidebar role="student">{children}</RoleSidebar>
}
