"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WelcomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creatingProfile, setCreatingProfile] = useState(false)
  const [practiceName, setPracticeName] = useState("")
  const [error, setError] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        console.log("Current user:", user.id, user.email)

        // Check if user already has a role in any newsletter profile
        const { data: userRoleData, error: roleError } = await supabase
          .from("user_newsletter_roles")
          .select("newsletter_profile_id, role")
          .eq("user_id", user.id)
          .maybeSingle()

        console.log("User role check:", userRoleData, roleError)

        if (userRoleData?.newsletter_profile_id) {
          // User already has a role, redirect to dashboard
          router.push("/dashboard")
          return
        }

        // Check if there's a pending invitation for this email
        const { data: pendingInvite, error: inviteError } = await supabase
          .from("user_newsletter_roles")
          .select("id, newsletter_profile_id, role, invitation_token")
          .eq("invitation_email", user.email)
          .eq("invitation_accepted", false)
          .maybeSingle()

        console.log("Pending invite check:", pendingInvite, inviteError)

        if (pendingInvite) {
          // Accept the invitation
          const { error: updateError } = await supabase
            .from("user_newsletter_roles")
            .update({
              user_id: user.id,
              invitation_accepted: true,
              invitation_token: null,
            })
            .eq("id", pendingInvite.id)

          if (updateError) {
            console.error("Error accepting invitation:", updateError)
            setError("Error accepting invitation: " + updateError.message)
          } else {
            // Redirect to dashboard
            router.push("/dashboard")
            return
          }
        }

        // If we get here, user needs to create a new newsletter profile
      } else {
        router.push("/login")
      }
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleCreateNewsletterProfile = async () => {
    if (!user || !practiceName.trim()) return

    setCreatingProfile(true)
    setError("")
    setDebugInfo(null)

    try {
      console.log("Creating newsletter profile for user:", user.id)

      // Store practice name in user metadata for use in onboarding
      const { error: updateError } = await supabase.auth.updateUser({
        data: { practice_name: practiceName.trim() },
      })

      if (updateError) {
        console.error("Error updating user metadata:", updateError)
      }

      // Prepare the data to insert
      const profileData = {
        user_id: user.id,
        practice_name: practiceName.trim(),
        first_name: user.user_metadata?.full_name?.split(" ")[0] || "",
        last_name: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        newsletter_name: "An Apple a Day",
        newsletter_background_color: "soft-blue",
        newsletter_welcome_message:
          '👋 Hello and welcome to this week\'s "An Apple a Day" — your trusted guide to staying happy and healthy.',
        sending_frequency: "bi-weekly",
        country: "South Africa",
        onboarding_step: 1,
        onboarding_completed: false,
      }

      console.log("Profile data to insert:", profileData)

      // Create a new newsletter profile
      const { data: insertedProfile, error: profileError } = await supabase
        .from("newsletter_profiles")
        .insert(profileData)
        .select()
        .single()

      if (profileError) {
        console.error("Error creating newsletter profile:", profileError)

        // Handle specific constraint errors
        if (profileError.message.includes("doctors_email_unique")) {
          setError(
            "It looks like there's still an old email constraint. Please contact support to resolve this database issue.",
          )
        } else if (profileError.message.includes("duplicate key")) {
          setError("A profile with this information already exists. Please try logging out and back in.")
        } else {
          setError(`Error creating newsletter profile: ${profileError.message}`)
        }

        setDebugInfo({
          error: profileError,
          userData: user,
          profileData: profileData,
          errorCode: profileError.code,
          errorDetails: profileError.details,
        })
        return
      }

      console.log("Newsletter profile created:", insertedProfile)

      // Create owner role for the user
      const roleData = {
        user_id: user.id,
        newsletter_profile_id: insertedProfile.id,
        role: "owner",
        invitation_accepted: true,
      }

      console.log("Role data to insert:", roleData)

      const { error: roleError } = await supabase.from("user_newsletter_roles").insert(roleData)

      if (roleError) {
        console.error("Error creating user role:", roleError)
        setError(`Error setting up permissions: ${roleError.message}`)
        setDebugInfo({
          error: roleError,
          roleData: roleData,
        })
        return
      }

      console.log("User role created successfully")

      // Redirect to onboarding step 1
      router.push("/onboarding/step1")
    } catch (error) {
      console.error("Error in handleCreateNewsletterProfile:", error)
      setError(`An unexpected error occurred: ${error}`)
      setDebugInfo({ error })
    } finally {
      setCreatingProfile(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <span className="text-gray-600">Welcome, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}</span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            Welcome to VitalsUp! 🎉
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hello {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
          </h1>
          <p className="text-xl text-gray-600">Let's set up your practice profile to get started.</p>
        </div>

        <div className="max-w-md mx-auto">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
                {debugInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">Debug Information</summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Create Your Practice Profile</CardTitle>
              <CardDescription>
                This will be the main profile for your practice. You can invite team members later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="practice-name" className="text-sm font-medium">
                    Practice Name
                  </label>
                  <Input
                    id="practice-name"
                    placeholder="Enter your practice name"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors"
                onClick={handleCreateNewsletterProfile}
                disabled={creatingProfile || !practiceName.trim()}
              >
                {creatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Practice Profile"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
