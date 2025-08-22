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

          // Query newsletter_profiles by user_id, selecting id, onboarding_completed
          const { data: profileData, error: profileError } = await supabase
            .from("newsletter_profiles")
            .select("id, onboarding_completed")
            .eq("user_id", user.id)
            .maybeSingle()

          if (profileError) {
            console.error("Error checking profile:", profileError)
            setError(`Database error: ${profileError.message}`)
            return
          }

          // If no row exists → router.replace("/welcome")
          if (!profileData) {
            console.log("Auth callback: No profile found, redirecting to welcome")
            router.replace("/welcome")
            return
          }

          // Else if onboarding_completed === false → router.replace("/onboarding/step1")
          if (!profileData.onboarding_completed) {
            console.log("Auth callback: Onboarding not complete, redirecting to step1")
            router.replace("/onboarding/step1")
            return
          }

          // Else → router.replace("/dashboard")
          console.log("Auth callback: Onboarding complete, redirecting to dashboard")
          router.replace("/dashboard")
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
