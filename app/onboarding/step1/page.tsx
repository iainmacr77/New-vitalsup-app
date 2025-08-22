"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "Please select a title"),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  position: z.string().min(1, "Please select your position"),
  position_other: z.string().optional(),
  practice_name: z.string().min(2, "Practice name must be at least 2 characters"),
  street_address: z.string().min(5, "Street address must be at least 5 characters"),
  suburb: z.string().min(2, "Suburb must be at least 2 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postal_code: z.string().min(3, "Postal code must be at least 3 characters"),
  specialty: z.string().min(1, "Please select a medical specialty"),
  specialty_other: z.string().optional(),
  phone_number: z.string().optional(),
  mobile_phone: z.string().optional(),
  communication_preference: z.string().min(1, "Please select your preferred communication method"),
  patient_count: z.number().min(0),
  pms_system: z.string().optional(),
  booking_system: z.string().optional(),
  clinic_type: z.string().optional(),
  clinic_type_other: z.string().optional(),
  country: z.string().min(1, "Please select your country"),
  country_other: z.string().optional(),
})

// Dropdown options
const titleOptions = ["Dr.", "Prof.", "Mr.", "Ms.", "Mx."]
const positionOptions = ["Doctor", "Practice Manager", "Admin", "Other"]
const specialtyOptions = [
  "General Practitioner",
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Geriatrics",
  "Obstetrics & Gynecology",
  "Dermatology",
  "Psychiatry",
  "Psychology",
  "Dentistry",
  "Orthopedics",
  "Neurology",
  "Cardiology",
  "Endocrinology",
  "Pulmonology",
  "Rheumatology",
  "Oncology",
  "Urology",
  "Chiropractor",
  "Physiotherapist",
  "Occupational Therapist",
  "Speech Therapist",
  "Other",
]
const communicationOptions = ["Email", "Phone", "WhatsApp"]
const clinicTypeOptions = ["Private Practice", "Hospital", "Telehealth", "NGO", "Other"]
const countryOptions = [
  "South Africa",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "New Zealand",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Other",
]

export default function OnboardingStep1() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const router = useRouter()

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Dr.",
      first_name: "",
      last_name: "",
      position: "Doctor",
      position_other: "",
      practice_name: "",
      street_address: "",
      suburb: "",
      city: "",
      postal_code: "",
      specialty: "General Practitioner",
      specialty_other: "",
      phone_number: "",
      mobile_phone: "",
      communication_preference: "Email",
      patient_count: 1000,
      pms_system: "",
      booking_system: "",
      clinic_type: "Private Practice",
      clinic_type_other: "",
      country: "South Africa",
      country_other: "",
    },
  })

  // Watch form values
  const watchPosition = form.watch("position")
  const watchSpecialty = form.watch("specialty")
  const watchClinicType = form.watch("clinic_type")
  const watchCountry = form.watch("country")

  // Check if user is authenticated and get profile data
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/login")
        return
      }

      setUser(data.user)

      // Get existing profile data
      const { data: profileData } = await supabase
        .from("newsletter_profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle()

      if (profileData) {
        setProfileData(profileData)
      }
    }

    checkUser()
  }, [router])

  // Pre-populate form with user data
  useEffect(() => {
    if (!user) return

    // Get practice name from user metadata if available
    const practiceNameFromMetadata = user.user_metadata?.practice_name

    // If we have profile data, use that first
    if (profileData) {
      form.setValue("practice_name", profileData.practice_name || "")

      // Parse address components if available
      if (profileData.practice_address) {
        const addressParts = profileData.practice_address.split(",").map((part: string) => part.trim())
        if (addressParts.length >= 1) form.setValue("street_address", addressParts[0] || "")
        if (addressParts.length >= 2) form.setValue("suburb", addressParts[1] || "")
        if (addressParts.length >= 3) form.setValue("city", addressParts[2] || "")
        if (addressParts.length >= 4) form.setValue("postal_code", addressParts[3] || "")
      }

      // Other fields
      form.setValue("title", profileData.title || "Dr.")
      form.setValue("first_name", profileData.first_name || "")
      form.setValue("last_name", profileData.last_name || "")
      form.setValue("position", profileData.position || "Doctor")
      form.setValue("specialty", profileData.specialty || "General Practitioner")
      form.setValue("phone_number", profileData.phone_number || "")
      form.setValue("mobile_phone", profileData.mobile_phone || "")
      form.setValue("communication_preference", profileData.communication_preference || "Email")
      form.setValue("patient_count", profileData.patient_count || 1000)
      form.setValue("pms_system", profileData.pms_system || "")
      form.setValue("booking_system", profileData.booking_system || "")
      form.setValue("clinic_type", profileData.clinic_type || "Private Practice")
      form.setValue("country", profileData.country || "South Africa")
    }
    // Otherwise use metadata from welcome page
    else if (practiceNameFromMetadata) {
      form.setValue("practice_name", practiceNameFromMetadata)
    }

    // Pre-populate name fields from user metadata
    if (user.user_metadata?.full_name) {
      const nameParts = user.user_metadata.full_name.split(" ")
      if (nameParts.length >= 2) {
        form.setValue("first_name", nameParts[0])
        form.setValue("last_name", nameParts.slice(1).join(" "))
      }
    }

    // If Google OAuth user and has phone, populate mobile phone
    if (user.app_metadata?.provider === "google" && user.phone) {
      form.setValue("mobile_phone", user.phone)
    }
  }, [user, profileData, form])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return

    setLoading(true)
    try {
      // Prepare data for insertion
      const doctorData = {
        user_id: user.id,
        title: values.title,
        first_name: values.first_name,
        last_name: values.last_name,
        position: values.position === "Other" ? values.position_other : values.position,
        position_other: values.position === "Other" ? values.position_other : null,
        practice_name: values.practice_name,
        practice_address: `${values.street_address}, ${values.suburb}, ${values.city}, ${values.postal_code}`,
        specialty: values.specialty === "Other" ? values.specialty_other : values.specialty,
        specialty_other: values.specialty === "Other" ? values.specialty_other : null,
        phone_number: values.phone_number || null,
        mobile_phone: values.mobile_phone || null,
        communication_preference: values.communication_preference,
        patient_count: values.patient_count,
        pms_system: values.pms_system || null,
        booking_system: values.booking_system || null,
        clinic_type: values.clinic_type === "Other" ? values.clinic_type_other : values.clinic_type,
        clinic_type_other: values.clinic_type === "Other" ? values.clinic_type_other : null,
        country: values.country === "Other" ? values.country_other : values.country,
        country_other: values.country === "Other" ? values.country_other : null,
        onboarding_step: 1,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("newsletter_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      let data, error

      if (existingProfile) {
        // Update existing profile
        const result = await supabase.from("newsletter_profiles").update(doctorData).eq("user_id", user.id).select()
        data = result.data
        error = result.error
      } else {
        // Insert new profile
        const result = await supabase.from("newsletter_profiles").insert(doctorData).select()
        data = result.data
        error = result.error
      }

      if (error) {
        console.error("Error saving doctor data:", error)
        alert("There was an error saving your information. Please try again.")
      } else {
 feat/onboarding-no-step2-flash
        // Navigate to dashboard

        // ✅ NEW: go straight to dashboard, not step 2
 main
        router.replace("/dashboard")
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#363637] mb-2">Tell Us About Yourself</h1>
            <p className="text-[#3458d5]">Let's get to know you and your practice</p>
          </div>

          <div
            className="bg-blue-600 rounded-2xl p-8 shadow-xl border border-blue-700"
            style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
          >
            <div className="bg-white rounded-xl p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Identity Section */}
                  {/* ... (unchanged sections) ... */}

                  {/* Identity */}
                  {/* [keep your existing Identity, Practice, Contact, Operational sections unchanged] */}

                  {/* Submit */}
                  <div className="pt-6 flex justify-center">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg
                                 bg-gradient-to-r from-pink-500 to-blue-600
                                 hover:from-pink-600 hover:to-blue-700
                                 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      style={{ opacity: 1 }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}