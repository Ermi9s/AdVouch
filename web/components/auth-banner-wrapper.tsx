"use client"

import { useEffect, useState } from "react"
import { getUser } from "@/lib/auth"
import { SignInBanner } from "./signin-banner"

export function AuthBannerWrapper() {
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Initial load
    const currentUser = getUser()
    setUser(currentUser)
    setIsLoaded(true)

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      const updatedUser = getUser()
      setUser(updatedUser)
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom event for same-tab updates
    window.addEventListener("userModeChanged", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userModeChanged", handleStorageChange)
    }
  }, [])

  // Only show banner for unauthenticated users
  if (!isLoaded || user) {
    return null
  }

  return <SignInBanner />
}

