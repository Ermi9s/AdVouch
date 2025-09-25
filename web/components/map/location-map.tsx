"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Satellite, MapIcon } from "lucide-react"
import L from "leaflet"

interface LocationMapProps {
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
  height?: string
}

export function LocationMap({
  address,
  coordinates = { lat: 40.7128, lng: -74.006 },
  height = "300px",
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapType, setMapType] = useState<"osm" | "satellite">("osm")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Initialize map
      const map = L.map(mapRef.current!).setView([coordinates.lat, coordinates.lng], 15)

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

      // Add marker for the location
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: #1E7EF7;
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              color: white;
              font-size: 12px;
              transform: rotate(45deg);
            ">📍</div>
          </div>
        `,
        className: "custom-location-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      })

      const marker = L.marker([coordinates.lat, coordinates.lng], { icon: customIcon }).addTo(map)

      // Add popup with address
      marker.bindPopup(
        `
        <div class="p-2">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
            <span class="font-medium text-sm">${address}</span>
          </div>
        </div>
      `,
        {
          className: "custom-popup",
        },
      )

      mapInstanceRef.current = { map, osmLayer, satelliteLayer, marker }
      setIsLoading(false)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove()
      }
    }
  }, [coordinates.lat, coordinates.lng, address])

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

  const toggleMapType = () => {
    setMapType((prev) => (prev === "osm" ? "satellite" : "osm"))
  }

  const centerMap = () => {
    if (mapInstanceRef.current?.map) {
      mapInstanceRef.current.map.setView([coordinates.lat, coordinates.lng], 15)
    }
  }

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
    window.open(url, "_blank")
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden border" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-3 right-3 flex flex-col space-y-2 z-[1000]">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleMapType}
          className="bg-background/90 backdrop-blur-sm shadow-md text-xs px-2 py-1 h-auto"
        >
          {mapType === "osm" ? (
            <>
              <Satellite className="h-3 w-3 mr-1" />
              Satellite
            </>
          ) : (
            <>
              <MapIcon className="h-3 w-3 mr-1" />
              Map
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={centerMap}
          className="bg-background/90 backdrop-blur-sm shadow-md p-1 h-auto"
        >
          <Navigation className="h-3 w-3" />
        </Button>
      </div>

      {/* Address Info */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000]">
        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium truncate">{address}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openDirections}
              className="ml-2 text-xs px-2 py-1 h-auto bg-transparent"
            >
              <Navigation className="h-3 w-3 mr-1" />
              Directions
            </Button>
          </div>
        </div>
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-1 left-1 text-xs text-muted-foreground bg-background/80 px-1 py-0.5 rounded z-[1000]">
        {mapType === "osm" ? "© OSM" : "© Esri"}
      </div>
    </div>
  )
}
