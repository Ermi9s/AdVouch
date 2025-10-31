"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, Share2, Building2, Calendar, Eye, Loader2 } from "lucide-react"
import { adsApi } from "@/lib/api"
import type { Ad } from "@/lib/types"

interface AdDetailsPanelProps {
  adId: string
}

export function AdDetailsPanel({ adId }: AdDetailsPanelProps) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await adsApi.getById(adId)
        setAd(data)
      } catch (err) {
        console.error("Error fetching ad:", err)
        setError("Failed to load ad details")
      } finally {
        setLoading(false)
      }
    }

    if (adId) {
      fetchAd()
    }
  }, [adId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading ad details...</p>
        </div>
      </div>
    )
  }

  if (error || !ad) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">{error || "Ad not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Ad Image */}
      {ad.imageUrl && (
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Ad Title and Status */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold">{ad.title}</h1>
          <Badge variant={ad.status === "active" ? "default" : "secondary"}>{ad.status}</Badge>
        </div>

        {/* Business Info */}
        {ad.businessName && (
          <Link href={`/businesses/${ad.business}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{ad.businessName}</span>
          </Link>
        )}
      </div>

      <Separator />

      {/* Description */}
      {ad.description && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Description</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ad.description}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="h-4 w-4" />
            <span className="text-xs">Reputation</span>
          </div>
          <p className="text-lg font-semibold">{ad.reputation || 0}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Share2 className="h-4 w-4" />
            <span className="text-xs">Shares</span>
          </div>
          <p className="text-lg font-semibold">{ad.share_count || 0}</p>
        </Card>

        {ad.clicks !== undefined && (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs">Clicks</span>
            </div>
            <p className="text-lg font-semibold">{ad.clicks}</p>
          </Card>
        )}

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Created</span>
          </div>
          <p className="text-sm font-semibold">
            {ad.created_at ? new Date(ad.created_at).toLocaleDateString() : "N/A"}
          </p>
        </Card>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/ads/${ad.id}`} className="flex-1">
          <Button className="w-full" variant="default">
            View Full Details
          </Button>
        </Link>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Additional Info */}
      {ad.location && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5" />
          <span>{ad.location}</span>
        </div>
      )}
    </div>
  )
}

