"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setUser, setUserMode, mapUserTypeToMode } from "@/lib/auth"
import { authenticate } from "@/lib/api-client"
import { userApi } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      console.log("[v0] Processing authentication callback")

      // Get parameters from URL - Fayda returns 'code' and 'state'
      const code = searchParams.get("code")
      const state = searchParams.get("state")

      console.log("[v0] Callback params:", { code, state })

      // Get session ID from sessionStorage (stored during authorize)
      const sessionId = sessionStorage.getItem("session_id")

      if (!sessionId || !code || !state) {
        throw new Error("Missing authentication parameters")
      }

      console.log("[v0] Calling authenticate API")

      // The 'state' parameter from Fayda is the CSRF token
      const { access_token, refresh_token, user, user_info } = await authenticate(sessionId, state, code)

      console.log("[v0] Authentication successful, user:", user)
      console.log("[v0] User info from Fayda:", user_info)

      sessionStorage.removeItem("session_id")

      // Sync user profile with OAuth data
      let userProfile = null
      try {
        console.log("[v0] Syncing user profile with OAuth data...")
        const syncResult = await userApi.syncProfile(user_info)
        userProfile = syncResult.data
        console.log("[v0] User profile synced:", userProfile)
      } catch (syncError) {
        console.warn("[v0] Could not sync user profile:", syncError)
        // Try to fetch existing profile
        try {
          userProfile = await userApi.getMe()
          console.log("[v0] User profile fetched:", userProfile)
        } catch (profileError) {
          console.warn("[v0] Could not fetch user profile:", profileError)
        }
      }

      // Determine user mode from backend user type
      const userMode = mapUserTypeToMode(user.type)

      setUser({
        id: user.id,
        name: userProfile?.full_name || user.name,
        mode: userMode,
        email: userProfile?.email,
        phone: userProfile?.phone_number,
        businessProfileComplete: userMode === "business" ? false : undefined,
        advertiserProfileComplete: userMode === "advertiser" ? false : undefined,
      })

      setUserMode(userMode)
      console.log("[v0] User authenticated with mode:", userMode)

      // Dispatch event to notify other components of auth state change
      window.dispatchEvent(new Event("userModeChanged"))

      // Redirect based on user mode
      if (userMode === "business") {
        router.push("/business/dashboard")
      } else if (userMode === "advertiser") {
        router.push("/advertiser/dashboard")
      } else {
        router.push("/ads")
      }
    } catch (err) {
      console.error("[v0] Authentication callback failed:", err)
      setError("Authentication failed. Please try again.")
      setTimeout(() => router.push("/auth"), 2000)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
