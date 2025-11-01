"use client"
import { ThemeSwitcher } from "./theme-switcher"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout, getUser } from "@/lib/auth"
import { LogOut, Search, Building2, Home, User as UserIcon } from "lucide-react"
import { GlobalModeSwitcher } from "./global-mode-switcher"
import type { User } from "@/lib/auth"

export function UnifiedHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    setIsLoaded(true)

    const handleUserChange = () => {
      const updatedUser = getUser()
      setUser(updatedUser)
    }

    window.addEventListener("storage", handleUserChange)
    window.addEventListener("userModeChanged", handleUserChange)

    return () => {
      window.removeEventListener("storage", handleUserChange)
      window.removeEventListener("userModeChanged", handleUserChange)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

  const currentMode = user?.mode || "user"

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
            AdVouch
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Common Links for All Users */}
            <Link
              href="/"
              className={`text-sm flex items-center gap-1 transition-colors ${
                isActive("/") && pathname === "/"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>

            <Link
              href="/ads"
              className={`text-sm flex items-center gap-1 transition-colors ${
                isActive("/ads")
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-4 w-4" />
              Browse Ads
            </Link>

            <Link
              href="/businesses"
              className={`text-sm flex items-center gap-1 transition-colors ${
                isActive("/businesses")
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Browse Businesses
            </Link>

            {/* Mode-Specific Links */}
            {user && currentMode === "business" && (
              <>
                <Link
                  href="/business/dashboard"
                  className={`text-sm transition-colors ${
                    isActive("/business/dashboard")
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/business/ads"
                  className={`text-sm transition-colors ${
                    isActive("/business/ads")
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My Ads
                </Link>
                <Link
                  href="/business/offers"
                  className={`text-sm transition-colors ${
                    isActive("/business/offers")
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Offers
                </Link>
                <Link
                  href="/business/analytics"
                  className={`text-sm transition-colors ${
                    isActive("/business/analytics")
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Analytics
                </Link>
              </>
            )}

            {user && currentMode === "advertiser" && (
              <>
                <Link
                  href="/advertiser/dashboard"
                  className={`text-sm transition-colors ${
                    isActive("/advertiser/dashboard")
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/advertiser/offers"
                  className={`text-sm transition-colors ${
                    isActive("/advertiser/offers")
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Browse Offers
                </Link>
                <Link
                  href="/advertiser/applications"
                  className={`text-sm transition-colors ${
                    isActive("/advertiser/applications")
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My Applications
                </Link>
                <Link
                  href="/advertiser/reputation"
                  className={`text-sm transition-colors ${
                    isActive("/advertiser/reputation")
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Reputation
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {/* Mode Switcher - Only for authenticated users */}
          {user && <GlobalModeSwitcher variant="header" />}

          {/* Auth Button */}
          {user ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

