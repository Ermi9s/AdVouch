"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  faydaId: string
}

interface AuthContextType {
  user: User | null
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  loginWithFayda: (faydaId: string) => Promise<boolean>
  signup: (data: { name: string; email: string; phone: string; faydaId: string; password: string }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("advouch_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("advouch_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // This would be replaced with actual API call when backend supports it
      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email: credentials.email,
        faydaId: "FYD123456",
      }
      setUser(mockUser)
      localStorage.setItem("advouch_user", JSON.stringify(mockUser))
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const loginWithFayda = async (faydaId: string) => {
    try {
      // This would be replaced with actual user data from the authentication response
      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        faydaId: faydaId,
      }
      setUser(mockUser)
      localStorage.setItem("advouch_user", JSON.stringify(mockUser))
      return true
    } catch (error) {
      console.error("Fayda login error:", error)
      return false
    }
  }

  const signup = async (data: { name: string; email: string; phone: string; faydaId: string; password: string }) => {
    try {
      // This would be replaced with actual API call when backend supports it
      const mockUser: User = {
        id: "1",
        name: data.name,
        email: data.email,
        phone: data.phone,
        faydaId: data.faydaId,
      }
      setUser(mockUser)
      localStorage.setItem("advouch_user", JSON.stringify(mockUser))
      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("advouch_user")
    localStorage.removeItem("auth_token")
    localStorage.removeItem("fayda_session_id")
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithFayda, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
