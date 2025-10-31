"use client"

import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockBusinesses, mockAds } from "@/lib/mock-data"
import { ArrowLeft, Building2, MapPin, Star, TrendingUp, Target, MessageSquare, Phone, Mail, Loader2 } from "lucide-react"
import { getUser, isAuthenticated } from "@/lib/auth"
import { AdCard } from "@/components/ad-card"
import { businessApi, adsApi } from "@/lib/api"
import type { Business, Ad } from "@/lib/types"
import { GlobalModeSwitcher } from "@/components/global-mode-switcher"

export default function BusinessDetailPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [businessAds, setBusinessAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  // Get user on mount
  useEffect(() => {
    setUser(getUser())
  }, [])

  // Fetch business and ads from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        try {
          // Try to fetch business
          const businessesResponse = await businessApi.list()
          const foundBusiness = businessesResponse.results?.find((b) => b.id === parseInt(businessId))
          if (foundBusiness) {
            setBusiness(foundBusiness)
          } else {
            // Fallback to mock data
            const mockBusiness = mockBusinesses.find((b) => b.id === businessId)
            if (mockBusiness) {
              setBusiness({
                id: parseInt(mockBusiness.id),
                name: mockBusiness.name,
                description: mockBusiness.description,
                category: mockBusiness.category,
                reputation: mockBusiness.reputation,
                owner: 1,
                created_at: new Date().toISOString(),
              })
            }
          }

          // Try to fetch ads for this business
          const adsResponse = await adsApi.list({ business: parseInt(businessId) })
          setBusinessAds(adsResponse.results || [])
        } catch (err) {
          console.warn("Failed to fetch from API, using mock data:", err)
          const mockBusiness = mockBusinesses.find((b) => b.id === businessId)
          if (mockBusiness) {
            setBusiness({
              id: parseInt(mockBusiness.id),
              name: mockBusiness.name,
              description: mockBusiness.description,
              category: mockBusiness.category,
              reputation: mockBusiness.reputation,
              owner: 1,
              created_at: new Date().toISOString(),
            })
          }
          setBusinessAds(mockAds.filter((ad) => ad.businessId === businessId).map((ad) => ({
            id: parseInt(ad.id),
            title: ad.title,
            description: ad.description,
            share_count: ad.views,
            business: parseInt(businessId),
            owner: 1,
            status: ad.status as "draft" | "active" | "archived",
            created_at: ad.createdAt,
          })))
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [businessId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading business...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <Link href="/businesses">
            <Button>Back to Businesses</Button>
          </Link>
        </div>
      </div>
    )
  }

  const themeClass =
    user?.mode === "business" ? "theme-business" : user?.mode === "advertiser" ? "theme-advertiser" : ""

  const getReputationColor = (reputation: number) => {
    if (reputation >= 80) return "text-green-500"
    if (reputation >= 50) return "text-yellow-500"
    if (reputation >= 0) return "text-orange-500"
    return "text-red-500"
  }

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 80) return "Excellent"
    if (reputation >= 50) return "Good"
    if (reputation >= 0) return "Fair"
    return "Poor"
  }

  const handleInteraction = (action: string) => {
    if (!isAuthenticated()) {
      router.push("/auth")
      return
    }
    // Handle the action for authenticated users
    console.log(`[v0] User interaction: ${action}`)
  }

  return (
    <div className={`min-h-screen bg-background ${themeClass}`}>
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/businesses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Businesses
          </Link>
          {user && (
            <GlobalModeSwitcher variant="header" />
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Business Header */}
        <div className="mb-8">
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={business.imageUrl || "/placeholder.svg"}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
                  <Badge variant="outline" className="mb-4">
                    {business.category}
                  </Badge>
                  <p className="text-muted-foreground text-lg mb-4">{business.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getReputationColor(business.reputation)}`}>
                    {business.reputation}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">{getReputationBadge(business.reputation)}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-current" />
                    Reputation Score
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {business.location && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{business.location}</div>
                          <div className="text-sm text-muted-foreground">Location</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{businessAds.length} Active Campaigns</div>
                        <div className="text-sm text-muted-foreground">Total advertisements</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mode-specific CTAs */}
              <div className="flex gap-3">
                {user?.mode === "business" && (
                  <>
                    <Button className="gap-2" onClick={() => handleInteraction("analyze")}>
                      <TrendingUp className="h-4 w-4" />
                      Analyze Strategy
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => handleInteraction("compare")}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Compare Performance
                    </Button>
                  </>
                )}
                {user?.mode === "advertiser" && (
                  <>
                    <Button className="gap-2" onClick={() => handleInteraction("partner")}>
                      <Target className="h-4 w-4" />
                      Partner with Business
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => handleInteraction("contact")}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Contact Business
                    </Button>
                  </>
                )}
                {(!user || user?.mode === "user") && (
                  <>
                    <Button className="gap-2" onClick={() => handleInteraction("contact")}>
                      <Phone className="h-4 w-4" />
                      Contact
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => handleInteraction("message")}
                    >
                      <Mail className="h-4 w-4" />
                      Send Message
                    </Button>
                  </>
                )}
              </div>
              {!isAuthenticated() && (
                <p className="text-xs text-muted-foreground mt-2">Sign in to interact with this business</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ads" className="w-full">
          <TabsList>
            <TabsTrigger value="ads">Active Campaigns ({businessAds.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="mt-6">
            {businessAds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessAds.map((ad) => (
                  <AdCard key={ad.id} ad={ad} userMode={user?.mode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">This business has no active campaigns at the moment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About {business.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{business.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Category</h3>
                  <Badge variant="outline">{business.category}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">
                    {business.location || "Not specified"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>See what others are saying about {business.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">Reviews coming soon</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
