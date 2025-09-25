"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { SearchFilters } from "@/components/search-filters"
import { AdCard } from "@/components/ad-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import type { Ad, Business } from "@/types"
import Image from "next/image"

// Mock businesses data
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
    logoUrl: "/logos/image.png",
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
    logoUrl: "/logos/image-1.png",
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
    isVerified: true,
    logoUrl: "/logos/image-2.png",
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
    logoUrl: "/logos/image.png",
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
    isVerified: true,
    logoUrl: "/logos/image-1.png",
  },
]

// Update the mock ads data to include Addis Ababa locations
const mockAds: Ad[] = [
  {
    id: "ad-1",
    title: "Spring Cleaning Special - 50% Off First Service",
    description:
      "Get your home sparkling clean with our professional spring cleaning service. Eco-friendly products, experienced staff, and satisfaction guaranteed.",
    category: "Home Services",
    location: "Bole, Addis Ababa",
    publishedAt: "2024-01-15T10:00:00Z",
    businessId: "biz-1",
    business: mockBusinesses[0],
    imageUrl: "/image.png",
    tags: ["spring-cleaning", "eco-friendly", "discount"],
    shareCount: 24,
    vouchCount: 18,
  },
  {
    id: "ad-2",
    title: "Expert Auto Repair - Free Diagnostic",
    description:
      "Bring your car to our certified mechanics for a free diagnostic check. We specialize in brake repair, oil changes, and engine diagnostics.",
    category: "Automotive",
    location: "Merkato, Addis Ababa",
    publishedAt: "2024-01-14T14:30:00Z",
    businessId: "biz-2",
    business: mockBusinesses[1],
    imageUrl: "/image-1.png",
    tags: ["auto-repair", "free-diagnostic", "certified"],
    shareCount: 31,
    vouchCount: 27,
  },
  {
    id: "ad-3",
    title: "Personal Training Sessions - New Year Special",
    description:
      "Transform your health with our certified personal trainers. Customized workout plans and nutrition guidance available.",
    category: "Health & Wellness",
    location: "Kazanchis, Addis Ababa",
    publishedAt: "2024-01-13T09:15:00Z",
    businessId: "biz-3",
    business: mockBusinesses[2],
    imageUrl: "/image-2.png",
    tags: ["fitness", "personal-training", "nutrition"],
    shareCount: 15,
    vouchCount: 12,
  },
  {
    id: "ad-4",
    title: "Modern Website Development - Portfolio Available",
    description:
      "Professional web development services using the latest technologies. From simple websites to complex web applications.",
    category: "Technology",
    location: "CMC, Addis Ababa",
    publishedAt: "2024-01-12T16:45:00Z",
    businessId: "biz-4",
    business: mockBusinesses[3],
    imageUrl: "/image.png",
    tags: ["web-development", "modern", "portfolio"],
    shareCount: 42,
    vouchCount: 35,
  },
  {
    id: "ad-5",
    title: "Catering Services for Your Next Event",
    description:
      "Premium catering for weddings, corporate events, and private parties. Fresh ingredients and creative menus.",
    category: "Food & Dining",
    location: "Piassa, Addis Ababa",
    publishedAt: "2024-01-11T11:20:00Z",
    businessId: "biz-5",
    business: mockBusinesses[4],
    imageUrl: "/image-1.png",
    tags: ["catering", "events", "premium"],
    shareCount: 8,
    vouchCount: 3,
  },
  {
    id: "ad-6",
    title: "Freelance Graphic Design Services",
    description:
      "Creative graphic design for logos, branding, and marketing materials. Quick turnaround and affordable rates.",
    category: "Professional Services",
    location: "4 Kilo, Addis Ababa",
    publishedAt: "2024-01-10T13:00:00Z",
    imageUrl: "/image-2.png",
    tags: ["graphic-design", "freelance", "branding"],
    shareCount: 19,
    vouchCount: 14,
  },
]

export default function HomePage() {
  const [searchType, setSearchType] = useState<"ads" | "businesses">("ads")
  const [ads, setAds] = useState(mockAds)
  const [businesses, setBusinesses] = useState(mockBusinesses)
  const [filteredAds, setFilteredAds] = useState(mockAds)
  const [filteredBusinesses, setFilteredBusinesses] = useState(mockBusinesses)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const handleSearch = (query: string) => {
    setLoading(true)
    setTimeout(() => {
      if (searchType === "ads") {
        if (query) {
          const filtered = ads.filter(
            (ad) =>
              ad.title.toLowerCase().includes(query.toLowerCase()) ||
              ad.description.toLowerCase().includes(query.toLowerCase()) ||
              ad.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
          )
          setFilteredAds(filtered)
        } else {
          setFilteredAds(ads)
        }
      } else {
        if (query) {
          const filtered = businesses.filter(
            (business) =>
              business.name.toLowerCase().includes(query.toLowerCase()) ||
              business.description.toLowerCase().includes(query.toLowerCase()),
          )
          setFilteredBusinesses(filtered)
        } else {
          setFilteredBusinesses(businesses)
        }
      }
      setLoading(false)
    }, 500)
  }

  const handleCategoryFilter = (category: string) => {
    setLoading(true)
    setTimeout(() => {
      if (searchType === "ads") {
        if (category) {
          const filtered = ads.filter((ad) => ad.category === category)
          setFilteredAds(filtered)
        } else {
          setFilteredAds(ads)
        }
      } else {
        if (category) {
          const filtered = businesses.filter((business) => business.category === category)
          setFilteredBusinesses(filtered)
        } else {
          setFilteredBusinesses(businesses)
        }
      }
      setLoading(false)
    }, 300)
  }

  const handleLocationFilter = (location: string) => {
    setLoading(true)
    setTimeout(() => {
      if (searchType === "ads") {
        if (location) {
          const filtered = ads.filter((ad) => ad.location.includes(location.split(",")[0]))
          setFilteredAds(filtered)
        } else {
          setFilteredAds(ads)
        }
      } else {
        if (location) {
          const filtered = businesses.filter((business) => business.location.includes(location.split(",")[0]))
          setFilteredBusinesses(filtered)
        } else {
          setFilteredBusinesses(businesses)
        }
      }
      setLoading(false)
    }, 300)
  }

  const handleClearFilters = () => {
    if (searchType === "ads") {
      setFilteredAds(ads)
    } else {
      setFilteredBusinesses(businesses)
    }
  }

  const handleSearchTypeChange = (type: "ads" | "businesses") => {
    setSearchType(type)
    handleClearFilters()
  }

  const loadMore = () => {
    setLoading(true)
    setTimeout(() => {
      setPage(page + 1)
      setLoading(false)
      if (page >= 3) {
        setHasMore(false)
      }
    }, 1000)
  }

  const currentData = searchType === "ads" ? filteredAds : filteredBusinesses
  const currentCount = currentData.length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SearchFilters
        searchType={searchType}
        onSearchTypeChange={handleSearchTypeChange}
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        onLocationFilter={handleLocationFilter}
        onClearFilters={handleClearFilters}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {searchType === "ads" ? "Discover Local Ads" : "Find Trusted Businesses"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {searchType === "ads"
              ? "Browse the latest ads from local service providers and discover great deals in your area."
              : "Find reliable businesses backed by community reputation scores and authentic feedback."}
          </p>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {searchType === "ads" ? "Latest Ads" : "Available Businesses"}
          </h2>
          <p className="text-muted-foreground">
            {currentCount} {searchType === "ads" ? "ad" : "business"}
            {currentCount !== 1 ? "es" : ""} found
          </p>
        </div>

        {loading && currentCount === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {searchType === "ads" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {filteredAds.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {filteredBusinesses.map((business) => (
                  <Link key={business.id} href={`/businesses/${business.id}`}>
                    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <Image
                                src={business.logoUrl || "/placeholder.svg"}
                                alt={`${business.name} logo`}
                                fill
                                className="object-cover rounded-lg"
                                sizes="48px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-foreground line-clamp-2">{business.name}</h3>
                              <Badge variant="secondary" className="mt-1">
                                {business.category}
                              </Badge>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">
                                  {business.reputationScore > 0 ? "+" : ""}
                                  {business.reputationScore}
                                </div>
                                <div className="text-xs text-muted-foreground">reputation</div>
                              </div>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm line-clamp-3">{business.description}</p>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{business.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Since {new Date(business.memberSince).getFullYear()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {currentCount === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No {searchType === "ads" ? "ads" : "businesses"} found matching your criteria.
                </p>
                <Button variant="outline" onClick={handleClearFilters} className="mt-4 bg-transparent">
                  Clear Filters
                </Button>
              </div>
            )}

            {hasMore && currentCount > 0 && (
              <div className="text-center">
                <Button onClick={loadMore} disabled={loading} className="px-8">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Powered by AdVouch</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
