import { supabase } from "./supabase"

export interface EmailFromAddress {
  name: string
  email: string
}

/**
 * Get the "from" email address for opt-in confirmation emails
 * These MUST come from the doctor's actual email address for compliance
 */
export async function getOptInFromAddress(userId: string): Promise<EmailFromAddress | null> {
  try {
    // Get user's actual email from auth
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return null

    // Get profile for name
    const { data: profile } = await supabase
      .from("newsletter_profiles")
      .select("first_name, last_name, title")
      .eq("user_id", userId)
      .maybeSingle()

    if (!profile) return null

    return {
      name: `${profile.title || "Dr."} ${profile.first_name} ${profile.last_name}`.trim(),
      email: userData.user.email || "",
    }
  } catch (error) {
    console.error("Error getting opt-in from address:", error)
    return null
  }
}

/**
 * Get the "from" email address for newsletters
 * This respects the user's configured preference
 */
export async function getNewsletterFromAddress(userId: string): Promise<EmailFromAddress | null> {
  try {
    // Get profile with email settings
    const { data: profile } = await supabase
      .from("newsletter_profiles")
      .select("first_name, last_name, title, from_email_option, custom_domain, custom_domain_status")
      .eq("user_id", userId)
      .maybeSingle()

    if (!profile) return null

    const displayName = `${profile.title || "Dr."} ${profile.first_name} ${profile.last_name}`.trim()

    // Determine email address based on settings
    let emailAddress: string

    if (
      profile.from_email_option === "custom_domain" &&
      profile.custom_domain &&
      profile.custom_domain_status === "configured"
    ) {
      // Use custom domain if configured
      emailAddress = `noreply@${profile.custom_domain}`
    } else {
      // Default to VitalsUp domain
      emailAddress = "noreply@vitalsup.co.za"
    }

    return {
      name: displayName,
      email: emailAddress,
    }
  } catch (error) {
    console.error("Error getting newsletter from address:", error)
    return null
  }
}

/**
 * Get a formatted "from" string for email headers
 */
export function formatFromAddress(fromAddress: EmailFromAddress): string {
  return `${fromAddress.name} <${fromAddress.email}>`
}

/**
 * Validate a custom domain format
 */
export function validateCustomDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
  return domainRegex.test(domain)
}
