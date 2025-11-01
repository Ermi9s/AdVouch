"use client"

import { useEffect } from "react"
import { getUser } from "@/lib/auth"

export function ModeThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleUserChange = () => {
      const user = getUser()
      const mode = user?.mode || "user"

      document.body.classList.remove("theme-business", "theme-advertiser")

      if (mode === "business") {
        document.body.classList.add("theme-business")
      } else if (mode === "advertiser") {
        document.body.classList.add("theme-advertiser")
      }
    }

    handleUserChange()

    window.addEventListener("storage", handleUserChange)
    window.addEventListener("userModeChanged", handleUserChange)

    return () => {
      window.removeEventListener("storage", handleUserChange)
      window.removeEventListener("userModeChanged", handleUserChange)
    }
  }, [])

  return <>{children}</>
}
