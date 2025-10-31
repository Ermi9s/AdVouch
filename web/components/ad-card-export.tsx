"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, Star } from "lucide-react"

interface AdCardExportProps {
  title: string
  description?: string
  imageUrl?: string
  shareCount?: number
  reputation?: number
  businessName?: string
}

/**
 * A component designed to be screenshot/exported as an image
 * with AdVouch branding for social media sharing
 */
export function AdCardExport({
  title,
  description,
  imageUrl,
  shareCount = 0,
  reputation = 0,
  businessName,
}: AdCardExportProps) {
  return (
    <div className="w-[600px] bg-white rounded-xl overflow-hidden shadow-2xl">
      {/* AdVouch Badge - Top Right */}
      <div className="relative">
        {imageUrl && (
          <div className="aspect-video bg-gray-100">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Floating AdVouch Badge */}
        <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-[10px] font-bold">
            A
          </div>
          <span>Advertised via AdVouch</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          {shareCount > 0 && (
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>{shareCount} shares</span>
            </div>
          )}
          {reputation > 0 && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{reputation}</span>
            </div>
          )}
          {businessName && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">{businessName}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="pt-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg text-center font-semibold">
            Learn More
          </div>
        </div>
      </div>

      {/* Footer with AdVouch Branding */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
        <span className="text-white text-sm font-medium">Verified & Trusted</span>
        <div className="flex items-center gap-2 text-white font-bold">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
            A
          </div>
          <span>AdVouch</span>
        </div>
      </div>
    </div>
  )
}

