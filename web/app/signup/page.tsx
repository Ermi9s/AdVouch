"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SignupPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"user" | "business" | "advertiser">("user")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement actual registration
    // For now, simulate signup
    setTimeout(() => {
      // Store mock user data
      localStorage.setItem("user", JSON.stringify({ phone, role }))

      // Redirect based on role
      if (role === "business") {
        router.push("/business/dashboard")
      } else if (role === "advertiser") {
        router.push("/advertiser/dashboard")
      } else {
        router.push("/ads")
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold inline-block mb-2">
            AdVouch
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground">Join AdVouch and start connecting today</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>I am a...</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as "user" | "business" | "advertiser")}>
                <div className="flex items-center space-x-2 border border-border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="flex-1 cursor-pointer">
                    <div className="font-medium">Normal User</div>
                    <div className="text-sm text-muted-foreground">Browse and discover ads</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business" className="flex-1 cursor-pointer">
                    <div className="font-medium">Business Owner</div>
                    <div className="text-sm text-muted-foreground">Create and manage ads</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="advertiser" id="advertiser" />
                  <Label htmlFor="advertiser" className="flex-1 cursor-pointer">
                    <div className="font-medium">Advertiser</div>
                    <div className="text-sm text-muted-foreground">Promote ads on your platform</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
