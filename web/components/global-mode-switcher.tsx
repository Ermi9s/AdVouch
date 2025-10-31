"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, setUserMode } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Building2, Megaphone, ChevronDown } from "lucide-react"
import { ModeTransition } from "./mode-transition"

interface GlobalModeSwitcherProps {
  variant?: "fixed" | "header"
}

export function GlobalModeSwitcher({ variant = "fixed" }: GlobalModeSwitcherProps) {
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [targetMode, setTargetMode] = useState<"user" | "business" | "advertiser" | null>(null)

  useEffect(() => {
    // Initial load
    const currentUser = getUser()
    setUser(currentUser)
    setIsLoaded(true)

    // Listen for storage changes (when mode is switched)
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

  // Only show mode switcher for authenticated users
  if (!isLoaded || !user) {
    return null
  }

  // For fixed variant, don't show on normal user mode (they see it in headers instead)
  if (variant === "fixed" && user.mode === "user") {
    return null
  }

  const currentMode = user.mode || "user"

  const handleModeSwitch = (mode: "user" | "business" | "advertiser") => {
    if (mode === currentMode) return

    console.log("[GlobalModeSwitcher] Switching to mode:", mode)

    // Show transition animation
    setTargetMode(mode)
    setShowTransition(true)

    // Switch mode in localStorage immediately
    setUserMode(mode)
    window.dispatchEvent(new Event("userModeChanged"))

    // Update local user state
    const updatedUser = getUser()
    setUser(updatedUser)
  }

  const handleTransitionComplete = () => {
    console.log("[GlobalModeSwitcher] Transition complete")

    // Redirect based on mode immediately after transition
    const mode = targetMode || currentMode
    const redirectPath = mode === "business" ? "/business/dashboard" : mode === "advertiser" ? "/advertiser/dashboard" : "/ads"

    console.log("[GlobalModeSwitcher] Navigating to:", redirectPath)

    // Clean up transition state
    setShowTransition(false)
    setTargetMode(null)

    // Navigate immediately
    router.push(redirectPath)
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "user":
        return "Normal User"
      case "business":
        return "Business Owner"
      case "advertiser":
        return "Advertiser"
      default:
        return "User"
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "user":
        return <User className="h-4 w-4" />
      case "business":
        return <Building2 className="h-4 w-4" />
      case "advertiser":
        return <Megaphone className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const positionClass = variant === "header" ? "" : "fixed top-20 right-4 z-40"

  return (
    <>
      <div className={positionClass}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${variant === "header" ? "" : "bg-card/80 backdrop-blur-sm border-border"}`}
            >
              {getModeIcon(currentMode)}
              <span className="hidden sm:inline">{variant === "header" ? "Mode" : getModeLabel(currentMode)}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch Mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleModeSwitch("user")} disabled={currentMode === "user"}>
              <User className="mr-2 h-4 w-4" />
              <span>Normal User</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModeSwitch("business")} disabled={currentMode === "business"}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Business Owner</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleModeSwitch("advertiser")} disabled={currentMode === "advertiser"}>
              <Megaphone className="mr-2 h-4 w-4" />
              <span>Advertiser</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showTransition && targetMode && (
        <ModeTransition mode={targetMode} onComplete={handleTransitionComplete} />
      )}
    </>
  )
}
