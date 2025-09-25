"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, CreditCard, Shield, CheckCircle, Wifi, WifiOff } from "lucide-react"
import { authAPI, testApiConnection } from "@/lib/api"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking")

  const { loginWithFayda } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Check API status on component mount
  React.useEffect(() => {
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    console.log("🔍 Starting API status check...")
    try {
      const result = await testApiConnection()
      console.log("🔍 API status check result:", result)

      if (result.status === "online") {
        console.log("✅ API is online")
        setApiStatus("online")
      } else {
        console.log("❌ API is offline")
        setApiStatus("offline")
      }
    } catch (error) {
      console.error("🔍 API status check failed:", error)
      setApiStatus("offline")
    }
  }

  const handleFaydaLogin = async () => {
    setIsLoading(true)

    try {
      console.log("🚀 Starting Fayda login process...")

      // Step 1: Get authorization URL and session ID
      console.log("📋 Step 1: Getting auth URL...")
      const authData = await authAPI.getAuthUrl()
      console.log("📋 Auth data received:", authData)

      const { api_url, session_id } = authData

      // Save session ID to localStorage for later use
      if (typeof window !== "undefined") {
        localStorage.setItem("fayda_session_id", session_id)
        console.log("💾 Session ID saved:", session_id)
      }

      // Check if this is a mock URL (for demo purposes)
      if (api_url && api_url.includes("mock-fayda-auth")) {
        console.log("🎭 Using mock authentication flow")
        handleMockAuthFlow(session_id)
      } else if (api_url) {
        console.log("🔗 Redirecting to real Fayda URL:", api_url)
        // Step 2: Redirect to real Fayda authorization URL
        window.location.href = api_url
      } else {
        console.log("⚠️ No API URL received, falling back to mock")
        handleMockAuthFlow(session_id)
      }
    } catch (error) {
      console.error("❌ Login error:", error)

      toast({
        title: "Authentication Error",
        description: "Unable to initiate login process. The app will use demo mode instead.",
        variant: "destructive",
      })

      // Fallback to mock auth flow
      console.log("🎭 Falling back to mock authentication")
      handleMockAuthFlow("fallback_session_" + Date.now())
    }
  }

  const handleMockAuthFlow = async (sessionId: string) => {
    try {
      console.log("🎭 Starting mock authentication flow...")

      // Simulate the OAuth callback flow
      console.log("⏳ Simulating OAuth redirect delay...")
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful authentication
      console.log("🔐 Performing mock authentication...")
      const userData = await authAPI.mockAuthenticate()
      console.log("👤 Mock user data:", userData)

      console.log("🔑 Setting user session...")
      const success = await loginWithFayda(userData.fayda_id)

      if (success) {
        // Clean up session ID
        if (typeof window !== "undefined") {
          localStorage.removeItem("fayda_session_id")
          console.log("🧹 Session ID cleaned up")
        }

        console.log("✅ Demo login successful, redirecting...")
        toast({
          title: "Demo Login Successful!",
          description: "You are now logged in with a demo Fayda account.",
        })
        router.push("/")
      } else {
        throw new Error("Failed to set user session")
      }
    } catch (error) {
      console.error("❌ Mock auth error:", error)
      toast({
        title: "Demo Login Failed",
        description: "Unable to complete demo authentication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle demo login for development/testing
  const handleDemoLogin = async () => {
    setIsLoading(true)

    try {
      console.log("🎭 Starting quick demo login...")
      const userData = await authAPI.mockAuthenticate()
      console.log("👤 Demo user data:", userData)

      const success = await loginWithFayda(userData.fayda_id)

      if (success) {
        console.log("✅ Quick demo login successful")
        toast({
          title: "Demo Login Successful!",
          description: "You are now logged in with a demo account.",
        })
        router.push("/")
      } else {
        throw new Error("Demo login failed")
      }
    } catch (error) {
      console.error("❌ Demo login error:", error)
      toast({
        title: "Demo login failed",
        description: "Unable to create demo session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle callback from Fayda (this would be called when user returns from Fayda)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")

    if (code && state) {
      console.log("🔄 Processing Fayda callback...")
      handleFaydaCallback(code, state)
    }
  }, [])

  const handleFaydaCallback = async (code: string, state: string) => {
    setIsLoading(true)

    try {
      console.log("🔄 Starting callback processing...")
      const sessionId = typeof window !== "undefined" ? localStorage.getItem("fayda_session_id") : null

      if (!sessionId) {
        throw new Error("Session ID not found")
      }

      console.log("🔐 Authenticating with callback data...")

      // Step 3: Authenticate with the callback data
      const userData = await authAPI.authenticate({
        auth_code: code,
        csrf_token: state,
        session_id: sessionId,
      })

      console.log("👤 Authenticated user data:", userData)

      // Use the existing auth context to set user data
      const success = await loginWithFayda(userData.fayda_id || "authenticated_user")

      if (success) {
        // Clean up session ID
        if (typeof window !== "undefined") {
          localStorage.removeItem("fayda_session_id")
          console.log("🧹 Session ID cleaned up")
        }

        console.log("✅ Callback authentication successful")
        toast({
          title: "Welcome to AV Marketplace!",
          description: "You have been successfully authenticated with your Fayda ID.",
        })
        router.push("/")
      } else {
        throw new Error("Failed to set user session")
      }
    } catch (error) {
      console.error("❌ Callback error:", error)

      toast({
        title: "Authentication failed",
        description: "Unable to complete authentication. Please try again.",
        variant: "destructive",
      })

      // Clean up session ID on error
      if (typeof window !== "undefined") {
        localStorage.removeItem("fayda_session_id")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case "online":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "offline":
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
    }
  }

  const getApiStatusText = () => {
    switch (apiStatus) {
      case "online":
        return "Fayda API Online"
      case "offline":
        return "Fayda API Offline - Demo Mode"
      default:
        return "Checking API Status..."
    }
  }

  const getApiStatusDescription = () => {
    switch (apiStatus) {
      case "online":
        return "Connected to live Fayda authentication service."
      case "offline":
        return "Using demo mode for testing. All functionality is available with mock data."
      default:
        return "Testing connection to authentication service..."
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AV Marketplace
          </Link>
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Continue with Fayda</h1>
            <p className="text-gray-600">Secure authentication using your Fayda ID</p>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Secure Login</span>
            </CardTitle>
            <CardDescription>
              AV Marketplace uses Fayda ID for secure, verified access to ensure authentic user interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Status Indicator */}
            <div
              className={`border rounded-lg p-3 ${
                apiStatus === "online" ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                {getApiStatusIcon()}
                <span className="text-sm font-medium text-gray-700">{getApiStatusText()}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{getApiStatusDescription()}</p>
            </div>

            <Button
              onClick={handleFaydaLogin}
              className="w-full h-12 text-base"
              disabled={isLoading || apiStatus === "checking"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {apiStatus === "online" ? "Connecting to Fayda..." : "Starting Demo Login..."}
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  {apiStatus === "online" ? "Continue with Fayda" : "Continue with Demo Fayda"}
                </>
              )}
            </Button>

            {/* Alternative Demo Login */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Alternative</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleDemoLogin}
              className="w-full h-12 text-base bg-transparent"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Demo Session...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Quick Demo Login
                </>
              )}
            </Button>

            {/* Benefits */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Why Fayda ID?</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Verified identity for trusted interactions</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure authentication without passwords</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Access to reputation-based services</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have a Fayda ID?{" "}
            <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
              Learn more about Fayda
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Powered by AdVouch</p>
        </div>
      </div>
    </div>
  )
}
