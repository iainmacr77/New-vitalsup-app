"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback: Processing authentication...")

        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          setError(`Authentication error: ${error.message}`)
          return
        }

        if (data?.session?.user) {
          const user = data.session.user
          console.log("Auth callback: User authenticated:", user.id)

          // Check if user has a newsletter profile and role
          const { data: userRoleData, error: roleError } = await supabase
            .from("user_newsletter_roles")
            .select(`
              *,
              newsletter_profile:newsletter_profiles(*)
            `)
            .eq("user_id", user.id)
            .maybeSingle()

          console.log("Auth callback: User role check:", userRoleData, roleError)

          if (roleError && roleError.code !== "PGRST116") {
            console.error("Error checking user role:", roleError)
            setError(`Database error: ${roleError.message}`)
            return
          }

          if (!userRoleData || !userRoleData.newsletter_profile) {
            // No profile found, redirect to welcome page
            console.log("Auth callback: No profile found, redirecting to welcome")
            router.push("/welcome")
            return
          }

          const profile = userRoleData.newsletter_profile
          console.log("Auth callback: Profile found:", profile)

          // Check onboarding completion status
          if (!profile.onboarding_completed) {
            // Check which step they're on
            const onboardingStep = profile.onboarding_step || 0

            console.log("Auth callback: Onboarding not complete, step:", onboardingStep)

            if (onboardingStep < 1) {
              router.push("/onboarding/step1")
            } else if (onboardingStep < 2) {
              router.push("/onboarding/step2")
            } else {
              // Fallback to step 1 if something's wrong
              router.push("/onboarding/step1")
            }
            return
          }

          // Onboarding is complete, redirect to dashboard
          console.log("Auth callback: Onboarding complete, redirecting to dashboard")
          router.push("/dashboard")
        } else {
          console.log("Auth callback: No user session, redirecting to login")
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        setError(`Unexpected error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md max-w-md">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return null
}
