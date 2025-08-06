"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CallbackSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    console.log("RENDER: /auth/callback-success. URL Hash:", window.location.hash)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("EVENT on /auth/callback-success:", event)
      console.log("SESSION on /auth/callback-success:", session)

      if (event === "SIGNED_IN" && session) {
        console.log(`Success: User signed in with email: ${session.user.email}`)

        // Check onboarding status
        const { data: doctorData } = await supabase
          .from("doctors")
          .select("onboarding_completed, onboarding_step")
          .eq("user_id", session.user.id)
          .maybeSingle()

        if (doctorData?.onboarding_completed) {
          // User has completed onboarding, go to dashboard
          router.push("/dashboard")
        } else if (doctorData?.onboarding_step) {
          // User has started onboarding, continue from where they left off
          router.push(`/onboarding/step${doctorData.onboarding_step}`)
        } else {
          // New user, go to welcome page
          router.push("/welcome")
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out")
        router.push("/")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <div>
      <h1>Processing authentication, please wait...</h1>
    </div>
  )
}
