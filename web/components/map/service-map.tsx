"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, X, ExternalLink, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Business } from "@/lib/mock-data"
import { mockAds } from "@/lib/mock-data"
import Link from "next/link"
import Image from "next/image"

interface ServiceMapProps {
  businesses: Business[]
  selectedBusiness: Business | null
  onBusinessSelect: (business: Business | null) => void
  height?: string
}

function latLngToTile(lat: number, lng: number, zoom: number) {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom),
  )
  return { x, y }
}

function getMarkerColor(reputation: number): string {
  if (reputation >= 100) return "bg-green-500"
  if (reputation >= 60) return "bg-green-500"
  if (reputation >= 20) return "bg-yellow-500"
  if (reputation >= -19) return "bg-gray-500"
  if (reputation >= -59) return "bg-orange-500"
  return "bg-red-500"
}

export function ServiceMap({ businesses, selectedBusiness, onBusinessSelect, height = "600px" }: ServiceMapProps) {
  const [zoom, setZoom] = useState(13)
  const [center, setCenter] = useState({ lat: 8.9806, lng: 38.7578 }) // Default to Addis Ababa
  const [mapType, setMapType] = useState<"osm" | "satellite">("osm")
  const [hoveredBusiness, setHoveredBusiness] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    if (businesses.length > 0) {
      // Filter businesses that have valid location coordinates
      const businessesWithCoords = businesses.filter(
        (b) => b.location && typeof b.location === 'object' &&
        typeof b.location.lat === 'number' && typeof b.location.lng === 'number' &&
        !isNaN(b.location.lat) && !isNaN(b.location.lng)
      )

      if (businessesWithCoords.length > 0) {
        const avgLat = businessesWithCoords.reduce((sum, b) => sum + b.location.lat, 0) / businessesWithCoords.length
        const avgLng = businessesWithCoords.reduce((sum, b) => sum + b.location.lng, 0) / businessesWithCoords.length
        setCenter({ lat: avgLat, lng: avgLng })
      }
    }
  }, [businesses])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({ x: 0, y: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    setDragOffset({ x: dx, y: dy })
  }

  const handleMouseUp = () => {
    if (!isDragging) return

    const pixelsPerDegree = (256 * Math.pow(2, zoom)) / 360
    const latOffset = -dragOffset.y / pixelsPerDegree
    const lngOffset = dragOffset.x / pixelsPerDegree

    setCenter({
      lat: center.lat + latOffset,
      lng: center.lng + lngOffset,
    })

    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  const handleBusinessClick = (business: Business) => {
    onBusinessSelect(business)
    setShowDetailModal(true)
  }

  const getBusinessAds = (businessId: string) => {
    return mockAds.filter((ad) => ad.businessId === businessId)
  }

  const centerTile = latLngToTile(center.lat, center.lng, zoom)
  const tiles = []
  const tilesX = 4
  const tilesY = 4

  for (let dx = -Math.floor(tilesX / 2); dx <= Math.floor(tilesX / 2); dx++) {
    for (let dy = -Math.floor(tilesY / 2); dy <= Math.floor(tilesY / 2); dy++) {
      tiles.push({
        x: centerTile.x + dx,
        y: centerTile.y + dy,
        offsetX: dx,
        offsetY: dy,
      })
    }
  }

  const getMarkerPosition = (lat: number, lng: number) => {
    const businessTile = latLngToTile(lat, lng, zoom)
    const tileSize = 256

    const pixelX = (businessTile.x - centerTile.x) * tileSize + (tileSize * tilesX) / 2
    const pixelY = (businessTile.y - centerTile.y) * tileSize + (tileSize * tilesY) / 2

    return { x: pixelX, y: pixelY }
  }

  const getTileUrl = (x: number, y: number, z: number) => {
    if (mapType === "satellite") {
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
    }
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted" style={{ height }}>
      <div
        ref={mapRef}
        className={`absolute inset-0 overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute"
          style={{
            width: `${256 * tilesX}px`,
            height: `${256 * tilesY}px`,
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          {tiles.map((tile) => (
            <img
              key={`${tile.x}-${tile.y}`}
              src={getTileUrl(tile.x, tile.y, zoom) || "/placeholder.svg"}
              alt="Map tile"
              className="absolute"
              style={{
                width: "256px",
                height: "256px",
                left: `${(tile.offsetX + Math.floor(tilesX / 2)) * 256}px`,
                top: `${(tile.offsetY + Math.floor(tilesY / 2)) * 256}px`,
              }}
              crossOrigin="anonymous"
            />
          ))}
        </div>
      </div>

      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/90 backdrop-blur px-3 py-2 rounded-lg border border-border shadow-lg">
        <Navigation className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Nearby Businesses</span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant={mapType === "osm" ? "default" : "secondary"}
          className="bg-background/90 backdrop-blur shadow-lg"
          onClick={() => setMapType("osm")}
        >
          Map
        </Button>
        <Button
          size="sm"
          variant={mapType === "satellite" ? "default" : "secondary"}
          className="bg-background/90 backdrop-blur shadow-lg"
          onClick={() => setMapType("satellite")}
        >
          Satellite
        </Button>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="bg-background/90 backdrop-blur shadow-lg"
          onClick={() => setZoom((z) => Math.min(z + 1, 18))}
        >
          +
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-background/90 backdrop-blur shadow-lg"
          onClick={() => setZoom((z) => Math.max(z - 1, 8))}
        >
          −
        </Button>
      </div>

      <div
        className="absolute pointer-events-none"
        style={{
          width: `${256 * tilesX}px`,
          height: `${256 * tilesY}px`,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
      >
        {businesses
          .filter((b) => b.location && typeof b.location === 'object' &&
            typeof b.location.lat === 'number' && typeof b.location.lng === 'number' &&
            !isNaN(b.location.lat) && !isNaN(b.location.lng))
          .map((business) => {
          const pos = getMarkerPosition(business.location.lat, business.location.lng)
          const isSelected = selectedBusiness?.id === business.id
          const isHovered = hoveredBusiness === business.id
          const markerColor = getMarkerColor(business.reputation)

          return (
            <div
              key={business.id}
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 z-20 pointer-events-auto"
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
              onClick={() => handleBusinessClick(business)}
              onMouseEnter={() => setHoveredBusiness(business.id)}
              onMouseLeave={() => setHoveredBusiness(null)}
            >
              <div
                className={`relative transition-all duration-200 ${isSelected || isHovered ? "scale-125" : "scale-100"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${markerColor}`}
                >
                  <MapPin className="h-4 w-4 text-white" fill="white" />
                </div>
                {(isSelected || isHovered) && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                )}
              </div>

              {isHovered && !isSelected && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                  <div className="bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg p-2 min-w-[180px]">
                    <p className="font-semibold text-sm">{business.name}</p>
                    <p className="text-xs text-muted-foreground">{business.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium">
                        {business.reputation > 0 ? "+" : ""}
                        {business.reputation}
                      </span>
                      <span className="text-xs text-muted-foreground">{business.totalAds} ads</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showDetailModal && selectedBusiness && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="flex items-start space-x-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={selectedBusiness.imageUrl || "/placeholder.svg"}
                    alt={`${selectedBusiness.name} logo`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="64px"
                  />
                </div>
                <div>
                  <CardTitle className="text-xl">{selectedBusiness.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{selectedBusiness.category}</Badge>
                    <Badge variant={selectedBusiness.reputation >= 60 ? "default" : "secondary"}>
                      {selectedBusiness.reputation > 0 ? "+" : ""}
                      {selectedBusiness.reputation} reputation
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowDetailModal(false)
                  onBusinessSelect(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              <p className="text-sm text-muted-foreground">{selectedBusiness.description}</p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedBusiness.location.address}, {selectedBusiness.location.city}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBusiness.totalAds} active ads</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Latest Ads</h3>
                <div className="grid gap-3">
                  {getBusinessAds(selectedBusiness.id)
                    .slice(0, 6)
                    .map((ad) => (
                      <Link key={ad.id} href={`/ads/${ad.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={ad.imageUrl || "/placeholder.svg"}
                              alt={ad.title}
                              fill
                              className="object-cover rounded"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{ad.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ad.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {ad.category}
                              </Badge>
                              <span className="text-xs font-medium">${ad.budget.toLocaleString()}</span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                </div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/businesses/${selectedBusiness.id}`}>View All Ads from {selectedBusiness.name}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="absolute bottom-1 right-1 z-[999] text-[10px] bg-background/80 px-1 rounded">
        {mapType === "osm" ? "© OpenStreetMap" : "© Esri"}
      </div>
    </div>
  )
}
