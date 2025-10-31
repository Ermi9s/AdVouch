// API client with automatic token refresh interceptor
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
// Use Next.js API routes as proxy to avoid CORS issues
const USE_API_PROXY = true

const ENABLE_MOCK_MODE = true // Set to false when backend is ready

interface ApiResponse<T = any> {
  data?: T
  error?: string
}

// Store access token in memory and localStorage for persistence across page loads
let accessTokenCache: string | null = null

// Initialize token cache from localStorage on module load
if (typeof window !== "undefined") {
  accessTokenCache = localStorage.getItem("access_token")
}

export function setAccessTokenCache(token: string) {
  accessTokenCache = token
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token)
  }
}

export function getAccessTokenCache(): string | null {
  // If cache is empty, try to restore from localStorage
  if (!accessTokenCache && typeof window !== "undefined") {
    accessTokenCache = localStorage.getItem("access_token")
  }
  return accessTokenCache
}

export function clearAccessTokenCache() {
  accessTokenCache = null
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token")
  }
}

const mockUser = {
  id: "mock-user-123",
  name: "Demo User",
  type: undefined as "normal_user" | "business_owner" | "advertiser" | undefined,
}

// Auth API endpoints
export async function authorize(): Promise<{ auth_url: string; session_id: string }> {
  console.log("[v0] Calling authorize endpoint:", `${API_BASE_URL}/api/v1/authorize`)

  if (ENABLE_MOCK_MODE) {
    console.log("[v0] Using mock mode for authorization")
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      auth_url: "/auth/callback?session_id=mock-session&auth_code=mock-code&state=mock-state",
      session_id: "mock-session-id",
    }
  }

  try {
    const endpoint = USE_API_PROXY ? "/api/auth/authorize" : `${API_BASE_URL}/api/v1/authorize`
    console.log("[v0] Fetching from:", endpoint)
    console.log("[v0] Using API proxy:", USE_API_PROXY)

    const response = await fetch(endpoint, {
      method: "GET",
      credentials: USE_API_PROXY ? "same-origin" : "include",
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response ok:", response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Error response:", errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("[v0] Authorization response:", result)

    // Backend returns { data: { auth_url, session_id }, message }
    return result.data
  } catch (error) {
    console.error("[v0] Authorization failed - Full error:", error)
    console.error("[v0] Error type:", error instanceof TypeError ? "TypeError (network/CORS)" : "Other")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    throw new Error(`Failed to connect to backend at ${API_BASE_URL}. Please check if the backend is running.`)
  }
}

export async function authenticate(
  sessionId: string,
  csrfToken: string,
  authCode: string,
): Promise<{
  access_token: string
  refresh_token: string
  user: {
    id: string
    name: string
    type?: "normal_user" | "business_owner" | "advertiser"
  }
  user_info?: any
}> {
  console.log("[v0] Calling authenticate endpoint:", `${API_BASE_URL}/api/v1/authenticate`)

  if (ENABLE_MOCK_MODE) {
    console.log("[v0] Using mock mode for authentication")
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockAccessToken = "mock-access-token-" + Date.now()
    setAccessTokenCache(mockAccessToken)

    return {
      access_token: mockAccessToken,
      refresh_token: "mock-refresh-token",
      user: mockUser,
    }
  }

  try {
    const endpoint = USE_API_PROXY ? "/api/auth/authenticate" : `${API_BASE_URL}/api/v1/authenticate`
    console.log("[v0] Authenticating with:", { sessionId, csrfToken, authCode })
    console.log("[v0] Using endpoint:", endpoint)

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: USE_API_PROXY ? "same-origin" : "include",
      body: JSON.stringify({
        session_id: sessionId,
        csrf_token: csrfToken,
        auth_code: authCode,
      }),
    })

    console.log("[v0] Authenticate response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Authenticate error response:", errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Authenticate response data:", data)

    // Backend returns { data: { access_token, refresh_token, user_info }, message }
    // Extract tokens and user info from data object
    const tokens = data.data || data
    setAccessTokenCache(tokens.access_token)

    // Extract user info from Fayda OAuth response
    const userInfo = tokens.user_info || {}
    const userId = userInfo.sub || "user-id"
    const userName = userInfo.name || "User"

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: userId,
        name: userName,
        type: undefined,
      },
      user_info: userInfo,
    }
  } catch (error) {
    console.error("[v0] Authentication failed - Full error:", error)
    console.error("[v0] Error type:", error instanceof TypeError ? "TypeError (network/CORS)" : "Other")
    throw new Error(`Failed to authenticate with backend at ${API_BASE_URL}`)
  }
}

export async function refreshToken(): Promise<{ access_token: string } | null> {
  if (ENABLE_MOCK_MODE) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/refresh`, {
      method: "POST",
      credentials: "include",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    setAccessTokenCache(data.access_token)

    return data
  } catch (error) {
    console.error("[v0] Token refresh failed:", error)
    return null
  }
}

export async function updateUserType(
  userId: string,
  type: "normal_user" | "business_owner" | "advertiser",
): Promise<void> {
  console.log("[v0] Updating user type:", type)

  if (ENABLE_MOCK_MODE) {
    console.log("[v0] Using mock mode for user type update")
    await new Promise((resolve) => setTimeout(resolve, 300))
    mockUser.type = type
    return
  }

  const response = await apiRequest(`/api/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ type }),
  })

  if (!response.ok) {
    throw new Error("Failed to update user type")
  }
}

export async function logout(): Promise<void> {
  if (ENABLE_MOCK_MODE) {
    console.log("[v0] Using mock mode for logout")
    clearAccessTokenCache()
    return
  }

  try {
    await fetch(`${API_BASE_URL}/api/v1/logout`, {
      method: "DELETE",
      credentials: "include",
    })
  } catch (error) {
    console.error("[v0] Logout failed:", error)
  } finally {
    clearAccessTokenCache()
  }
}

// Generic API request with automatic token refresh
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessTokenCache()

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  })

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshResult = await refreshToken()

    if (refreshResult) {
      // Retry request with new token
      headers["Authorization"] = `Bearer ${refreshResult.access_token}`
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      })
    } else {
      // Refresh failed - redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/auth"
      }
    }
  }

  return response
}
