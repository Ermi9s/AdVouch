"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { setProfileComplete, isAuthenticated } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Megaphone } from "lucide-react"

export default function AdvertiserOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    platformName: "",
    platformType: "",
    audience: "",
    reach: "",
    website: "",
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("[v0] Submitting advertiser profile:", formData)

      // TODO: Send to backend API
      // await updateAdvertiserProfile(formData)

      // Mark profile as complete
      setProfileComplete("advertiser", true)

      console.log("[v0] Advertiser profile completed")

      // Redirect to advertiser dashboard
      router.push("/advertiser/dashboard")
    } catch (err) {
      console.error("[v0] Profile completion failed:", err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Megaphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Advertiser Profile</h1>
          <p className="text-muted-foreground">Tell us about your platform to start promoting ads</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="platformName">Platform Name *</Label>
            <Input
              id="platformName"
              value={formData.platformName}
              onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
              placeholder="Enter your platform name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platformType">Platform Type *</Label>
            <Input
              id="platformType"
              value={formData.platformType}
              onChange={(e) => setFormData({ ...formData, platformType: e.target.value })}
              placeholder="e.g., Social Media, Blog, Website, App"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience *</Label>
            <Textarea
              id="audience"
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              placeholder="Describe your audience demographics and interests"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reach">Monthly Reach *</Label>
            <Input
              id="reach"
              value={formData.reach}
              onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
              placeholder="e.g., 50,000 monthly visitors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Platform URL *</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourplatform.com"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </div>
    </div>
  )
}
