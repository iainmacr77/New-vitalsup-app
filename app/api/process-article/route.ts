import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json()
    
    // Validate that input field exists and is not empty
    if (!body.input || typeof body.input !== 'string' || body.input.trim() === '') {
      return NextResponse.json(
        { error: "Input field is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables not configured" },
        { status: 500 }
      )
    }

    // Proxy the request to the Supabase edge function
    // This approach avoids CORS issues by proxying through the Next.js API route
    // Edge Functions gateway requires an API key even when verify_jwt:false
    const targetUrl = `${supabaseUrl}/functions/v1/process-article`
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    // Get the response data
    const responseData = await response.json()

    // Return the edge function's response with the same status code
    return NextResponse.json(responseData, { status: response.status })

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle non-POST requests
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { 'Allow': 'POST' } }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { 'Allow': 'POST' } }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { 'Allow': 'POST' } }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { 'Allow': 'POST' } }
  )
} 