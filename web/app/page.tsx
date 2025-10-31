"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Star, TrendingUp, MapPin, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { mockAds, mockBusinesses } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adsApi, businessApi } from "@/lib/api"
import type { Ad, Business } from "@/lib/types"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [popularAds, setPopularAds] = useState<Ad[]>([])
  const [popularBusinesses, setPopularBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch popular ads and businesses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        try {
          const adsResponse = await adsApi.list({ ordering: "-share_count" })
          const ads = (adsResponse.results || [])
            .filter((a) => a.id && !isNaN(a.id)) // Filter out invalid IDs
            .slice(0, 4)
          setPopularAds(ads)
        } catch (err) {
          console.warn("Failed to fetch ads from API, using mock data:", err)
          setPopularAds(mockAds.sort((a, b) => b.views - a.views).slice(0, 4).map((ad) => ({
            id: parseInt(ad.id),
            title: ad.title,
            description: ad.description,
            share_count: ad.views,
            business: 1,
            owner: 1,
            status: ad.status as "draft" | "active" | "archived",
            created_at: ad.createdAt,
          })).filter((a) => !isNaN(a.id))) // Filter out NaN IDs from parseInt
        }

        try {
          const businessesResponse = await businessApi.list()
          const businesses = (businessesResponse.results || [])
            .filter((b) => b.id && !isNaN(b.id)) // Filter out invalid IDs
            .sort((a, b) => (b.reputation || 0) - (a.reputation || 0))
            .slice(0, 4)
          setPopularBusinesses(businesses)
        } catch (err) {
          console.warn("Failed to fetch businesses from API, using mock data:", err)
          setPopularBusinesses(mockBusinesses.sort((a, b) => b.reputation - a.reputation).slice(0, 4).map((b) => ({
            id: parseInt(b.id),
            name: b.name,
            description: b.description,
            category: b.category,
            reputation: b.reputation,
            owner: 1,
            created_at: new Date().toISOString(),
          })).filter((b) => !isNaN(b.id))) // Filter out NaN IDs from parseInt
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/ads?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
        <div className="w-full max-w-2xl">
          {/* Logo/Title - Google-like */}
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-3 text-foreground">AdVouch</h1>
            <p className="text-sm md:text-base text-muted-foreground">Discover trusted services and products</p>
          </div>

          {/* Search Bar - Prominent and centered */}
          <form onSubmit={handleSearch} className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, services, or businesses..."
              className="w-full pl-14 pr-6 py-4 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-lg hover:shadow-xl transition-shadow text-base"
              autoFocus
            />
          </form>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mb-16">
            <Link href="/ads">
              <Button variant="outline" size="lg" className="rounded-md">
                Browse Ads
              </Button>
            </Link>
            <Link href="/businesses">
              <Button variant="outline" size="lg" className="rounded-md">
                Browse Businesses
              </Button>
            </Link>
          </div>

          {/* Popular Content - Minimal Display */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-12">
              {/* Popular Ads */}
              {popularAds.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium text-muted-foreground">Popular Ads</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularAds.map((ad) => (
                      <Link key={ad.id} href={`/ads/${ad.id}`}>
                        <Card className="p-3 hover:shadow-md transition-all cursor-pointer group border-border/50">
                          <div className="aspect-video rounded-md overflow-hidden mb-2 bg-muted">
                            <img
                              src={ad.imageUrl || "/placeholder.svg"}
                              alt={ad.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-1">{ad.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{ad.businessName}</p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Businesses */}
              {popularBusinesses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium text-muted-foreground">Popular Businesses</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularBusinesses.map((business) => (
                      <Link key={business.id} href={`/businesses/${business.id}`}>
                        <Card className="p-3 hover:shadow-md transition-all cursor-pointer group border-border/50">
                          <div className="aspect-video rounded-md overflow-hidden mb-2 bg-muted">
                            <img
                              src={business.imageUrl || "/placeholder.svg"}
                              alt={business.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-1">{business.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{business.category}</p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="px-6 py-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xs text-muted-foreground">
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/help" className="hover:text-foreground transition-colors">
            Help
          </Link>
          <Link href="/auth" className="hover:text-foreground transition-colors">
            For Businesses
          </Link>
          <Link href="/auth" className="hover:text-foreground transition-colors">
            For Advertisers
          </Link>
          <span className="text-muted-foreground/60">© 2025 AdVouch</span>
        </div>
      </footer>
    </div>
  )
}
