"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default function BusinessOnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth")
    } else {
      // Redirect to create business page
      router.push("/business/create")
    }
  }, [router])

  return null // This page just redirects
}
