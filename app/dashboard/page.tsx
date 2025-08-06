"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Mail,
  Users,
  MousePointer,
  UserMinus,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock data - replace with real data from your backend
const mockMetrics = {
  emailsSent: 2847,
  openRate: 68.5,
  clickThroughRate: 12.3,
  bookingClicks: 89,
  unsubscribes: 23,
  subscribers: 1456,
  lastNewsletterDate: "2024-05-28",
  nextNewsletterDate: "2024-06-11",
}

const mockPendingArticles = [
  {
    id: 1,
    title: "The Science Behind Sleep and Heart Health",
    category: "Cardiology",
    readTime: "3 min",
    selected: false,
  },
  {
    id: 2,
    title: "Managing Diabetes Through Diet: Latest Research",
    category: "Endocrinology",
    readTime: "4 min",
    selected: true,
  },
  {
    id: 3,
    title: "Mental Health in the Digital Age",
    category: "Psychology",
    readTime: "5 min",
    selected: false,
  },
  {
    id: 4,
    title: "Breakthrough in Cancer Immunotherapy",
    category: "Oncology",
    readTime: "6 min",
    selected: true,
  },
  {
    id: 5,
    title: "Exercise Prescription for Chronic Pain",
    category: "Physiotherapy",
    readTime: "4 min",
    selected: false,
  },
]

const timeRangeOptions = [
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "3months", label: "Last 3 Months" },
  { value: "6months", label: "Last 6 Months" },
  { value: "year", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("month")
  const [newsletterProfile, setNewsletterProfile] = useState<any>(null)
  const [pendingArticles, setPendingArticles] = useState(mockPendingArticles)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchNewsletterProfile = async () => {
      try {
        console.log("Dashboard: Fetching newsletter profile...")
        const { data: userData } = await supabase.auth.getUser()

        if (userData?.user) {
          console.log("Dashboard: User found:", userData.user.id)

          // FIXED: Query newsletter_profiles instead of doctors
          const { data: profileData, error: profileError } = await supabase
            .from("newsletter_profiles")
            .select("*")
            .eq("user_id", userData.user.id)
            .maybeSingle()

          console.log("Dashboard: Profile query result:", profileData, profileError)

          if (profileError) {
            console.error("Error fetching newsletter profile:", profileError)
            setError(`Error loading profile: ${profileError.message}`)
          } else if (profileData) {
            setNewsletterProfile(profileData)
            console.log("Dashboard: Profile loaded successfully")

            // Check email configuration status for alerts
            if (profileData.from_email_option === "custom_domain") {
              console.log("Dashboard: Custom domain status:", profileData.custom_domain_status)
            }
          } else {
            console.log("Dashboard: No profile found")
            setError("No newsletter profile found")
          }
        }
      } catch (error) {
        console.error("Error in fetchNewsletterProfile:", error)
        setError(`Unexpected error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchNewsletterProfile()
  }, [])

  const selectedArticlesCount = pendingArticles.filter((article) => article.selected).length
  const needsMoreArticles = selectedArticlesCount < 3

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Iain! 👋</p>
        </div>

      {/* Pending Actions Alert */}
      {needsMoreArticles && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Action Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              Your next newsletter is scheduled for{" "}
              <strong>{new Date(mockMetrics.nextNewsletterDate).toLocaleDateString()}</strong>. You need to select{" "}
              {3 - selectedArticlesCount} more article{3 - selectedArticlesCount !== 1 ? "s" : ""} from the Article
              Feed.
            </p>
            <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
              <a href="/dashboard/articles">
                <FileText className="mr-2 h-4 w-4" />
                Select Articles
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Email Configuration Status Alerts */}
      {newsletterProfile?.from_email_option === "custom_domain" && (
        <>
          {newsletterProfile.custom_domain_status === "pending" && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-blue-800">Custom Domain Setup In Progress</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-3">
                  We're still configuring your custom domain <strong>{newsletterProfile.custom_domain}</strong> for
                  newsletter sending. This typically takes 24-48 hours to complete.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-100"
                  >
                    <a href="/dashboard/email-settings">
                      <Settings className="mr-2 h-4 w-4" />
                      View Email Settings
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-100"
                  >
                    <a href="mailto:support@vitalsup.co.za">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {newsletterProfile.custom_domain_status === "failed" && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-800">Custom Domain Setup Failed</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-3">
                  There was an issue setting up your custom domain <strong>{newsletterProfile.custom_domain}</strong>.
                  Your newsletters are currently being sent from our default address.
                </p>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
                    <a href="mailto:support@vitalsup.co.za">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-100"
                  >
                    <a href="/dashboard/email-settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Change Email Settings
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.emailsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.openRate}%</div>
            <Progress value={mockMetrics.openRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Industry avg: 21.3%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.bookingClicks}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.subscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">-{mockMetrics.unsubscribes} unsubscribes this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter Status & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Newsletter Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Last Newsletter</span>
              </div>
              <span className="text-sm text-green-700">
                {new Date(mockMetrics.lastNewsletterDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Next Newsletter</span>
              </div>
              <span className="text-sm text-blue-700">
                {new Date(mockMetrics.nextNewsletterDate).toLocaleDateString()}
              </span>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-3">
                Sending frequency: {newsletterProfile?.sending_frequency || "bi-weekly"}
              </p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <a href="/dashboard/template">
                  <Settings className="mr-2 h-4 w-4" />
                  Adjust Schedule
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article Selection Progress</CardTitle>
            <CardDescription>
              Select 3-5 articles for your next newsletter ({selectedArticlesCount}/5 selected)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{selectedArticlesCount}/5</span>
              </div>
              <Progress value={(selectedArticlesCount / 5) * 100} />
            </div>

            <div className="space-y-2">
              {pendingArticles.slice(0, 3).map((article) => (
                <div key={article.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.category}</p>
                  </div>
                  <Badge variant={article.selected ? "default" : "outline"} className="ml-2">
                    {article.selected ? "Selected" : "Available"}
                  </Badge>
                </div>
              ))}
            </div>

            <Button asChild className="w-full">
              <a href="/dashboard/articles">
                <FileText className="mr-2 h-4 w-4" />
                View All Articles
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>Detailed performance metrics for the selected time period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Click-Through Rate</p>
              <p className="text-2xl font-bold">{mockMetrics.clickThroughRate}%</p>
              <Progress value={mockMetrics.clickThroughRate} className="h-2" />
              <p className="text-xs text-muted-foreground">Industry avg: 2.6%</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Unsubscribe Rate</p>
              <p className="text-2xl font-bold">
                {((mockMetrics.unsubscribes / mockMetrics.emailsSent) * 100).toFixed(2)}%
              </p>
              <Progress value={(mockMetrics.unsubscribes / mockMetrics.emailsSent) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Industry avg: 0.5%</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Booking Conversion</p>
              <p className="text-2xl font-bold">
                {((mockMetrics.bookingClicks / mockMetrics.emailsSent) * 100).toFixed(2)}%
              </p>
              <Progress value={(mockMetrics.bookingClicks / mockMetrics.emailsSent) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Your unique metric</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
