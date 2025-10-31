"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getUser } from "@/lib/auth"
import { mockOffers } from "@/lib/mock-data"
import { Plus, Calendar, Users, Loader2 } from "lucide-react"
import { offersApi } from "@/lib/api"
import type { Offer } from "@/lib/types"

export default function BusinessOffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user || user.mode !== "business") {
      router.push("/auth")
    }
  }, [router])

  // Fetch business offers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Offers</h1>
                <p className="text-muted-foreground">Manage your offers and review advertiser applications</p>
              </div>
              <Link href="/business/offers/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Offer
                </Button>
              </Link>
            </div>

            {/* Offers List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(offers.length > 0 ? offers : mockOffers.map((offer) => ({
                id: parseInt(offer.id),
                ad: parseInt(offer.adId),
                business: parseInt(offer.businessId),
                maximum_offer_amount: offer.budget.toString(),
                description: offer.description,
                status: "Active",
                created_at: new Date().toISOString(),
              })).filter((o) => !isNaN(o.id))).map((offer) => (
                <Card key={offer.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{offer.description || "Offer"}</h3>
                      <Badge variant={offer.status === "Active" ? "default" : "secondary"}>{offer.status}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${parseFloat(offer.maximum_offer_amount || "0").toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Budget</div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{offer.description}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(offer.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Link href={`/business/offers/${offer.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                      <Link href={`/business/offers/${offer.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {offers.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No offers yet</p>
                <Link href="/business/offers/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Offer
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
