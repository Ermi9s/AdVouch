import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, TrendingUp, Target } from "lucide-react"
import type { Ad } from "@/lib/types"

interface AdCardProps {
  ad: Ad
  userMode?: "user" | "business" | "advertiser"
}

export function AdCard({ ad, userMode }: AdCardProps) {
  const getModeBadge = () => {
    if (userMode === "business") {
      return (
        <Badge variant="outline" className="border-primary/50 text-primary text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          Analyze
        </Badge>
      )
    }
    if (userMode === "advertiser") {
      return (
        <Badge variant="outline" className="border-primary/50 text-primary text-xs">
          <Target className="h-3 w-3 mr-1" />
          Promote
        </Badge>
      )
    }
    return null
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow hover:border-primary/50">
      {/* Horizontal Layout */}
      <div className="flex gap-3 p-3">
        {/* Smaller Image - Left Side */}
        <div className="w-32 h-24 flex-shrink-0 relative overflow-hidden rounded-md bg-muted">
          <img
            src={ad.imageUrl || "/placeholder.svg"}
            alt={ad.title}
            className="object-cover w-full h-full"
          />
          {getModeBadge() && (
            <div className="absolute top-1 right-1">{getModeBadge()}</div>
          )}
        </div>

        {/* Content - Right Side */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Title and Description */}
          <div>
            <h3 className="font-semibold text-base mb-1 line-clamp-1">{ad.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{ad.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{(ad.share_count || 0).toLocaleString()}</span>
              </div>
              <span className="text-xs">
                {userMode === "business" ? "Views" : userMode === "advertiser" ? "Shares" : "Views"}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {ad.status || "active"}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
