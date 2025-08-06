"use client"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { BarChart3, FileText, Settings, User, History, Beaker, LogOut, ChevronDown, Users, Mail, Shield } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Define role-based permissions
const rolePermissions = {
  owner: ["dashboard", "profile", "template", "articles", "history", "content-lab", "users", "email-settings", "triage"],
  manager: ["dashboard", "profile", "template", "articles", "history", "content-lab", "users", "email-settings", "triage"],
  assistant: ["dashboard", "articles", "history", "content-lab", "triage"],
  viewer: ["dashboard", "history", "triage"],
}

interface AppSidebarProps {
  user?: any
  newsletterProfile?: any
  userRole?: string | null
}

export function AppSidebar({ user, newsletterProfile, userRole }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Get allowed sections based on user role
  const allowedSections = userRole ? rolePermissions[userRole as keyof typeof rolePermissions] || [] : []

  // Navigation items with conditional rendering based on permissions
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      permission: "dashboard",
    },
    {
      title: "My Profile",
      url: "/dashboard/profile",
      icon: User,
      permission: "profile",
    },
    {
      title: "Template Settings",
      url: "/dashboard/template",
      icon: Settings,
      permission: "template",
    },
    {
      title: "Email Settings",
      url: "/dashboard/email-settings",
      icon: Mail,
      permission: "email-settings",
    },
    {
      title: "Article Feed",
      url: "/dashboard/articles",
      icon: FileText,
      permission: "articles",
    },
    {
      title: "Newsletter History",
      url: "/dashboard/history",
      icon: History,
      permission: "history",
    },
    {
      title: "Content Lab",
      url: "/dashboard/content-lab",
      icon: Beaker,
      permission: "content-lab",
    },
    {
      title: "User Management",
      url: "/dashboard/users",
      icon: Users,
      permission: "users",
    },
    {
      title: "Triage",
      url: "/dashboard/triage",
      icon: Shield,
      permission: "triage",
    },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Filter navigation items based on user permissions
  const filteredNavItems = navItems.filter((item) => allowedSections.includes(item.permission))

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center p-4">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VitalsUp%20-%20Logo%20%28small%29%20noBG-hquZFbXfEBRhI5RsfDqpaQd7vR4Fss.png"
            alt="VitalsUp"
            className="w-40 h-auto"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole && (
          <SidebarGroup>
            <SidebarGroupLabel>Current Newsletter</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <div className="mb-1 text-sm font-medium">{newsletterProfile?.practice_name || "Newsletter"}</div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {newsletterProfile?.sending_frequency || "bi-weekly"}
                  </span>
                </div>

                {/* Email Configuration Status */}
                {newsletterProfile?.from_email_option === "custom_domain" && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Email Config:</span>
                      {newsletterProfile.custom_domain_status === "configured" && (
                        <Badge variant="default" className="text-xs">
                          ✓ Custom Domain
                        </Badge>
                      )}
                      {newsletterProfile.custom_domain_status === "pending" && (
                        <Badge variant="secondary" className="text-xs">
                          ⏳ Setting Up
                        </Badge>
                      )}
                      {newsletterProfile.custom_domain_status === "failed" && (
                        <Badge variant="destructive" className="text-xs">
                          ❌ Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {newsletterProfile?.from_email_option === "vitalsup_default" && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Email Config:</span>
                      <Badge variant="outline" className="text-xs">
                        VitalsUp Default
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {newsletterProfile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium">
                        {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                      </span>
                      <span className="text-xs text-muted-foreground">{userRole}</span>
                    </div>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
