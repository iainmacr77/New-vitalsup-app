"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function OnboardingStep3() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/login")
      }
    }

    checkUser()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VitalsUp%20-%20Logo%20%28small%29%20noBG-hquZFbXfEBRhI5RsfDqpaQd7vR4Fss.png"
            alt="VitalsUp"
            className="h-8 w-auto"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">Step 3 of 4</div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#363637] mb-2">Step 3 Placeholder</h1>
            <p className="text-[#3458d5]">We'll build this step next</p>
          </div>

          <div
            className="bg-blue-600 rounded-2xl p-8 shadow-xl border border-blue-700"
            style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
          >
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-700 mb-6">
                Your newsletter settings have been saved successfully. This is a placeholder for step 3 of the
                onboarding process.
              </p>

              <div className="flex justify-between">
                <Button onClick={() => router.push("/onboarding/step2")} variant="outline" className="px-6">
                  Back
                </Button>

                <Button
                  onClick={() => router.push("/welcome")}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-colors shadow-lg"
                  style={{ opacity: 1 }}
                >
                  Skip to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
