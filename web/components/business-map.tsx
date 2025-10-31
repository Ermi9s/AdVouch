"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Clock, Building2 } from "lucide-react"
import type { Business } from "@/lib/mock-data"
import { mockAds } from "@/lib/mock-data"
import Link from "next/link"
import Image from "next/image"
import { ServiceMap } from "@/components/map/service-map"

interface BusinessMapProps {
  businesses: Business[]
  userMode?: "user" | "business" | "advertiser"
}

export function BusinessMap({ businesses, userMode }: BusinessMapProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  const getBusinessAds = (businessId: string) => {
    return mockAds.filter((ad) => ad.businessId === businessId)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-0">
            <ServiceMap
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onBusinessSelect={setSelectedBusiness}
              height="600px"
            />
          </CardContent>
        </Card>
      </div>

      {/* Business List Sidebar */}
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
                  Clear
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[520px] overflow-y-auto">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className={`p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedBusiness?.id === business.id ? "bg-muted border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => setSelectedBusiness(business)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <Image
                          src={business.imageUrl || "/placeholder.svg"}
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
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">
                          {business.reputation > 0 ? "+" : ""}
                          {business.reputation}
                        </div>
                        <div className="text-xs text-muted-foreground">reputation</div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{business.description}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{business.location.city}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{business.totalAds} ads</span>
                      </div>
                    </div>

                    {selectedBusiness?.id === business.id && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <h4 className="font-medium text-xs">Latest Ads</h4>
                        {getBusinessAds(business.id)
                          .slice(0, 3)
                          .map((ad) => (
                            <Link key={ad.id} href={`/ads/${ad.id}`}>
                              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs line-clamp-1">{ad.title}</p>
                                  <p className="text-xs text-muted-foreground">${ad.budget.toLocaleString()}</p>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              </div>
                            </Link>
                          ))}
                        <Button variant="outline" size="sm" className="w-full bg-transparent mt-2" asChild>
                          <Link href={`/business/${business.id}`}>
                            <Building2 className="h-3 w-3 mr-2" />
                            View All Ads
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reputation Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Reputation Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Trusted (≥+60)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Growing (+20 to +59)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-xs">Neutral (-19 to +19)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs">Under Watch (-20 to -59)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Poor (≤-60)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
