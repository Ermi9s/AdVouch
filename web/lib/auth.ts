import { getAccessTokenCache, logout as apiLogout } from "./api-client"
import type { UserMode } from "./types"

export interface User {
  id: string
  name: string
  mode?: "user" | "business" | "advertiser"
  businessProfileComplete?: boolean
  advertiserProfileComplete?: boolean
  email?: string
  phone?: string
}

// Map backend user type to frontend mode
export function mapUserTypeToMode(
  userType?: "normal_user" | "business_owner" | "advertiser"
): "user" | "business" | "advertiser" {
  if (userType === "business_owner") return "business"
  if (userType === "advertiser") return "advertiser"
  return "user"
}

// Store user info in localStorage (not tokens - those are in memory/cookies)
export function setUser(user: User) {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function setUserMode(mode: "user" | "business" | "advertiser") {
  if (typeof window === "undefined") return

  const user = getUser()
  if (!user) return

  const updatedUser = {
    ...user,
    mode,
  }

  localStorage.setItem("user", JSON.stringify(updatedUser))
}

export function getAccessToken(): string | null {
  return getAccessTokenCache()
}

export async function logout() {
  await apiLogout()

  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
    window.location.href = "/auth"
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null && getAccessTokenCache() !== null
}

export function getUserMode(): "user" | "business" | "advertiser" | null {
  const user = getUser()
  return user?.mode || null
}

export function setProfileComplete(mode: "business" | "advertiser", complete: boolean) {
  if (typeof window === "undefined") return

  const user = getUser()
  if (!user) return

  const updatedUser = {
    ...user,
    ...(mode === "business" ? { businessProfileComplete: complete } : { advertiserProfileComplete: complete }),
  }

  localStorage.setItem("user", JSON.stringify(updatedUser))
}

export function isProfileComplete(mode: "business" | "advertiser"): boolean {
  const user = getUser()
  if (!user) return false

  return mode === "business" ? user.businessProfileComplete === true : user.advertiserProfileComplete === true
}
