"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, Share2, Package, Calendar, Loader2 } from "lucide-react"
import { businessApi } from "@/lib/api"
import type { Business } from "@/lib/types"

interface BusinessDetailsPanelProps {
  businessId: string
}

export function BusinessDetailsPanel({ businessId }: BusinessDetailsPanelProps) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true)
        setError(null)
        // Fetch from list endpoint and filter by ID since there's no detail endpoint
        const response = await businessApi.list()
        const foundBusiness = response.results?.find((b) => b.id === parseInt(businessId))
        if (foundBusiness) {
          setBusiness(foundBusiness)
        } else {
          setError("Business not found")
        }
      } catch (err) {
        console.error("Error fetching business:", err)
        setError("Failed to load business details")
      } finally {
        setLoading(false)
      }
    }

    if (businessId) {
      fetchBusiness()
    }
  }, [businessId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">{error || "Business not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Business Image */}
      {business.imageUrl && (
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <img src={business.imageUrl} alt={business.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Business Name and Category */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          {business.category && <Badge variant="outline">{business.category}</Badge>}
        </div>

        {/* Owner Info */}
        {business.ownerName && (
          <p className="text-sm text-muted-foreground">
            Owned by <span className="font-medium">{business.ownerName}</span>
          </p>
        )}
      </div>

      <Separator />

      {/* Description */}
      {business.description && (
        <div>
          <h2 className="text-sm font-semibold mb-2">About</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{business.description}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="h-4 w-4" />
            <span className="text-xs">Reputation</span>
          </div>
          <p className="text-lg font-semibold">{business.reputation || 0}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="h-4 w-4" />
            <span className="text-xs">Total Ads</span>
          </div>
          <p className="text-lg font-semibold">{business.totalAds || 0}</p>
        </Card>

        {business.created_at && (
          <Card className="p-4 col-span-2">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Member Since</span>
            </div>
            <p className="text-sm font-semibold">{new Date(business.created_at).toLocaleDateString()}</p>
          </Card>
        )}
      </div>

      <Separator />

      {/* Location */}
      {business.location && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Location</h2>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5" />
            <span>{business.location}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/businesses/${business.id}`} className="flex-1">
          <Button className="w-full" variant="default">
            View Full Profile
          </Button>
        </Link>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

