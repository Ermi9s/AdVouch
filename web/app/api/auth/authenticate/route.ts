import { NextRequest, NextResponse } from "next/server"

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth:8080"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[API Route] Proxying authenticate request to:", `${AUTH_SERVICE_URL}/api/v1/authenticate`)
    console.log("[API Route] Request body:", body)

    const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[API Route] Authenticate error:", errorText)
      return NextResponse.json(
        { error: "Failed to authenticate" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[API Route] Authenticate response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API Route] Authenticate failed:", error)
    return NextResponse.json(
      { error: "Failed to connect to auth service" },
      { status: 500 }
    )
  }
}

