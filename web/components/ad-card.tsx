"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Share2, MessageCircle } from "lucide-react"
import type { Ad } from "@/types"

interface AdCardProps {
  ad: Ad
}

export function AdCard({ ad }: AdCardProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: ad.description,
        url: `/ads/${ad.id}`,
      })
    }
  }

  const handleVouch = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Navigate to vouch section
    window.location.href = `/ads/${ad.id}#vouchs`
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden">
      <Link href={`/ads/${ad.id}`}>
        <div className="relative">
          {/* Image */}
          <div className="relative h-48 sm:h-52 md:h-56 lg:h-48 xl:h-52 overflow-hidden">
            <Image
              src={ad.imageUrl || "/placeholder.svg"}
              alt={ad.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
                {ad.category}
              </Badge>
            </div>

            {/* Status Badge */}
            {ad.status !== "Active" && (
              <div className="absolute top-3 right-3">
                <Badge
                  variant={ad.status === "Draft" ? "outline" : "destructive"}
                  className={`${ad.status === "Draft"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : "bg-gray-100 text-gray-800"
                    } backdrop-blur-sm shadow-sm`}
                >
                  {ad.status}
                </Badge>
              </div>
            )}

            {/* Business Reference */}
            {ad.business && (
              <div className={`absolute ${ad.status !== "Active" ? "top-12" : "top-3"} right-3`}>
                <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs">
                  <div className="relative w-4 h-4">
                    <Image
                      src={ad.business.logoUrl || "/placeholder.svg"}
                      alt={`${ad.business.name} logo`}
                      fill
                      className="object-cover rounded-full"
                      sizes="16px"
                    />
                  </div>
                  <span className="font-medium truncate max-w-20">{ad.business.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4 sm:p-5 lg:p-4 xl:p-5">
            <div className="space-y-3">
              {/* Title */}
              <h3 className="font-semibold text-base sm:text-lg lg:text-base xl:text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {ad.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{ad.description}</p>

              {/* Tags */}
              {ad.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ad.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                  {ad.tags.length > 2 && <span className="text-xs text-muted-foreground">+{ad.tags.length - 2}</span>}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-20 sm:max-w-none">{ad.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(ad.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Engagement Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleVouch}
                    className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors group/vouch"
                  >
                    <MessageCircle className="h-4 w-4 group-hover/vouch:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{ad.vouchCount}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors group/share"
                  >
                    <Share2 className="h-4 w-4 group-hover/share:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{ad.share_count}</span>
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  )
}
