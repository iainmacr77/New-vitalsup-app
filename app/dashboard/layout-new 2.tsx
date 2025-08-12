"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import AppShell from "@/components/base44/app-shell/AppShell"
import { NAV_ITEMS } from "@/components/base44/app-shell/types"

export default function DashboardLayoutNew({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [newsletterProfile, setNewsletterProfile] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Dashboard layout: Fetching user data...")
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error("Error getting user:", userError)
          router.push("/login")
          return
        }

        if (userData?.user) {
          setUser(userData.user)
          console.log("Dashboard layout: User found:", userData.user.id)

          // Fetch user's role and newsletter profile
          const { data: userRoleData, error: userRoleError } = await supabase
            .from("user_newsletter_roles")
            .select(`
              *,
              newsletter_profile:newsletter_profiles(*)
            `)
            .eq("user_id", userData.user.id)
            .maybeSingle()

          console.log("Dashboard layout: User role query result:", userRoleData, userRoleError)

          if (userRoleError) {
            console.error("Error fetching user role:", userRoleError)
            if (userRoleError.code === "PGRST116") {
              // No role found, redirect to welcome
              console.log("No role found, redirecting to welcome")
              router.push("/welcome")
              return
            } else {
              setError(`Database error: ${userRoleError.message}`)
              return
            }
          }

          if (userRoleData && userRoleData.newsletter_profile) {
            const profile = userRoleData.newsletter_profile

            // Check if onboarding is completed
            if (!profile.onboarding_completed) {
              const onboardingStep = profile.onboarding_step || 0
              console.log("Dashboard layout: Onboarding not complete, redirecting to step:", onboardingStep)

              if (onboardingStep < 1) {
                router.push("/onboarding/step1")
              } else if (onboardingStep < 2) {
                router.push("/onboarding/step2")
              } else {
                router.push("/onboarding/step1")
              }
              return
            }

            console.log("Dashboard layout: Setting role and profile:", userRoleData.role, profile)
            setUserRole(userRoleData.role)
            setNewsletterProfile(profile)
          } else {
            // No role found, redirect to welcome page
            console.log("No role or profile found, redirecting to welcome")
            router.push("/welcome")
            return
          }
        } else {
          console.log("No user found, redirecting to login")
          router.push("/login")
        }
      } catch (error) {
        console.error("Error in dashboard layout fetchUserData:", error)
        setError(`Unexpected error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => router.push("/welcome")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Welcome Page
          </button>
        </div>
      </div>
    )
  }

  // Filter navigation items based on user role
  const rolePermissions = {
    owner: ["dashboard", "profile", "template", "articles", "history", "content-lab", "users", "email-settings", "triage"],
    manager: ["dashboard", "profile", "template", "articles", "history", "content-lab", "users", "email-settings", "triage"],
    assistant: ["dashboard", "articles", "history", "content-lab", "triage"],
    viewer: ["dashboard", "history", "triage"],
  };

  const allowedSections = userRole ? rolePermissions[userRole as keyof typeof rolePermissions] || [] : [];
  
  // Filter NAV_ITEMS based on permissions
  const filteredNavItems = NAV_ITEMS.filter(item => {
    const section = item.href.replace('/dashboard/', '').replace('/dashboard', 'dashboard');
    return allowedSections.includes(section);
  });

  // Transform user data for Base44 AppShell
  const transformedUser = {
    name: user?.user_metadata?.full_name || user?.email?.split("@")[0],
    email: user?.email,
    avatarUrl: user?.user_metadata?.avatar_url
  };

  return (
    <AppShell
      nav={filteredNavItems}
      user={transformedUser}
      currentRoute={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
      planLabel="Free"
    >
      <div className="p-6">
        {children}
      </div>
    </AppShell>
  )
}
