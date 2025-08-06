"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Plus, Minus, Eye, EyeOff, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Form schemas
const profileSchema = z.object({
  title: z.string().min(1, "Please select a title"),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  position: z.string().min(1, "Please select your position"),
  position_other: z.string().optional(),
  practice_name: z.string().min(2, "Practice name must be at least 2 characters"),
  practice_address: z.string().min(5, "Practice address must be at least 5 characters"),
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

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Dropdown options (same as onboarding)
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

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [doctorData, setDoctorData] = useState<any>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  // Initialize forms
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Watch form values
  const watchPosition = profileForm.watch("position")
  const watchSpecialty = profileForm.watch("specialty")
  const watchClinicType = profileForm.watch("clinic_type")
  const watchCountry = profileForm.watch("country")
  const watchPatientCount = profileForm.watch("patient_count")

  // Fetch user and doctor data
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (userData?.user) {
        setUser(userData.user)

        const { data: doctorData } = await supabase
          .from("doctors")
          .select("*")
          .eq("user_id", userData.user.id)
          .maybeSingle()

        if (doctorData) {
          setDoctorData(doctorData)
          profileForm.reset({
            title: doctorData.title || "",
            first_name: doctorData.first_name || "",
            last_name: doctorData.last_name || "",
            position: doctorData.position || "",
            position_other: doctorData.position_other || "",
            practice_name: doctorData.practice_name || "",
            practice_address: doctorData.practice_address || "",
            specialty: doctorData.specialty || "",
            specialty_other: doctorData.specialty_other || "",
            phone_number: doctorData.phone_number || "",
            mobile_phone: doctorData.mobile_phone || "",
            communication_preference: doctorData.communication_preference || "",
            patient_count: doctorData.patient_count || 1000,
            pms_system: doctorData.pms_system || "",
            booking_system: doctorData.booking_system || "",
            clinic_type: doctorData.clinic_type || "",
            clinic_type_other: doctorData.clinic_type_other || "",
            country: doctorData.country || "South Africa",
            country_other: doctorData.country_other || "",
          })
        }
      } else {
        router.push("/login")
      }
    }

    fetchData()
  }, [router, profileForm])

  // Handle patient count adjustment
  const adjustPatientCount = (increment: boolean) => {
    const currentCount = watchPatientCount || 1000
    const newCount = increment ? currentCount + 50 : Math.max(0, currentCount - 50)
    profileForm.setValue("patient_count", newCount)
  }

  // Handle profile form submission
  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return

    setLoading(true)
    try {
      const updateData = {
        title: values.title,
        first_name: values.first_name,
        last_name: values.last_name,
        position: values.position === "Other" ? values.position_other : values.position,
        practice_name: values.practice_name,
        practice_address: values.practice_address,
        specialty: values.specialty === "Other" ? values.specialty_other : values.specialty,
        phone_number: values.phone_number || null,
        mobile_phone: values.mobile_phone || null,
        communication_preference: values.communication_preference,
        patient_count: values.patient_count,
        pms_system: values.pms_system || null,
        booking_system: values.booking_system || null,
        clinic_type: values.clinic_type === "Other" ? values.clinic_type_other : values.clinic_type,
        country: values.country === "Other" ? values.country_other : values.country,
      }

      const { error } = await supabase.from("doctors").update(updateData).eq("user_id", user.id)

      if (error) throw error

      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("There was an error updating your profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle password change
  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      })

      if (error) throw error

      alert("Password updated successfully!")
      passwordForm.reset()
    } catch (error) {
      console.error("Error updating password:", error)
      alert("There was an error updating your password. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 h-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal and practice information</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    {/* Identity Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Identity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select title" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {titleOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your position" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {positionOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {watchPosition === "Other" && (
                        <div className="mt-4">
                          <FormField
                            control={profileForm.control}
                            name="position_other"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Please specify your position</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your position" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={profileForm.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Practice Info Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Practice Information</h3>
                      <div className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="practice_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Practice Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your practice name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="practice_address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Practice Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter your practice address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="specialty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medical Specialty</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your medical specialty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-80">
                                  {specialtyOptions.map((specialty) => (
                                    <SelectItem key={specialty} value={specialty}>
                                      {specialty}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watchSpecialty === "Other" && (
                          <FormField
                            control={profileForm.control}
                            name="specialty_other"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Please specify your specialty</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your medical specialty" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Info Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="phone_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Office Phone Number</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="Enter office phone number" {...field} />
                                </FormControl>
                                <FormDescription>Practice landline (optional)</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="mobile_phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mobile Phone Number</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="Enter mobile phone number" {...field} />
                                </FormControl>
                                <FormDescription>Personal mobile (optional)</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={profileForm.control}
                          name="communication_preference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Communication Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select preferred communication method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {communicationOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Operational Info Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Operational Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="patient_count"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Approximate Number of Patients</FormLabel>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => adjustPatientCount(false)}
                                  className="h-10 w-10"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="text-center"
                                    value={watchPatientCount}
                                    onChange={(e) => profileForm.setValue("patient_count", Number(e.target.value))}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => adjustPatientCount(true)}
                                  className="h-10 w-10"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormDescription>Use +/- buttons to adjust by 50</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="clinic_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Clinic Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select clinic type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {clinicTypeOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>Optional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {watchClinicType === "Other" && (
                        <div className="mt-4">
                          <FormField
                            control={profileForm.control}
                            name="clinic_type_other"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Please specify your clinic type</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your clinic type" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={profileForm.control}
                          name="pms_system"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Practice Management System (PMS)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Medemass, HealthOne" {...field} />
                              </FormControl>
                              <FormDescription>Optional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="booking_system"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Booking System</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Recomed, Calendly" {...field} />
                              </FormControl>
                              <FormDescription>Optional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={profileForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countryOptions.map((country) => (
                                    <SelectItem key={country} value={country}>
                                      {country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watchCountry === "Other" && (
                          <div className="mt-4">
                            <FormField
                              control={profileForm.control}
                              name="country_other"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Please specify your country</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your country" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button type="submit" disabled={loading} className="w-full md:w-auto">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Profile"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password for security</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter your current password"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormDescription>Password must be at least 8 characters long</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your new password"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
