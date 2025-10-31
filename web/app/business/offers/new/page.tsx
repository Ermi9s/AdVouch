"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUser } from "@/lib/auth"
import { mockAds } from "@/lib/mock-data"
import { ArrowLeft } from "lucide-react"

export default function NewOfferPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedAdId = searchParams.get("adId")

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    adId: preselectedAdId || "",
    title: "",
    description: "",
    budget: "",
    requirements: "",
    deadline: "",
  })

  useEffect(() => {
    const user = getUser()
    if (!user || user.mode !== "business") {
      router.push("/auth")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement actual offer creation
    setTimeout(() => {
      router.push("/business/offers")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Link
          href="/business/offers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to offers
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Offer</h1>
          <p className="text-muted-foreground">Post an offer to attract advertisers for your campaign</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="adId">Select Ad Campaign</Label>
              <Select
                value={formData.adId}
                onValueChange={(value) => setFormData({ ...formData, adId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an ad campaign" />
                </SelectTrigger>
                <SelectContent>
                  {mockAds.map((ad) => (
                    <SelectItem key={ad.id} value={ad.id}>
                      {ad.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Offer Title</Label>
              <Input
                id="title"
                placeholder="e.g., Instagram Story Campaign"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you need from advertisers"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="2500"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="e.g., 10k+ followers, health/fitness niche, high engagement rate"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="flex items-center gap-4 pt-6">
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Creating..." : "Create Offer"}
              </Button>
              <Link href="/business/offers">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
