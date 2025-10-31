"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUser } from "@/lib/auth"
import { mockOffers, mockAds, categories } from "@/lib/mock-data"
import { Search, Calendar, Users, Loader2 } from "lucide-react"
import { offersApi, adsApi } from "@/lib/api"
import type { Offer, Ad } from "@/lib/types"

export default function AdvertiserOffersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [offers, setOffers] = useState<Offer[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user || user.mode !== "advertiser") {
      router.push("/auth")
    }
  }, [router])

  // Fetch offers and ads
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Try to fetch offers
        try {
          const offersResponse = await offersApi.list({
            search: searchQuery || undefined,
          })
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
          })))
        }

        // Try to fetch ads
        try {
          const adsResponse = await adsApi.list()
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
  }, [searchQuery])

  const filteredOffers = (offers.length > 0 ? offers : mockOffers.map((offer) => ({
    id: parseInt(offer.id),
    ad: parseInt(offer.adId),
    business: parseInt(offer.businessId),
    maximum_offer_amount: offer.budget.toString(),
    description: offer.description,
    status: "Active",
    created_at: new Date().toISOString(),
  })).filter((o) => o.id && !isNaN(o.id))).filter((offer) => {
    const matchesSearch =
      offer.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    return matchesSearch && offer.status === "Active"
  })

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading offers...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Browse Offers</h1>
              <p className="text-muted-foreground">
                Discover opportunities and apply to campaigns that match your audience
              </p>
            </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search offers..."
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
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredOffers.length} {filteredOffers.length === 1 ? "offer" : "offers"}
          </p>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOffers.map((offer) => {
              const ad = mockAds.find((a) => a.id === (offer.adId || offer.ad))
              return (
                <Card key={offer.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{offer.title || offer.description || "Offer"}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{ad?.businessName || "Business"}</p>
                      {ad && (
                        <Badge variant="secondary" className="text-xs">
                          {ad.category}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">${parseFloat(offer.maximum_offer_amount || "0").toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Budget</div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{offer.description || "No description"}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    {offer.deadline && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {new Date(offer.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    {offer.applicationsCount !== undefined && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{offer.applicationsCount} applications</span>
                      </div>
                    )}
                  </div>

                  {offer.requirements && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-3">
                        <strong>Requirements:</strong> {offer.requirements}
                      </p>
                    </div>
                  )}
                  <Link href={`/advertiser/offers/${offer.id}`}>
                    <Button className="w-full">View Details & Apply</Button>
                  </Link>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No offers found matching your criteria</p>
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
        )}
          </>
        )}
      </div>
    </div>
  )
}
