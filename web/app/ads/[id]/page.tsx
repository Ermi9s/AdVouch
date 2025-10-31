"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { useEffect, useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockAds } from "@/lib/mock-data"
import { Eye, MousePointerClick, Star, Calendar, Building2, ArrowLeft, TrendingUp, Target, Copy, Loader2, Share2 } from "lucide-react"
import { getUser, isAuthenticated } from "@/lib/auth"
import { adsApi, reviewsApi, ratingsApi, sharesApi } from "@/lib/api"
import type { Ad, Review, Rating } from "@/lib/types"
import { GlobalModeSwitcher } from "@/components/global-mode-switcher"
import { AdExportModal } from "@/components/ad-export-modal"
import { useTrackAdView, useInteractionTracking } from "@/hooks/use-interaction-tracking"

export default function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const user = getUser()
  const [ad, setAd] = useState<Ad | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  // Track ad view automatically
  useTrackAdView(ad?.id)
  const { trackClick, trackShare } = useInteractionTracking()

  // Fetch ad details and interactions
  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to fetch from API first
        try {
          const adsResponse = await adsApi.list()
          const foundAd = adsResponse.results?.find((a) => a.id.toString() === id)
          if (foundAd) {
            setAd(foundAd)

            // Fetch reviews and ratings
            try {
              const reviewsResponse = await reviewsApi.list(foundAd.id)
              setReviews(reviewsResponse.results || [])
            } catch (err) {
              console.warn("Failed to fetch reviews:", err)
            }

            try {
              const ratingsResponse = await ratingsApi.list(foundAd.id)
              setRatings(ratingsResponse.results || [])
            } catch (err) {
              console.warn("Failed to fetch ratings:", err)
            }
          } else {
            // Fallback to mock data
            const mockAd = mockAds.find((a) => a.id === id)
            if (mockAd) {
              setAd({
                id: parseInt(id),
                title: mockAd.title,
                description: mockAd.description,
                share_count: mockAd.views,
                business: 1,
                owner: 1,
                status: "active",
                created_at: mockAd.createdAt,
                views: mockAd.views || 0,
                clicks: mockAd.clicks || 0,
                budget: mockAd.budget || 5000,
                reputation: mockAd.reputation || 85,
              })
            }
          }
        } catch (err) {
          console.warn("Failed to fetch from API, using mock data:", err)
          const mockAd = mockAds.find((a) => a.id === id)
          if (mockAd) {
            setAd({
              id: parseInt(id),
              title: mockAd.title,
              description: mockAd.description,
              share_count: mockAd.views,
              business: 1,
              owner: 1,
              status: "active",
              created_at: mockAd.createdAt,
              views: mockAd.views || 0,
              clicks: mockAd.clicks || 0,
              budget: mockAd.budget || 5000,
              reputation: mockAd.reputation || 85,
            })
          }
        }
      } catch (err) {
        console.error("Error fetching ad details:", err)
        setError("Failed to load ad details")
      } finally {
        setLoading(false)
      }
    }

    fetchAdDetails()
  }, [id])

  const handleInteraction = async (action: string) => {
    if (!isAuthenticated()) {
      router.push("/auth")
      return
    }

    try {
      if (action === "share" && ad) {
        await sharesApi.create({ ad: ad.id })
        // Track the share
        await trackShare(ad.id)
        console.log("Ad shared successfully")
      }
      console.log(`[v0] User interaction: ${action}`)
    } catch (err) {
      console.error("Error handling interaction:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading ad details...</p>
        </div>
      </div>
    )
  }

  if (!ad || error) {
    notFound()
  }

  const themeClass =
    user?.mode === "business" ? "theme-business" : user?.mode === "advertiser" ? "theme-advertiser" : ""

  const getModeCTA = () => {
    switch (user?.mode) {
      case "business":
        return (
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => setExportModalOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Export Ad for External Use
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => handleInteraction("create-similar")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Create Similar Campaign
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => handleInteraction("view-analysis")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Market Analysis
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {!isAuthenticated() && "Sign in to access these features"}
              {isAuthenticated() && "Export your ad with AdVouch branding for external advertising"}
            </p>
          </div>
        )
      case "advertiser":
        return (
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => handleInteraction("make-offer")}>
              <Target className="h-4 w-4 mr-2" />
              Make an Offer
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => handleInteraction("view-similar")}
            >
              View Similar Campaigns
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {!isAuthenticated() && "Sign in to make offers"}
              {isAuthenticated() && `Promote this ad on your platform and earn up to $${(ad.budget || 0).toLocaleString()}`}
            </p>
          </div>
        )
      default:
        return (
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => handleInteraction("learn-more")}>
              Learn More
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => handleInteraction("contact")}
            >
              Contact Business
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {!isAuthenticated() && "Sign in to contact this business"}
              {isAuthenticated() && "Get more information about this product or service"}
            </p>
          </div>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-background ${themeClass}`}>
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            AdVouch
          </Link>
          <nav className="flex items-center gap-4">
            {user && user.mode === "business" && (
              <Link href="/business/dashboard" className="text-sm font-medium hover:text-primary">
                Business Dashboard
              </Link>
            )}
            {user && user.mode === "advertiser" && (
              <Link href="/advertiser/dashboard" className="text-sm font-medium hover:text-primary">
                Advertiser Dashboard
              </Link>
            )}
            <Link href="/ads" className="text-sm font-medium hover:text-primary">
              Browse Ads
            </Link>
            {user && (
              <GlobalModeSwitcher variant="header" />
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/ads"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all ads
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="aspect-video relative overflow-hidden rounded-xl bg-muted">
              <img src={ad.imageUrl || "/placeholder.svg"} alt={ad.title} className="object-cover w-full h-full" />
            </div>

            {/* Title and Category */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold text-balance">{ad.title}</h1>
                <Badge variant="secondary" className="flex-shrink-0">
                  {ad.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">{ad.businessName}</span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">About This Campaign</h2>
              <p className="text-muted-foreground leading-relaxed">{ad.description}</p>
            </div>

            {/* Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">
                {user?.mode === "business" ? "Competitor Performance" : "Campaign Performance"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Views</span>
                  </div>
                  <div className="text-2xl font-bold">{(ad.views || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MousePointerClick className="h-4 w-4" />
                    <span className="text-sm">Clicks</span>
                  </div>
                  <div className="text-2xl font-bold">{(ad.clicks || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Star className="h-4 w-4" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <div className="text-2xl font-bold">{ad.reputation || 0}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Posted</span>
                  </div>
                  <div className="text-sm font-medium">
                    {new Date(ad.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {user?.mode === "business" && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Competitive Insights
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CTR (Click-Through Rate)</span>
                    <span className="font-semibold">{(((ad.views || 0) && (ad.clicks || 0)) ? (((ad.clicks || 0) / (ad.views || 1)) * 100) : 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost per Click</span>
                    <span className="font-semibold">${((ad.clicks || 0) ? (ad.budget || 0) / (ad.clicks || 1) : 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engagement Score</span>
                    <span className="font-semibold">High</span>
                  </div>
                </div>
              </Card>
            )}

            {user?.mode === "advertiser" && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Promotion Potential
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Reach</span>
                    <span className="font-semibold">{((ad.views || 0) * 1.5).toLocaleString()} users</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission Rate</span>
                    <span className="font-semibold">15-25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Earnings</span>
                    <span className="font-semibold text-primary">${((ad.budget || 0) * 0.2).toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">
                  {user?.mode === "advertiser" ? "Potential Earnings" : "Campaign Budget"}
                </div>
                <div className="text-3xl font-bold">${(ad.budget || 0).toLocaleString()}</div>
              </div>

              <Separator className="my-6" />

              {getModeCTA()}

              <Separator className="my-6" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={ad.status === "active" ? "default" : "secondary"}>{ad.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Business Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-medium">{ad.reputation || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {ad && (
        <AdExportModal
          adId={ad.id.toString()}
          adTitle={ad.title}
          open={exportModalOpen}
          onOpenChange={setExportModalOpen}
        />
      )}
    </div>
  )
}
