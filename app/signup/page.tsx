"use client"

import type React from "react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

// Password validation utility function
function validatePassword(password: string) {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
}

// Password requirements component
function PasswordRequirements({ requirements }: { requirements: ReturnType<typeof validatePassword> }) {
  return (
    <div className="mt-3 text-xs space-y-1">
      <div className={`flex items-center ${requirements.length ? "text-green-600" : "text-red-500"}`}>
        <span className="mr-2">{requirements.length ? "✓" : "✗"}</span>
        At least 8 characters
      </div>
      <div className={`flex items-center ${requirements.lowercase ? "text-green-600" : "text-red-500"}`}>
        <span className="mr-2">{requirements.lowercase ? "✓" : "✗"}</span>
        One lowercase letter
      </div>
      <div className={`flex items-center ${requirements.uppercase ? "text-green-600" : "text-red-500"}`}>
        <span className="mr-2">{requirements.uppercase ? "✓" : "✗"}</span>
        One uppercase letter
      </div>
      <div className={`flex items-center ${requirements.digit ? "text-green-600" : "text-red-500"}`}>
        <span className="mr-2">{requirements.digit ? "✓" : "✗"}</span>
        One number
      </div>
      <div className={`flex items-center ${requirements.symbol ? "text-green-600" : "text-red-500"}`}>
        <span className="mr-2">{requirements.symbol ? "✓" : "✗"}</span>
        One symbol (!@#$%^&*)
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  // Password validation state
  const requirements = validatePassword(password);
  const isPasswordValid = Object.values(requirements).every(Boolean);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (password !== confirmPassword) {
      setMessage("Passwords do not match")
      setLoading(false)
      return
    }

    if (!isPasswordValid) {
      setMessage("Password does not meet the requirements")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else if (data.user) {
      setShowConfirmation(true)
    }

    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
          scope: "email profile",
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/welcome`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Confirmation email sent! Please check your inbox and spam folder.")
    }
    setLoading(false)
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VitalsUp%20-%20Logo%20%28small%29%20noBG-hquZFbXfEBRhI5RsfDqpaQd7vR4Fss.png"
              alt="VitalsUp"
              className="h-12 w-auto mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold text-[#363637] mb-2">Check Your Email!</h1>
            <p className="text-[#3458d5]">We've sent you a confirmation link</p>
          </div>

          <div
            className="bg-blue-600 rounded-2xl p-8 shadow-xl border border-blue-700"
            style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
          >
            <div className="bg-white rounded-xl p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Congratulations!</h2>
                <p className="text-gray-600 mb-2">
                  We've sent a confirmation email to <strong className="text-gray-900">{email}</strong>
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Please click the link in the email to verify your account. Don't forget to check your spam folder!
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Resend Confirmation Email"}
                </button>

                <div className="text-center">
                  <a href="/login" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
                    Back to Login
                  </a>
                </div>
              </div>

              {message && <div className="text-center text-green-600 mt-4 text-sm">{message}</div>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VitalsUp%20-%20Logo%20%28small%29%20noBG-hquZFbXfEBRhI5RsfDqpaQd7vR4Fss.png"
            alt="VitalsUp"
            className="h-12 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-[#363637] mb-2">Create Your Account</h1>
          <p className="text-[#3458d5]">Join VitalsUp and start growing your practice</p>
        </div>

        <div
          className="bg-blue-600 rounded-2xl p-8 shadow-xl border border-blue-700"
          style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
        >
          <div className="bg-white rounded-xl p-6">
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>

                {password && (
                  <PasswordRequirements requirements={requirements} />
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <div className="mt-2 text-xs text-red-500">Passwords do not match</div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || password !== confirmPassword}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {message && <div className="text-center text-red-500 mt-4">{message}</div>}

            <div className="text-center mt-6">
              <span className="text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 font-medium hover:text-blue-700">
                  Log in
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}