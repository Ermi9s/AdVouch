"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getUser } from "@/lib/auth"
import { mockAds } from "@/lib/mock-data"
import { Plus, Eye, MousePointerClick, Star, MoreVertical, Loader2 } from "lucide-react"
import { adsApi } from "@/lib/api"
import type { Ad } from "@/lib/types"

export default function BusinessAdsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "completed">("all")
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user || user.mode !== "business") {
      router.push("/auth")
    }
  }, [router])

  // Fetch business ads
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

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
          })).filter((a) => !isNaN(a.id))) // Filter out NaN IDs from parseInt
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredAds = filter === "all" ? ads : ads.filter((ad) => ad.status === filter)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading ads...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Ads</h1>
                <p className="text-muted-foreground">Create and manage your advertising campaigns</p>
              </div>
              <Link href="/business/ads/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ad
                </Button>
              </Link>
            </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "active" ? "default" : "outline"} size="sm" onClick={() => setFilter("active")}>
            Active
          </Button>
          <Button variant={filter === "paused" ? "default" : "outline"} size="sm" onClick={() => setFilter("paused")}>
            Paused
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>

        {/* Ads List */}
        <div className="space-y-4">
          {filteredAds.map((ad) => (
            <Card key={ad.id} className="p-6">
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={ad.imageUrl || "/placeholder.svg"} alt={ad.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <Badge variant={ad.status === "active" ? "default" : "secondary"}>{ad.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Budget</div>
                      <div className="font-semibold">${(ad.budget || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Views</div>
                      <div className="font-semibold flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {(ad.views || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Clicks</div>
                      <div className="font-semibold flex items-center gap-1">
                        <MousePointerClick className="h-3.5 w-3.5" />
                        {(ad.clicks || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Rating</div>
                      <div className="font-semibold flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {ad.reputation || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/ads/${ad.id}`}>
                      <Button variant="outline" size="sm">
                        View Public Page
                      </Button>
                    </Link>
                    <Link href={`/business/ads/${ad.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/business/offers/new?adId=${ad.id}`}>
                      <Button size="sm">Create Offer</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

            {filteredAds.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No ads found</p>
                <Link href="/business/ads/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ad
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
