"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminSettingsPage() {
  return (
    <div className="p-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Admin settings (placeholder)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This page is ready — tell me what settings you want here.
          </p>
          <Button variant="outline" asChild>
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
