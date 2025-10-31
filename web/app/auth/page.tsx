"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { authorize } from "@/lib/api-client"

export default function AuthPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFaydaLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Starting Fayda login flow")

      const { auth_url, session_id } = await authorize()

      console.log("[v0] Received auth URL:", auth_url)
      console.log("[v0] Received session ID:", session_id)

      // Store session ID in session storage for validation on callback
      sessionStorage.setItem("session_id", session_id)

      // Redirect to Fayda authentication
      window.location.href = auth_url
    } catch (err) {
      console.error("[v0] Authorization failed:", err)
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Logo */}
      <div className="mb-12 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">A</span>
          </div>
        </Link>
        <h1 className="text-3xl font-bold mt-4">AdVouch</h1>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome</h2>
            <p className="text-muted-foreground">Sign in or create an account to continue</p>
          </div>

          {/* Continue with Fayda Button */}
          <Button onClick={handleFaydaLogin} disabled={loading} className="w-full h-12 text-base font-medium" size="lg">
            <Shield className="mr-2 h-5 w-5" />
            {loading ? "Connecting..." : "Continue with Fayda"}
          </Button>

          {/* Fayda Description */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Fayda</strong> is Ethiopia's secure national digital identity system
              that ensures privacy and seamless access to trusted platforms like AdVouch. Use your Fayda ID to log in or
              sign up.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy Policy
          </Link>
          <span className="mx-2">•</span>
          <Link href="/terms" className="hover:text-foreground hover:underline">
            Terms of Service
          </Link>
        </footer>
      </div>
    </div>
  )
}
