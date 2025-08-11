"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Mail, Shield, AlertCircle, CheckCircle, ExternalLink, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Form schema
const emailSettingsSchema = z.object({
  from_email_option: z.enum(["vitalsup_default", "custom_domain"]),
  custom_domain: z.string().optional(),
  dns_host_provider: z.string().optional(),
  setup_notes: z.string().optional(),
})

const dnsProviders = [
  "Cloudflare",
  "GoDaddy",
  "Namecheap",
  "Google Domains",
  "Route 53 (AWS)",
  "DigitalOcean",
  "Hover",
  "Other",
]

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [newsletterProfile, setNewsletterProfile] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()

  // Initialize form
  const form = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      from_email_option: "vitalsup_default",
      custom_domain: "",
      dns_host_provider: "",
      setup_notes: "",
    },
  })

  // Watch form values
  const watchFromEmailOption = form.watch("from_email_option")

  // Fetch user and newsletter profile data
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (userData?.user) {
        setUser(userData.user)

        const { data: profileData } = await supabase
          .from("newsletter_profiles")
          .select("*")
          .eq("user_id", userData.user.id)
          .maybeSingle()

        if (profileData) {
          setNewsletterProfile(profileData)
          form.reset({
            from_email_option: profileData.from_email_option || "vitalsup_default",
            custom_domain: profileData.custom_domain || "",
            dns_host_provider: profileData.dns_host_provider || "",
            setup_notes: profileData.setup_notes || "",
          })
        }
      } else {
        router.push("/login")
      }
      setInitialLoading(false)
    }

    fetchData()
  }, [router, form])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof emailSettingsSchema>) => {
    if (!user || !newsletterProfile) return

    setLoading(true)
    try {
      const updateData = {
        from_email_option: values.from_email_option,
        custom_domain: values.from_email_option === "custom_domain" ? values.custom_domain : null,
        dns_host_provider: values.from_email_option === "custom_domain" ? values.dns_host_provider : null,
        setup_notes: values.from_email_option === "custom_domain" ? values.setup_notes : null,
        custom_domain_status: values.from_email_option === "custom_domain" ? "pending" : null,
      }

      const { error } = await supabase.from("newsletter_profiles").update(updateData).eq("user_id", user.id)

      if (error) throw error

      alert("Email settings updated successfully!")

      // Refresh the profile data
      const { data: updatedProfile } = await supabase
        .from("newsletter_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (updatedProfile) {
        setNewsletterProfile(updatedProfile)
      }
    } catch (error) {
      console.error("Error updating email settings:", error)
      alert("There was an error updating your email settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Email Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading email settings...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
        <p className="text-muted-foreground mt-1">Configure how your newsletters are sent to patients</p>
      </div>

      <div className="w-full space-y-6">
        {/* Opt-in Email Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Opt-in Confirmation Emails
            </CardTitle>
            <CardDescription>
              These emails are automatically sent from your registered email address for compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-800">
                  From: {newsletterProfile?.first_name} {newsletterProfile?.last_name} {"<"}
                  {user?.email}
                  {">"}
                </p>
                <p className="text-sm text-green-600 mt-1">Required by law (CAN-SPAM, GDPR) - cannot be changed</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Newsletter "From" Address
            </CardTitle>
            <CardDescription>Choose how your newsletters appear in your patients' inboxes</CardDescription>
          </CardHeader>
          <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="from_email_option"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Select Newsletter From Address Option</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid gap-4">
                            {/* Option 1: VitalsUp Default */}
                            <div className="flex items-start space-x-3 space-y-0">
                              <RadioGroupItem value="vitalsup_default" className="mt-1" />
                              <div className="flex-1">
                                <div className="p-4 border rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold">VitalsUp Default (Recommended)</h3>
                                    <Badge variant="secondary">Free</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Safe, simple, and works immediately. No setup required.
                                  </p>
                                  <div className="bg-gray-50 p-3 rounded border">
                                    <p className="font-mono text-sm">
                                      From: {newsletterProfile?.first_name} {newsletterProfile?.last_name} {"<"}
                                      noreply@vitalsup.co.za{">"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600">No DNS setup required</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Option 3: Custom Domain */}
                            <div className="flex items-start space-x-3 space-y-0">
                              <RadioGroupItem value="custom_domain" className="mt-1" />
                              <div className="flex-1">
                                <div className="p-4 border rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold">Custom Domain</h3>
                                    <Badge variant="outline">Premium</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Use your own domain for a professional appearance. Requires DNS setup.
                                  </p>
                                  <div className="bg-gray-50 p-3 rounded border">
                                    <p className="font-mono text-sm">
                                      From: {newsletterProfile?.first_name} {newsletterProfile?.last_name} {"<"}noreply@
                                      {form.watch("custom_domain") || "yourdomain.com"}
                                      {">"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm text-orange-600">Requires SPF/DKIM DNS setup</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Custom Domain Configuration */}
                  {watchFromEmailOption === "custom_domain" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-blue-900">Custom Domain Setup</h4>

                      <FormField
                        control={form.control}
                        name="custom_domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Domain</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., capetownclinic.co.za" {...field} />
                            </FormControl>
                            <FormDescription>Enter the domain you own (without "noreply@" prefix)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dns_host_provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>DNS Hosting Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your DNS provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dnsProviders.map((provider) => (
                                  <SelectItem key={provider} value={provider}>
                                    {provider}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>This helps us provide specific setup instructions</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="setup_notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any additional information about your domain setup..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          After saving, our team will contact you with specific DNS setup instructions for your
                          provider. Setup typically takes 24-48 hours to complete.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Current Status */}
                  {newsletterProfile?.from_email_option === "custom_domain" && newsletterProfile?.custom_domain && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Current Custom Domain Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Domain:</span>
                            <span className="font-mono">{newsletterProfile.custom_domain}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Status:</span>
                            <Badge
                              variant={
                                newsletterProfile.custom_domain_status === "configured"
                                  ? "default"
                                  : newsletterProfile.custom_domain_status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {newsletterProfile.custom_domain_status === "configured" && "✓ Configured"}
                              {newsletterProfile.custom_domain_status === "pending" && "⏳ Pending Setup"}
                              {newsletterProfile.custom_domain_status === "failed" && "❌ Setup Failed"}
                            </Badge>
                          </div>
                          {newsletterProfile.dns_host_provider && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium">DNS Provider:</span>
                              <span>{newsletterProfile.dns_host_provider}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="pt-6">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Email Settings"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you need assistance with custom domain setup or have questions about email deliverability:
                </p>
                <Button variant="outline" asChild>
                  <a href="mailto:support@vitalsup.co.za" className="inline-flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Contact Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }
