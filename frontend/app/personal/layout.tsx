"use client"

import type React from "react"
import { RoleSidebar } from "@/components/role-sidebar"

export default function PersonalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleSidebar role="personal">{children}</RoleSidebar>
}
