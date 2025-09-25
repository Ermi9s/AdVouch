"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { ServiceMap } from "@/components/map/service-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, MapPin, Clock, Loader2, Building2 } from "lucide-react"
import Link from "next/link"
import type { Business } from "@/types"
import Image from "next/image"

// Mock businesses data with realistic Addis Ababa coordinates
const mockBusinesses: Business[] = [
  {
    id: "biz-1",
    name: "CleanPro Services",
    description: "Professional cleaning service with eco-friendly products and experienced staff.",
    category: "Home Services",
    location: "Bole, Addis Ababa",
    address: "Bole Road, near Edna Mall, Addis Ababa, Ethiopia",
    reputationScore: 87,
    coordinates: { lat: 8.9806, lng: 38.7578 },
    contact: {
      phone: "+251 911 123 456",
      email: "info@cleanpro.com",
      website: "www.cleanpro.com",
    },
    memberSince: "2023-06-01",
    isVerified: true,
    logoUrl: "/logo/image.png",
  },
  {
    id: "biz-2",
    name: "AutoFix Garage",
    description: "Full-service auto repair shop with certified mechanics and quality parts.",
    category: "Automotive",
    location: "Merkato, Addis Ababa",
    address: "Merkato Area, Auto Spare Parts District, Addis Ababa, Ethiopia",
    reputationScore: 92,
    coordinates: { lat: 9.0084, lng: 38.7267 },
    contact: {
      phone: "+251 911 987 654",
      email: "service@autofix.com",
      website: "www.autofix.com",
    },
    memberSince: "2022-03-15",
    isVerified: true,
    logoUrl: "/logo/image-1.png",
  },
  {
    id: "biz-3",
    name: "FitLife Personal Training",
    description: "Certified personal trainers offering customized fitness programs.",
    category: "Health & Wellness",
    location: "Kazanchis, Addis Ababa",
    address: "Kazanchis Business District, near ECA, Addis Ababa, Ethiopia",
    reputationScore: 23,
    coordinates: { lat: 9.0192, lng: 38.7525 },
    contact: {
      phone: "+251 911 456 789",
      email: "info@fitlife.com",
    },
    memberSince: "2024-01-10",
    isVerified: false,
    logoUrl: "/logo/image-2.png",
  },
  {
    id: "biz-4",
    name: "TechSolutions Inc",
    description: "Modern web development and IT consulting services.",
    category: "Technology",
    location: "CMC, Addis Ababa",
    address: "CMC Area, near Friendship City Center, Addis Ababa, Ethiopia",
    reputationScore: 105,
    coordinates: { lat: 9.0054, lng: 38.7636 },
    contact: {
      phone: "+251 911 321 098",
      email: "hello@techsolutions.com",
      website: "www.techsolutions.com",
    },
    memberSince: "2021-08-20",
    isVerified: true,
    logoUrl: "/logo/image.png",
  },
  {
    id: "biz-5",
    name: "Gourmet Catering Co",
    description: "Premium catering services for all occasions with fresh, local ingredients.",
    category: "Food & Dining",
    location: "Piassa, Addis Ababa",
    address: "Piassa Area, near St. George Cathedral, Addis Ababa, Ethiopia",
    reputationScore: -45,
    coordinates: { lat: 9.0348, lng: 38.7369 },
    contact: {
      phone: "+251 911 654 321",
      email: "events@gourmetcatering.com",
    },
    memberSince: "2023-11-05",
    isVerified: false,
    logoUrl: "/logo/image-2.png",
  },
  {
    id: "biz-6",
    name: "StyleCut Hair Salon",
    description: "Professional hair styling services with experienced stylists.",
    category: "Beauty & Personal Care",
    location: "Arat Kilo, Addis Ababa",
    address: "Arat Kilo Area, near Addis Ababa University, Addis Ababa, Ethiopia",
    reputationScore: -75,
    coordinates: { lat: 9.0411, lng: 38.7614 },
    contact: {
      phone: "+251 911 789 012",
      email: "info@stylecut.com",
    },
    memberSince: "2023-09-12",
    isVerified: false,
    logoUrl: "/logo/image-1.png",
  },
]

export default function MapPage() {
  const [businesses, setBusinesses] = useState(mockBusinesses)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Map</h1>
          <p className="text-muted-foreground">
            Explore {businesses.length} businesses on the map • Switch between OpenStreetMap and Satellite view
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {!isMapLoaded ? (
                  <div className="h-[600px] flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading interactive map...</p>
                      <p className="text-sm text-muted-foreground mt-2">Powered by OpenStreetMap & ArcGIS</p>
                    </div>
                  </div>
                ) : (
                  <ServiceMap
                    businesses={businesses}
                    selectedBusiness={selectedBusiness}
                    onBusinessSelect={setSelectedBusiness}
                    height="600px"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Business List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Businesses ({businesses.length})</span>
                  {selectedBusiness && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBusiness(null)}
                      className="text-xs bg-transparent"
                    >
                      Clear Selection
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto map-sidebar">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className={`p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${selectedBusiness?.id === business.id ? "bg-muted border-l-4 border-l-primary" : ""
                        }`}
                      onClick={() => setSelectedBusiness(business)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={business.logoUrl}
                              alt={`${business.name} logo`}
                              fill
                              className="object-cover rounded-lg"
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-2">{business.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {business.category}
                              </Badge>
                              {selectedBusiness?.id === business.id && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-primary/10 text-primary border-primary/20"
                                >
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">
                              {business.reputationScore > 0 ? "+" : ""}
                              {business.reputationScore}
                            </div>
                            <div className="text-xs text-muted-foreground">reputation</div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">{business.description}</p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{business.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Since {new Date(business.memberSince).getFullYear()}</span>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                          <Link href={`/businesses/${business.id}`}>
                            <ExternalLink className="h-3 w-3 mr-2" />
                            View Business
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}

                  {businesses.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No businesses found matching your criteria.</p>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedBusiness(null)}
                        className="mt-4 bg-transparent"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reputation Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                  <span className="text-xs">Trusted Champion (≥+100) / Trusted Provider (+60 to +99)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
                  <span className="text-xs">Growing Reputation (+20 to +59)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-sm"></div>
                  <span className="text-xs">New / Neutral (-19 to +19)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
                  <span className="text-xs">Under Watch (-20 to -59)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                  <span className="text-xs">Poor Standing (-60 to -99) / Not Recommended (≤-100)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
