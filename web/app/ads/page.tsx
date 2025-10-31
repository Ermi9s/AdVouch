"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdCard } from "@/components/ad-card"
import { BusinessMap } from "@/components/business-map"
import { mockAds, mockBusinesses, categories } from "@/lib/mock-data"
import { Search, SlidersHorizontal, LogOut, TrendingUp, Target, ShoppingBag, Map, LayoutGrid, Loader2 } from "lucide-react"
import { getUser, logout } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adsApi, businessApi } from "@/lib/api"
import type { Ad, Business } from "@/lib/types"
import { SignInBanner } from "@/components/signin-banner"
import { GlobalModeSwitcher } from "@/components/global-mode-switcher"
import { SplitViewLayout } from "@/components/split-view-layout"
import { AdDetailsPanel } from "@/components/ad-details-panel"
import { useTrackSearch, useInteractionTracking } from "@/hooks/use-interaction-tracking"

export default function AdsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [ads, setAds] = useState<Ad[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null)
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null)

  // Track search queries
  const trackSearch = useTrackSearch(1500) // 1.5 second debounce
  const { trackClick } = useInteractionTracking()

  // Check authentication status and get user
  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    setIsAuthenticated(!!currentUser)
  }, [])

  // Fetch ads and businesses from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to fetch from real API first
        try {
          const adsResponse = await adsApi.list({
            search: searchQuery || undefined,
            ordering: sortBy === "recent" ? "-created_at" : sortBy === "popular" ? "-share_count" : undefined,
          })
          const ads = (adsResponse.results || [])
            .filter((a) => a.id && !isNaN(a.id)) // Filter out invalid IDs
          setAds(ads)

          // Track search if there's a query
          if (searchQuery) {
            trackSearch(searchQuery, ads.length)
          }
        } catch (err) {
          console.warn("Failed to fetch ads from API, using mock data:", err)
          setAds(mockAds)
        }

        // Try to fetch businesses
        try {
          const businessesResponse = await businessApi.list({
            search: searchQuery || undefined,
          })
          const businesses = (businessesResponse.results || [])
            .filter((b) => b.id && !isNaN(b.id)) // Filter out invalid IDs
          setBusinesses(businesses)
        } catch (err) {
          console.warn("Failed to fetch businesses from API, using mock data:", err)
          setBusinesses(mockBusinesses)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load ads. Using cached data.")
        setAds(mockAds)
        setBusinesses(mockBusinesses)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery, sortBy, trackSearch])

  // Convert backend Ad to frontend format for display
  const convertAdForDisplay = (ad: Ad) => ({
    id: ad.id.toString(),
    title: ad.title,
    description: ad.description || "",
    category: "General",
    budget: 0,
    imageUrl: ad.media_files?.[0]?.url || "/placeholder.svg",
    businessName: "Business",
    businessId: ad.business ? ad.business.toString() : "0",
    createdAt: ad.created_at,
    status: ad.status as "active" | "paused" | "completed",
    views: 0,
    clicks: 0,
    reputation: 0,
  })

  const filteredAds = (ads.length > 0 ? ads : mockAds)
    .map((ad) => (typeof ad === "object" && "id" in ad ? convertAdForDisplay(ad as Ad) : ad))
    .filter((ad) => {
      const matchesSearch =
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All Categories" || ad.category === selectedCategory
      return matchesSearch && matchesCategory
    })

  const filteredBusinesses = (businesses.length > 0 ? businesses : mockBusinesses).filter((business) => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const themeClass =
    user?.mode === "business" ? "theme-business" : user?.mode === "advertiser" ? "theme-advertiser" : ""

  const getModeContent = () => {
    switch (user?.mode) {
      case "business":
        return {
          icon: <TrendingUp className="h-5 w-5" />,
          title: "Market Intelligence",
          description: "Analyze competitor campaigns and discover market trends to improve your advertising strategy",
        }
      case "advertiser":
        return {
          icon: <Target className="h-5 w-5" />,
          title: "Discover Campaigns",
          description: "Find high-quality ads to promote on your platform and maximize your earning potential",
        }
      default:
        return {
          icon: <ShoppingBag className="h-5 w-5" />,
          title: "Browse Ads",
          description: "Discover products and services from businesses in your area",
        }
    }
  }

  const modeContent = getModeContent()

  return (
    <div className={`min-h-screen bg-background ${themeClass}`}>
      {!isAuthenticated && <SignInBanner />}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">{modeContent.icon}</div>
            <h1 className="text-4xl font-bold">{modeContent.title}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{modeContent.description}</p>
        </div>

        {user?.mode === "business" && (
          <Card className="p-6 mb-8 bg-card/50 backdrop-blur border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Competitive Analysis Mode</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View competitor campaigns, analyze their strategies, and get insights to improve your own ads. Click
                  any ad to see detailed performance metrics and create similar campaigns.
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Campaigns:</span>{" "}
                    <span className="font-semibold">{mockAds.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Budget:</span>{" "}
                    <span className="font-semibold">
                      ${Math.round(mockAds.reduce((sum, ad) => sum + ad.budget, 0) / mockAds.length).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {user?.mode === "advertiser" && (
          <Card className="p-6 mb-8 bg-card/50 backdrop-blur border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Promotion Opportunities</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse active campaigns looking for advertisers. Make offers on ads that match your platform's
                  audience and start earning from promotions.
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Active Campaigns:</span>{" "}
                    <span className="font-semibold">{mockAds.filter((ad) => ad.status === "active").length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Budget Pool:</span>{" "}
                    <span className="font-semibold">
                      ${mockAds.reduce((sum, ad) => sum + ad.budget, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ads by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="budget">Highest Budget</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {viewMode === "list" ? filteredAds.length : filteredBusinesses.length}{" "}
              {viewMode === "list"
                ? filteredAds.length === 1
                  ? "ad"
                  : "ads"
                : filteredBusinesses.length === 1
                  ? "business"
                  : "businesses"}
            </p>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")}>
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map" className="gap-2">
                  <Map className="h-4 w-4" />
                  Map View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading ads...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : viewMode === "list" ? (
          filteredAds.length > 0 ? (
            <SplitViewLayout
              detailsContent={selectedAdId ? <AdDetailsPanel adId={selectedAdId} /> : undefined}
              selectedId={selectedAdId}
              onClose={() => setSelectedAdId(null)}
            >
              <div className="space-y-3">
                {filteredAds.map((ad) => (
                  <div
                    key={ad.id}
                    onClick={() => {
                      // On mobile, navigate to detail page
                      if (window.innerWidth < 1024) {
                        router.push(`/ads/${ad.id}`)
                      } else {
                        // On desktop, show in split view
                        setSelectedAdId(ad.id)
                      }
                      // Track click when ad is selected
                      const adIdNum = parseInt(ad.id)
                      if (!isNaN(adIdNum)) {
                        trackClick(adIdNum)
                        // Track search click if there's a search query
                        if (searchQuery) {
                          trackSearch(searchQuery, filteredAds.length, adIdNum)
                        }
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <AdCard ad={ad} userMode={user?.mode} />
                  </div>
                ))}
              </div>
            </SplitViewLayout>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No ads found matching your criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All Categories")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )
        ) : (
          <BusinessMap businesses={filteredBusinesses} userMode={user?.mode} />
        )}
      </div>
    </div>
  )
}
