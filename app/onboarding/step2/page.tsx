"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Upload, X, ChevronLeft, ChevronRight, Mail, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Form schema
const formSchema = z.object({
  newsletter_name: z.string().default("An Apple a Day"),
  background_color: z.string().default("soft-blue"),
  headshot_url: z.string().optional(),
  welcome_message: z
    .string()
    .default('👋 Hello and welcome to this week\'s "An Apple a Day" — your trusted guide to staying happy and healthy.'),
  sender_email: z.string().email().optional(),
  custom_sender_domain: z.boolean().default(false),
  sending_frequency: z.string().default("bi-weekly"),
})

// Background color options
const backgroundColors = [
  { id: "soft-blue", name: "Soft Blue", value: "#E6F3FF", textColor: "#333333" },
  { id: "mint-green", name: "Mint Green", value: "#E6FFF2", textColor: "#333333" },
  { id: "lavender", name: "Lavender", value: "#F2E6FF", textColor: "#333333" },
  { id: "peach", name: "Peach", value: "#FFE6E6", textColor: "#333333" },
  { id: "light-yellow", name: "Light Yellow", value: "#FFFDE6", textColor: "#333333" },
]

// Frequency options
const frequencyOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Every 2 Weeks" },
  { value: "monthly", label: "Monthly (Every 4 Weeks)" },
]

export default function OnboardingStep2() {
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [doctorData, setDoctorData] = useState<any>(null)
  const [previewTab, setPreviewTab] = useState("edit")
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newsletter_name: "An Apple a Day",
      background_color: "soft-blue",
      headshot_url: "",
      welcome_message:
        '👋 Hello and welcome to this week\'s "An Apple a Day" — your trusted guide to staying happy and healthy.',
      sender_email: "",
      custom_sender_domain: false,
      sending_frequency: "bi-weekly",
    },
  })

  // watchers
  const watchNewsletterName = form.watch("newsletter_name")
  const watchBackgroundColor = form.watch("background_color")
  const watchHeadshotUrl = form.watch("headshot_url")
  const watchWelcomeMessage = form.watch("welcome_message")
  const watchSenderEmail = form.watch("sender_email")
  const watchCustomSenderDomain = form.watch("custom_sender_domain")
  const watchSendingFrequency = form.watch("sending_frequency")

  // Fetch user → entitlements → guard access → ensure profile → load profile
  useEffect(() => {
    const run = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        router.push("/login")
        return
      }
      setUser(userData.user)

      // pull user entitlements (first org)
      const { data: ents, error: entError } = await supabase
        .from("user_entitlements_v")
        .select("*")
        .eq("user_id", userData.user.id)

      if (entError || !ents || ents.length === 0) {
        // no org yet → send to dashboard to recover
        router.replace("/dashboard")
        return
      }

      const ent = ents[0]
      setDoctorId(ent.doctor_id)

      // guard: needs patient newsletters entitlement
      if (!ent.can_patient_newsletters) {
        router.replace("/dashboard")
        return
      }

      // safety: ensure profile exists (no-op if present)
      await supabase.rpc("ensure_newsletter_profile", { _doctor_id: ent.doctor_id })

      // load profile for this org (not by user_id to avoid ambiguity)
      const { data: profile, error: profErr } = await supabase
        .from("newsletter_profiles")
        .select("*")
        .eq("id", ent.doctor_id)
        .maybeSingle()

      if (profErr || !profile) {
        router.replace("/dashboard")
        return
      }

      setDoctorData(profile)

      // prefill form
      form.reset({
        newsletter_name: profile.newsletter_name || "An Apple a Day",
        background_color: profile.newsletter_background_color || "soft-blue",
        headshot_url: profile.headshot_url || "",
        welcome_message:
          profile.newsletter_welcome_message ||
          '👋 Hello and welcome to this week\'s "An Apple a Day" — your trusted guide to staying happy and healthy.',
        sender_email: profile.sender_email || userData.user.email || "",
        custom_sender_domain: profile.custom_sender_domain || false,
        sending_frequency: profile.sending_frequency || "bi-weekly",
      })

      if (profile.newsletter_background_color) {
        const idx = backgroundColors.findIndex((c) => c.id === profile.newsletter_background_color)
        if (idx !== -1) setCurrentColorIndex(idx)
      }
    }

    run()
  }, [router, form])

  // uploads
  const handleHeadshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploadLoading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `headshots/${fileName}`

      const { error: uploadError } = await supabase.storage.from("doctor-headshots").upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from("doctor-headshots").getPublicUrl(filePath)
      if (publicUrlData) form.setValue("headshot_url", publicUrlData.publicUrl)
    } catch (e) {
      console.error("Error uploading headshot:", e)
      alert("There was an error uploading your headshot. Please try again.")
    } finally {
      setUploadLoading(false)
    }
  }

  // color nav
  const navigateColor = (direction: "next" | "prev") => {
    const nextIndex =
      direction === "next"
        ? (currentColorIndex + 1) = (currentColorIndex + 1) % backgroundColors.length
        : (currentColorIndex - 1 + backgroundColors.length) % backgroundColors.length
    setCurrentColorIndex(nextIndex)
    form.setValue("background_color", backgroundColors[nextIndex].id)
  }

  // submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !doctorId) return

    setLoading(true)
    try {
      // Generate sender email if using custom domain
      let senderEmail = values.sender_email
      if (values.custom_sender_domain) {
        const doctorName = `${doctorData?.last_name || "doctor"}`.toLowerCase().replace(/\s+/g, "")
        senderEmail = `no-reply@${doctorName}.vitalsup.com`
      }

      const { error } = await supabase
        .from("newsletter_profiles")
        .update({
          newsletter_name: values.newsletter_name,
          newsletter_background_color: values.background_color,
          headshot_url: values.headshot_url,
          newsletter_welcome_message: values.welcome_message,
          sender_email: senderEmail,
          custom_sender_domain: values.custom_sender_domain,
          sending_frequency: values.sending_frequency,
          onboarding_step: 2,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", doctorId)

      if (error) throw error

      router.replace("/dashboard")
    } catch (error) {
      console.error("Error saving newsletter settings:", error)
      alert("There was an error saving your newsletter settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // preview helpers
  const currentColor = backgroundColors[currentColorIndex]
  const currentDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  const generateCustomDomain = () =>
    `no-reply@${`${doctorData?.last_name || "doctor"}`.toLowerCase().replace(/\s+/g, "")}.vitalsup.com`

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
          <div className="text-sm text-gray-500">Step 2 of 4</div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#363637] mb-2">Design Your Newsletter</h1>
            <p className="text-[#3458d5]">Customize how your newsletter will look to your patients</p>
          </div>

          <Tabs value={previewTab} onValueChange={setPreviewTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-[400px] mx-auto mb-6">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <div
              className="bg-blue-600 rounded-2xl p-8 shadow-xl border border-blue-700"
              style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
            >
              <div className="bg-white rounded-xl p-6">
                <TabsContent value="edit">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      {/* Newsletter Name */}
                      <div>
                        <h2 className="text-xl font-semibold text-[#363637] mb-4">Newsletter Name</h2>
                        <FormField
                          control={form.control}
                          name="newsletter_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Newsletter Title</FormLabel>
                              <FormControl>
                                <Input placeholder="An Apple a Day" {...field} />
                              </FormControl>
                              <FormDescription>This will appear as the title of your newsletter</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      {/* Background Color */}
                      <div>
                        <h2 className="text-xl font-semibold text-[#363637] mb-4">Background Color</h2>
                        <div className="flex items-center justify-center space-x-4">
                          <Button type="button" variant="outline" size="icon" onClick={() => navigateColor("prev")} className="rounded-full">
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          <div className="relative">
                            <div
                              className="w-64 h-32 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: currentColor.value, color: currentColor.textColor }}
                            >
                              <span className="font-medium">{currentColor.name}</span>
                            </div>
                          </div>

                          <Button type="button" variant="outline" size="icon" onClick={() => navigateColor("next")} className="rounded-full">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-center mt-2">
                          <div className="flex space-x-1">
                            {backgroundColors.map((color, index) => (
                              <div key={color.id} className={`w-2 h-2 rounded-full ${index === currentColorIndex ? "bg-blue-600" : "bg-gray-300"}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Headshot Upload */}
                      <div>
                        <h2 className="text-xl font-semibold text-[#363637] mb-4">Your Headshot (Optional)</h2>
                        <div className="flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            {watchHeadshotUrl ? (
                              <div className="relative">
                                <img src={watchHeadshotUrl || "/placeholder.svg"} alt="Doctor headshot" className="w-32 h-32 object-cover rounded-full border-2 border-gray-200" />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={() => form.setValue("headshot_url", "")}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                                <Upload className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name="headshot_url"
                              render={() => (
                                <FormItem>
                                  <FormLabel>Upload Your Photo</FormLabel>
                                  <FormControl>
                                    <div>
                                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleHeadshotUpload} className="hidden" />
                                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadLoading} className="w-full">
                                        {uploadLoading ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="mr-2 h-4 w-4" /> Upload Headshot
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormDescription>Upload a professional headshot to personalize your newsletter (recommended size: 400x400px)</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Welcome Message */}
                      <div>
                        <h2 className="text-xl font-semibold text-[#363637] mb-4">Welcome Message</h2>
                        <FormField
                          control={form.control}
                          name="welcome_message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Personalized Welcome</FormLabel>
                              <FormControl>
                                <Textarea placeholder="👋 Hello and welcome to this week's newsletter..." className="min-h-[100px]" {...field} />
                              </FormControl>
                              <FormDescription>This message will appear at the top of each newsletter</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      {/* Sender Email */}
                      <div>
                        <h2 className="text-xl font-semibold text-[#363637] mb-4">Sender Email</h2>
                        <FormField
                          control={form.control}
                          name="custom_sender_domain"
                          render={({ field }) => (
                            <FormItem className="space-y-3 mb-4">
                              <FormLabel>Email Address Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) => field.onChange(value === "true")}
                                  defaultValue={field.value ? "true" : "false"}
                                  className="flex flex-col space-y-1"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="false" id="use-own-email" />
                                    <label htmlFor="use-own-email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      Use my own email address
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="true" id="use-custom-domain" />
                                    <label htmlFor="use-custom-domain" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      Use VitalsUp custom domain
                                    </label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {!watchCustomSenderDomain && (
                          <FormField
                            control={form.control}
                            name="sender_email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="doctor@example.com" {...field} />
                                </FormControl>
                                <FormDescription>This email will be used as the sender address for your newsletters</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {watchCustomSenderDomain && (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <Mail className="h-5 w-5 text-gray-500 mr-2" />
                              <span className="text-sm font-medium">{generateCustomDomain()}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">We'll create a professional no-reply email address for your practice</p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Sending Frequency */}
                      <div>
                        <h2 className="text-xl font-semibold text-[#363637] mb-4">Sending Frequency</h2>
                        <FormField
                          control={form.control}
                          name="sending_frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>How often would you like to send newsletters?</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {frequencyOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>You can change this setting later in your dashboard</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push("/dashboard")}
                          className="px-8"
                        >
                          Back
                        </Button>

                        <Button
                          type="submit"
                          className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg
                                     bg-gradient-to-r from-pink-500 to-blue-600
                                     hover:from-pink-600 hover:to-blue-700
                                     focus:outline-none focus:ring-2 focus:ring-pink-300"
                          style={{ opacity: 1 }}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                          ) : (
                            "Save & Finish"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="preview">
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl">
                      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                        {/* Newsletter Preview */}
                        <div
                          className="p-6"
                          style={{
                            backgroundColor:
                              backgroundColors.find((c) => c.id === watchBackgroundColor)?.value || "#E6F3FF",
                          }}
                        >
                          <div className="flex justify-between items-center mb-6">
                            <div className="text-sm text-gray-600">{currentDate}</div>
                            <div className="text-sm text-blue-600">Read Online</div>
                          </div>

                          <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                              Blood Measurements, Not Guesswork: The Future of Aging Assessment?
                            </h1>
                            <p className="text-gray-600">
                              Up-to-date science, trusted information and tips to help you live better.
                            </p>
                          </div>

                          <div className="flex justify-end space-x-2 mb-6">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-500">f</span>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-500">X</span>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-500">@</span>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-500">in</span>
                            </div>
                          </div>

                          <div className="flex items-center mb-6">
                            {watchHeadshotUrl ? (
                              <img src={watchHeadshotUrl || "/placeholder.svg"} alt="Doctor headshot" className="w-24 h-24 object-cover rounded-full mr-6" />
                            ) : (
                              <div className="w-24 h-24 bg-gray-200 rounded-full mr-6 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                            <div className="text-2xl font-bold text-gray-800">
                              {watchNewsletterName || "An Apple a Day"}
                              <span className="text-xl">🍎</span>
                            </div>
                          </div>

                          <div className="mb-6">
                            <p className="text-gray-800">
                              {watchWelcomeMessage ||
                                '👋 Hello and welcome to this week\'s "An Apple a Day" — your trusted guide to staying happy and healthy.'}
                            </p>
                          </div>

                          <div className="mb-6">
                            <h2 className="font-medium text-gray-800 mb-2">In this edition:</h2>
                            <ul className="space-y-2">
                              <li className="flex items-start">
                                <span className="text-red-600 mr-2">🩸</span>
                                <span className="text-gray-800">Can your blood predict your real age?</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-600 mr-2">🥗</span>
                                <span className="text-gray-800">Nutrition tips for healthy aging</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-blue-600 mr-2">💤</span>
                                <span className="text-gray-800">Sleep quality and longevity</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-white p-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                <span>
                                  From:{" "}
                                  {watchCustomSenderDomain ? generateCustomDomain() : watchSenderEmail || "your.email@example.com"}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>
                                  Frequency:{" "}
                                  {frequencyOptions.find((f) => f.value === watchSendingFrequency)?.label || "Every 2 Weeks"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <Button type="button" onClick={() => setPreviewTab("edit")} className="flex items-center">
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back to Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}