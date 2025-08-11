"use client"

import type React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The AppShell now handles authentication and layout for all internal routes
  // This layout just passes through children
  return <>{children}</>
}
