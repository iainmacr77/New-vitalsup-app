import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const updates = body.updates
    if (!Array.isArray(updates)) {
      return NextResponse.json({ message: "Invalid updates array." }, { status: 400 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ message: "Supabase environment variables not set." }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    for (const update of updates) {
      if (!update.id || !update.status) continue
      const { error } = await supabase
        .from("discovered_articles")
        .update({ triage_status: update.status })
        .eq("id", update.id)
      if (error) {
        return NextResponse.json({ message: `Failed to update article ${update.id}: ${error.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "Triage statuses updated successfully." })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Server error." }, { status: 500 })
  }
} 