"use client"

import { useEffect, useState } from "react"
import { refreshToken } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

const ENABLE_MOCK_MODE = false // Should match api-client.ts setting

// Component to handle automatic token refresh
export function TokenRefreshHandler() {
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (ENABLE_MOCK_MODE) {
      console.log("[v0] Token refresh disabled in mock mode")
      return
    }

    // Set up periodic token refresh (every 50 minutes if access token expires in 1 hour)
    const interval = setInterval(
      async () => {
        try {
          setIsRefreshing(true)

          const result = await refreshToken()

          if (!result) {
            // Refresh failed - user will be redirected to login by api-client
            toast({
              title: "Session expired",
              description: "Please log in again.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("[v0] Token refresh error:", error)
        } finally {
          setIsRefreshing(false)
        }
      },
      50 * 60 * 1000,
    ) // 50 minutes

    return () => clearInterval(interval)
  }, [toast])

  // Show subtle indicator when refreshing
  if (isRefreshing) {
    return (
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-4 py-2 shadow-lg z-50">
        <p className="text-sm text-muted-foreground">Session refreshing...</p>
      </div>
    )
  }

  return null
}
