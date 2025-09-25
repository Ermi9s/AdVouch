"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReputationBadge } from "@/components/reputation-badge"
import { MapPin, Navigation, Satellite, MapIcon, Building2 } from "lucide-react"
import type { Business } from "@/types"

interface ServiceMapProps {
  businesses: Business[]
  selectedBusiness?: Business | null
  onBusinessSelect?: (business: Business) => void
  height?: string
}

export function ServiceMap({ businesses, selectedBusiness, onBusinessSelect, height = "400px" }: ServiceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapType, setMapType] = useState<"osm" | "satellite">("osm")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Initialize map - change the default center to Addis Ababa
      const map = L.map(mapRef.current!).setView([9.0192, 38.7525], 12)

      // OpenStreetMap layer
      const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      })

      // ArcGIS Satellite layer
      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        },
      )

      // Add default layer
      if (mapType === "osm") {
        osmLayer.addTo(map)
      } else {
        satelliteLayer.addTo(map)
      }

      mapInstanceRef.current = { map, osmLayer, satelliteLayer }

      // Add markers for businesses
      addBusinessMarkers(L, map)
      setIsLoading(false)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove()
      }
    }
  }, [])

  // Update map type when changed
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const { map, osmLayer, satelliteLayer } = mapInstanceRef.current

    map.eachLayer((layer: any) => {
      if (layer === osmLayer || layer === satelliteLayer) {
        map.removeLayer(layer)
      }
    })

    if (mapType === "osm") {
      osmLayer.addTo(map)
    } else {
      satelliteLayer.addTo(map)
    }
  }, [mapType])

  const addBusinessMarkers = async (L: any, map: any) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => map.removeLayer(marker))
    markersRef.current = []

    // Create custom icons based on reputation score
    const createCustomIcon = (score: number, isVerified: boolean) => {
      let color = "#6b7280" // gray for neutral
      if (score >= 100)
        color = "#22c55e" // green for champion
      else if (score >= 60)
        color = "#22c55e" // green for trusted
      else if (score >= 20)
        color = "#eab308" // yellow for growing
      else if (score >= -19)
        color = "#6b7280" // gray for neutral
      else if (score >= -59)
        color = "#f97316" // orange for under watch
      else color = "#ef4444" // red for poor/not recommended

      const verifiedBadge = isVerified
        ? '<div style="position: absolute; top: -2px; right: -2px; background: #22c55e; color: white; border-radius: 50%; width: 8px; height: 8px; border: 1px solid white;"></div>'
        : ""

      return L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background-color: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              color: white;
            ">
              ${score > 0 ? "+" : ""}${score}
            </div>
            ${verifiedBadge}
          </div>
        `,
        className: "custom-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })
    }

    // Add markers for each business
    businesses.forEach((business) => {
      const marker = L.marker([business.coordinates.lat, business.coordinates.lng], {
        icon: createCustomIcon(business.reputationScore, business.isVerified),
      }).addTo(map)

      // Create popup content
      const popupContent = `
  <div class="p-3 min-w-[280px]">
    <div class="flex items-center space-x-3 mb-2">
      <div class="relative w-8 h-8 flex-shrink-0">
        <img src="${business.logoUrl}" alt="${business.name} logo" class="w-full h-full object-cover rounded-lg" />
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-sm">${business.name}</h3>
        <span class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">${business.category}</span>
      </div>
      <span class="text-xs font-medium ${business.reputationScore >= 60 ? "text-green-600" : business.reputationScore >= 20 ? "text-yellow-600" : business.reputationScore >= -19 ? "text-gray-600" : "text-red-600"}">${business.reputationScore > 0 ? "+" : ""}${business.reputationScore}</span>
    </div>
    <p class="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">${business.description}</p>
    <div class="flex items-center text-xs text-gray-500 mb-2">
      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
      </svg>
      ${business.location}
    </div>
    <button onclick="window.selectBusiness('${business.id}')" class="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors">
      View Business
    </button>
  </div>
`

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-popup",
      })

      marker.on("click", () => {
        onBusinessSelect?.(business)
      })

      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (businesses.length > 0) {
      const group = new L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }

  // Global function to handle business selection from popup
  useEffect(() => {
    ;(window as any).selectBusiness = (businessId: string) => {
      const business = businesses.find((b) => b.id === businessId)
      if (business) {
        onBusinessSelect?.(business)
      }
    }

    return () => {
      delete (window as any).selectBusiness
    }
  }, [businesses, onBusinessSelect])

  const toggleMapType = () => {
    setMapType((prev) => (prev === "osm" ? "satellite" : "osm"))
  }

  const centerOnSelected = () => {
    if (selectedBusiness && mapInstanceRef.current?.map) {
      mapInstanceRef.current.map.setView([selectedBusiness.coordinates.lat, selectedBusiness.coordinates.lng], 15)
    }
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleMapType}
          className="bg-background/90 backdrop-blur-sm shadow-lg"
        >
          {mapType === "osm" ? (
            <>
              <Satellite className="h-4 w-4 mr-2" />
              Satellite
            </>
          ) : (
            <>
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </>
          )}
        </Button>

        {selectedBusiness && (
          <Button
            variant="secondary"
            size="sm"
            onClick={centerOnSelected}
            className="bg-background/90 backdrop-blur-sm shadow-lg"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected Business Info */}
      {selectedBusiness && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <Card className="shadow-lg bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{selectedBusiness.name}</h3>
                    {selectedBusiness.isVerified && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                      >
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary">{selectedBusiness.category}</Badge>
                    <ReputationBadge score={selectedBusiness.reputationScore} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{selectedBusiness.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedBusiness.location}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded z-[1000]">
        {mapType === "osm" ? "© OpenStreetMap contributors" : "© Esri, ArcGIS"}
      </div>
    </div>
  )
}
