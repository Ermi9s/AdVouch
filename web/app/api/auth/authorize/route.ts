import { NextRequest, NextResponse } from "next/server"

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth:8080"

export async function GET(request: NextRequest) {
  try {
    console.log("[API Route] Proxying authorize request to:", `${AUTH_SERVICE_URL}/api/v1/authorize`)

    const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/authorize`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[API Route] Authorize error:", errorText)
      return NextResponse.json(
        { error: "Failed to authorize" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[API Route] Authorize response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API Route] Authorize failed:", error)
    return NextResponse.json(
      { error: "Failed to connect to auth service" },
      { status: 500 }
    )
  }
}

