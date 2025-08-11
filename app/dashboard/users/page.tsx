"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, UserPlus, Mail, Check, AlertCircle, Trash2, Shield, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

// Form schema for inviting users
const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["owner", "manager", "assistant", "viewer"], {
    required_error: "Please select a role",
  }),
})

// Role descriptions and permissions
const roleDescriptions = {
  owner: {
    title: "Owner",
    description: "Full control including user management",
    permissions: ["Edit profile", "Edit template", "Approve articles", "Send newsletters", "Manage users"],
    color: "bg-blue-500",
  },
  manager: {
    title: "Manager",
    description: "Full control except user management",
    permissions: ["Edit profile", "Edit template", "Approve articles", "Send newsletters"],
    color: "bg-green-500",
  },
  assistant: {
    title: "Assistant",
    description: "Can help with content selection",
    permissions: ["View profile", "Suggest articles"],
    color: "bg-yellow-500",
  },
  viewer: {
    title: "Viewer",
    description: "Read-only access",
    permissions: ["View profile", "View statistics"],
    color: "bg-gray-500",
  },
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [newsletterProfile, setNewsletterProfile] = useState<any>(null)
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  // Initialize form
  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "viewer",
    },
  })

  // Fetch current user, newsletter profile, and user roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) {
          router.push("/login")
          return
        }

        setCurrentUser(userData.user)

        // Get user's role for any newsletter profile
        const { data: userRoleData, error: userRoleError } = await supabase
          .from("user_newsletter_roles")
          .select("*, newsletter_profile:newsletter_profiles(*)")
          .eq("user_id", userData.user.id)
          .single()

        if (userRoleError && userRoleError.code !== "PGRST116") {
          console.error("Error fetching user role:", userRoleError)
          toast({
            title: "Error",
            description: "Failed to fetch your role information",
            variant: "destructive",
          })
          return
        }

        if (!userRoleData) {
          toast({
            title: "No newsletter profile found",
            description: "You don't have access to any newsletter profiles",
            variant: "destructive",
          })
          router.push("/welcome")
          return
        }

        setUserRole(userRoleData.role)
        setNewsletterProfile(userRoleData.newsletter_profile)

        // Check if user has permission to view this page
        if (!["owner", "manager"].includes(userRoleData.role)) {
          toast({
            title: "Access denied",
            description: "You don't have permission to manage users",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        // Get all users for this newsletter profile
        const { data: allUserRoles, error: allUserRolesError } = await supabase
          .from("user_newsletter_roles")
          .select(`
            id,
            role,
            invitation_accepted,
            invitation_email,
            created_at,
            user:user_id(id, email, user_metadata),
            invited_by(id, email, user_metadata)
          `)
          .eq("newsletter_profile_id", userRoleData.newsletter_profile_id)
          .order("created_at", { ascending: false })

        if (allUserRolesError) {
          console.error("Error fetching user roles:", allUserRolesError)
          toast({
            title: "Error",
            description: "Failed to fetch team members",
            variant: "destructive",
          })
          return
        }

        setUserRoles(allUserRoles || [])
      } catch (error) {
        console.error("Error in fetchData:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Handle inviting a new user
  const handleInviteUser = async (values: z.infer<typeof inviteFormSchema>) => {
    if (!newsletterProfile || !currentUser) return

    try {
      setInviting(true)

      // Check if user is already invited
      const { data: existingInvite } = await supabase
        .from("user_newsletter_roles")
        .select("id")
        .eq("newsletter_profile_id", newsletterProfile.id)
        .eq("invitation_email", values.email)
        .maybeSingle()

      if (existingInvite) {
        toast({
          title: "Already invited",
          description: "This email has already been invited to this newsletter profile",
          variant: "destructive",
        })
        return
      }

      // Generate a random invitation token
      const invitationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      // Set expiration date (7 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Create the invitation
      const { error } = await supabase.from("user_newsletter_roles").insert({
        newsletter_profile_id: newsletterProfile.id,
        role: values.role,
        invited_by: currentUser.id,
        invitation_email: values.email,
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString(),
        invitation_accepted: false,
      })

      if (error) {
        console.error("Error creating invitation:", error)
        toast({
          title: "Error",
          description: "Failed to create invitation",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would send an email with the invitation link
      // For now, we'll just show a success message

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${values.email}`,
      })

      // Reset form and close dialog
      form.reset()
      setInviteDialogOpen(false)

      // Refresh user roles
      const { data: updatedUserRoles } = await supabase
        .from("user_newsletter_roles")
        .select(`
          id,
          role,
          invitation_accepted,
          invitation_email,
          created_at,
          user:user_id(id, email, user_metadata),
          invited_by(id, email, user_metadata)
        `)
        .eq("newsletter_profile_id", newsletterProfile.id)
        .order("created_at", { ascending: false })

      if (updatedUserRoles) {
        setUserRoles(updatedUserRoles)
      }
    } catch (error) {
      console.error("Error inviting user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the invitation",
        variant: "destructive",
      })
    } finally {
      setInviting(false)
    }
  }

  // Handle removing a user
  const handleRemoveUser = async (roleId: string, email: string) => {
    if (!newsletterProfile || !currentUser) return

    try {
      setLoading(true)

      const { error } = await supabase.from("user_newsletter_roles").delete().eq("id", roleId)

      if (error) {
        console.error("Error removing user:", error)
        toast({
          title: "Error",
          description: "Failed to remove user",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "User removed",
        description: `${email} has been removed from this newsletter profile`,
      })

      // Refresh user roles
      const { data: updatedUserRoles } = await supabase
        .from("user_newsletter_roles")
        .select(`
          id,
          role,
          invitation_accepted,
          invitation_email,
          created_at,
          user:user_id(id, email, user_metadata),
          invited_by(id, email, user_metadata)
        `)
        .eq("newsletter_profile_id", newsletterProfile.id)
        .order("created_at", { ascending: false })

      if (updatedUserRoles) {
        setUserRoles(updatedUserRoles)
      }
    } catch (error) {
      console.error("Error removing user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing the user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle changing a user's role
  const handleChangeRole = async (roleId: string, newRole: string, email: string) => {
    if (!newsletterProfile || !currentUser || userRole !== "owner") return

    try {
      setLoading(true)

      const { error } = await supabase.from("user_newsletter_roles").update({ role: newRole }).eq("id", roleId)

      if (error) {
        console.error("Error changing role:", error)
        toast({
          title: "Error",
          description: "Failed to change user role",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Role updated",
        description: `${email}'s role has been updated to ${roleDescriptions[newRole as keyof typeof roleDescriptions].title}`,
      })

      // Refresh user roles
      const { data: updatedUserRoles } = await supabase
        .from("user_newsletter_roles")
        .select(`
          id,
          role,
          invitation_accepted,
          invitation_email,
          created_at,
          user:user_id(id, email, user_metadata),
          invited_by(id, email, user_metadata)
        `)
        .eq("newsletter_profile_id", newsletterProfile.id)
        .order("created_at", { ascending: false })

      if (updatedUserRoles) {
        setUserRoles(updatedUserRoles)
      }
    } catch (error) {
      console.error("Error changing role:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while changing the role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get user's name or email
  const getUserDisplayName = (userObj: any) => {
    if (!userObj) return "Unknown"
    return userObj.user_metadata?.full_name || userObj.email || "Unknown"
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading user management...</p>
        </div>
      </div>
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
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage team members for your practice</p>
      </div>

      {/* Role Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Understanding User Roles
          </CardTitle>
          <CardDescription>
            Each user has a specific role that determines what they can do in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(roleDescriptions).map(([role, { title, description, permissions, color }]) => (
              <div key={role} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${color}`} />
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">{description}</p>
                <div className="space-y-1">
                  {permissions.map((permission) => (
                    <div key={permission} className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            People with access to {newsletterProfile?.practice_name || "this newsletter profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userRoles.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No team members found</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setInviteDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Your First Team Member
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-4 text-sm font-medium">
                  <div className="col-span-4">User</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-3">Actions</div>
                </div>
                <div className="divide-y">
                  {userRoles.map((userRole) => {
                    const email = userRole.user?.email || userRole.invitation_email
                    const name = getUserDisplayName(userRole.user)
                    const isCurrentUser = currentUser?.id === userRole.user?.id
                    const isPending = !userRole.invitation_accepted && !userRole.user
                    const role = userRole.role as keyof typeof roleDescriptions

                    return (
                      <div key={userRole.id} className="grid grid-cols-12 gap-2 p-4">
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium uppercase text-primary">
                            {name[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{name}</span>
                            <span className="text-xs text-muted-foreground">{email}</span>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${roleDescriptions[role].color}`} />
                            <span>{roleDescriptions[role].title}</span>
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center">
                          {isPending ? (
                            <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700">
                              <AlertCircle className="h-3 w-3" />
                              <span>Invitation Pending</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700">
                              <Check className="h-3 w-3" />
                              <span>Active</span>
                            </Badge>
                          )}
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                          {userRole !== "owner" && (
                            <Select
                              defaultValue={userRole.role}
                              onValueChange={(newRole) => handleChangeRole(userRole.id, newRole, email)}
                              disabled={isCurrentUser || userRole === "owner"}
                            >
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue placeholder="Change role" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(roleDescriptions).map(([role, { title }]) => (
                                  <SelectItem key={role} value={role}>
                                    {title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {!isCurrentUser && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will revoke {name}'s access to this newsletter profile. This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveUser(userRole.id, email)}
                                    className="bg-red-500 text-white hover:bg-red-600"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {userRoles.length} team member{userRoles.length !== 1 ? "s" : ""}
            </p>
            <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
