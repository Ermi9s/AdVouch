"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockBusinesses, categories } from "@/lib/mock-data"
import { Search, SlidersHorizontal, LogOut, Building2, TrendingUp, Target, Store, Loader2 } from "lucide-react"
import { getUser, logout } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { businessApi } from "@/lib/api"
import type { Business } from "@/lib/types"
import { SignInBanner } from "@/components/signin-banner"
import { GlobalModeSwitcher } from "@/components/global-mode-switcher"
import { SplitViewLayout } from "@/components/split-view-layout"
import { BusinessDetailsPanel } from "@/components/business-details-panel"

export default function BusinessesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("reputation")
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)

  // Check authentication status and get user
  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    setIsAuthenticated(!!currentUser)
  }, [])

  // Fetch businesses from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        try {
          const businessesResponse = await businessApi.list({
            search: searchQuery || undefined,
          })
          const businesses = (businessesResponse.results || [])
            .filter((b) => b.id && !isNaN(b.id)) // Filter out invalid IDs
          setBusinesses(businesses)
        } catch (err) {
          console.warn("Failed to fetch businesses from API, using mock data:", err)
          setBusinesses(mockBusinesses)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery])

  const filteredBusinesses = businesses
    .filter((business) => {
      const matchesSearch =
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All Categories" || business.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "reputation") return (b.reputation || 0) - (a.reputation || 0)
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return 0
    })

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const themeClass =
    user?.mode === "business" ? "theme-business" : user?.mode === "advertiser" ? "theme-advertiser" : ""

  const getModeContent = () => {
    switch (user?.mode) {
      case "business":
        return {
          icon: <TrendingUp className="h-5 w-5" />,
          title: "Competitor Analysis",
          description: "Explore other businesses in your market and analyze their advertising strategies",
        }
      case "advertiser":
        return {
          icon: <Target className="h-5 w-5" />,
          title: "Find Partners",
          description: "Discover businesses to partner with and promote their campaigns on your platform",
        }
      default:
        return {
          icon: <Store className="h-5 w-5" />,
          title: "Browse Businesses",
          description: "Discover local businesses and explore their products and services",
        }
    }
  }

  const modeContent = getModeContent()

  const getReputationColor = (reputation: number) => {
    if (reputation >= 80) return "text-green-500"
    if (reputation >= 50) return "text-yellow-500"
    if (reputation >= 0) return "text-orange-500"
    return "text-red-500"
  }

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 80) return "Excellent"
    if (reputation >= 50) return "Good"
    if (reputation >= 0) return "Fair"
    return "Poor"
  }

  return (
    <div className={`min-h-screen bg-background ${themeClass}`}>
      {!isAuthenticated && <SignInBanner />}

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading businesses...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">{modeContent.icon}</div>
                <h1 className="text-4xl font-bold">{modeContent.title}</h1>
              </div>
              <p className="text-muted-foreground text-lg">{modeContent.description}</p>
            </div>

            {/* Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search businesses by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reputation">Highest Reputation</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm text-muted-foreground">
                Showing {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "business" : "businesses"}
              </p>
            </div>

        {/* Business Grid with Split View */}
        {filteredBusinesses.length > 0 ? (
          <SplitViewLayout
            detailsContent={selectedBusinessId ? <BusinessDetailsPanel businessId={selectedBusinessId} /> : undefined}
            selectedId={selectedBusinessId}
            onClose={() => setSelectedBusinessId(null)}
          >
            <div className="space-y-3">
              {filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  onClick={() => {
                    // On mobile, navigate to detail page
                    if (window.innerWidth < 1024) {
                      router.push(`/businesses/${business.id}`)
                    } else {
                      // On desktop, show in split view
                      setSelectedBusinessId(business.id.toString())
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Card className="hover:shadow-lg transition-shadow hover:border-primary/50">
                    {/* Horizontal Layout */}
                    <div className="flex gap-3 p-3">
                      {/* Smaller Image - Left Side */}
                      <div className="w-32 h-24 flex-shrink-0 relative overflow-hidden rounded-md bg-muted">
                        <img
                          src={business.imageUrl || "/placeholder.svg"}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1">
                          <Badge variant="secondary" className="bg-background/90 backdrop-blur text-xs">
                            {business.totalAds} {business.totalAds === 1 ? "Ad" : "Ads"}
                          </Badge>
                        </div>
                      </div>

                      {/* Content - Right Side */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        {/* Title and Description */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base line-clamp-1">{business.name}</h3>
                              <Badge variant="outline" className="text-xs mt-1">
                                {business.category}
                              </Badge>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className={`text-xl font-bold ${getReputationColor(business.reputation)}`}>
                                {business.reputation}
                              </div>
                              <div className="text-xs text-muted-foreground">{getReputationBadge(business.reputation)}</div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{business.description}</p>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="line-clamp-1">{business.location?.address || business.location}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </SplitViewLayout>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No businesses found matching your criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All Categories")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
