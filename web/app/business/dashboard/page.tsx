"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BusinessSwitcher, getActiveBusinessId } from "@/components/business-switcher"
import { getUser } from "@/lib/auth"
import { mockAds, mockOffers } from "@/lib/mock-data"
import { Plus, TrendingUp, Eye, MousePointerClick, DollarSign, Loader2 } from "lucide-react"
import { adsApi, offersApi } from "@/lib/api"
import type { Ad, Offer } from "@/lib/types"

export default function BusinessDashboardPage() {
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Add a small delay to allow mode switch to complete
    const timer = setTimeout(() => {
      const currentUser = getUser()
      setUser(currentUser)
      if (!currentUser || currentUser.mode !== "business") {
        console.log("[BusinessDashboard] User not in business mode, redirecting to auth")
        router.push("/auth")
      }
      setIsCheckingAuth(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  // Fetch business ads and offers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Try to fetch from API
        try {
          const adsResponse = await adsApi.getMyAds()
          const ads = (adsResponse.results || [])
            .filter((a) => a.id && !isNaN(a.id)) // Filter out invalid IDs
          setAds(ads)
        } catch (err) {
          console.warn("Failed to fetch ads from API, using mock data:", err)
          setAds(mockAds.map((ad) => ({
            id: parseInt(ad.id),
            title: ad.title,
            description: ad.description,
            share_count: ad.views,
            business: 1,
            owner: 1,
            status: ad.status as "draft" | "active" | "archived",
            created_at: ad.createdAt,
          })))
        }

        // Try to fetch offers
        try {
          const offersResponse = await offersApi.list()
          const offers = (offersResponse.results || [])
            .filter((o) => o.id && !isNaN(o.id)) // Filter out invalid IDs
          setOffers(offers)
        } catch (err) {
          console.warn("Failed to fetch offers from API, using mock data:", err)
          setOffers(mockOffers.map((offer) => ({
            id: parseInt(offer.id),
            ad: parseInt(offer.adId),
            business: parseInt(offer.businessId),
            maximum_offer_amount: offer.budget.toString(),
            description: offer.description,
            status: "Active",
            created_at: new Date().toISOString(),
          })).filter((o) => !isNaN(o.id))) // Filter out NaN IDs from parseInt
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalViews = ads.reduce((sum, ad) => sum + (ad.share_count || 0), 0)
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)
  const totalBudget = ads.length * 5000 // Mock calculation
  const activeAds = ads.filter((ad) => ad.status === "active").length

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background theme-business flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background theme-business">
      <div className="container mx-auto px-4 py-8">
        {/* Business Switcher */}
        <div className="mb-6">
          <BusinessSwitcher />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Manage your ads, offers, and track performance</p>
              </div>
              <Link href="/business/ads/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ad
                </Button>
              </Link>
            </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{activeAds}</div>
            <div className="text-sm text-muted-foreground">Active Ads</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{totalViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MousePointerClick className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{totalClicks.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Clicks</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">${totalBudget.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Budget</div>
          </Card>
        </div>

        {/* Recent Ads */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Ads</h2>
            <Link href="/business/ads">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockAds.slice(0, 4).map((ad) => (
              <Card key={ad.id} className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={ad.imageUrl || "/placeholder.svg"}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 line-clamp-1">{ad.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ad.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{ad.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" />
                        <span>{ad.clicks.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Offers */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Active Offers</h2>
            <Link href="/business/offers">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockOffers.map((offer) => (
              <Card key={offer.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{offer.title}</h3>
                  <span className="text-sm font-medium text-primary">${offer.budget.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{offer.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{offer.applicationsCount} applications</span>
                  <Link href={`/business/offers/${offer.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
