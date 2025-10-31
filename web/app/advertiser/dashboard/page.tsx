"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProfileCompletionBanner } from "@/components/profile-completion-banner"
import { getUser, isProfileComplete } from "@/lib/auth"
import { mockOffers, mockAds } from "@/lib/mock-data"
import { Briefcase, CheckCircle, Clock, TrendingUp, Loader2 } from "lucide-react"
import { applicationsApi, offersApi } from "@/lib/api"
import type { Application, Offer } from "@/lib/types"

export default function AdvertiserDashboardPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Add a small delay to allow mode switch to complete
    const timer = setTimeout(() => {
      const currentUser = getUser()
      setUser(currentUser)
      if (!currentUser || currentUser.mode !== "advertiser") {
        console.log("[AdvertiserDashboard] User not in advertiser mode, redirecting to auth")
        router.push("/auth")
      }
      setIsCheckingAuth(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  // Fetch applications and offers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Try to fetch applications
        try {
          const applicationsResponse = await applicationsApi.list()
          const applications = (applicationsResponse.results || [])
            .filter((a) => a.id && !isNaN(a.id)) // Filter out invalid IDs
          setApplications(applications)
        } catch (err) {
          console.warn("Failed to fetch applications from API:", err)
          setApplications([])
        }

        // Try to fetch offers
        try {
          const offersResponse = await offersApi.list()
          const offers = (offersResponse.results || [])
            .filter((o) => o.id && !isNaN(o.id)) // Filter out invalid IDs
          setOffers(offers)
        } catch (err) {
          console.warn("Failed to fetch offers from API:", err)
          setOffers(mockOffers.map((offer) => ({
            id: parseInt(offer.id),
            ad: parseInt(offer.adId),
            business: parseInt(offer.businessId),
            maximum_offer_amount: offer.budget.toString(),
            description: offer.description,
            status: "Active",
            created_at: new Date().toISOString(),
          })).filter((o) => !isNaN(o.id))) // Filter out NaN IDs from parseInt
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalApplications = applications.length
  const acceptedApplications = applications.filter((app) => app.status === "Active").length
  const pendingApplications = applications.filter((app) => app.status === "Inactive").length
  const totalEarnings = applications.reduce((sum, app) => sum + parseFloat(app.offer_bid), 0)

  const showBanner = user && !isProfileComplete("advertiser")

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background theme-advertiser flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background theme-advertiser">
      {showBanner && <ProfileCompletionBanner mode="advertiser" />}

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Browse offers and manage your applications</p>
              </div>
              <Link href="/advertiser/offers">
                <Button size="lg">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Offers
                </Button>
              </Link>
            </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{totalApplications}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{acceptedApplications}</div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{pendingApplications}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">${totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Earnings</div>
          </Card>
        </div>

        {/* Available Offers */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Available Offers</h2>
            <Link href="/advertiser/offers">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockOffers.map((offer) => {
              const ad = mockAds.find((a) => a.id === offer.adId)
              return (
                <Card key={offer.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{offer.title}</h3>
                    <span className="text-lg font-bold text-primary">${offer.budget.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{ad?.businessName}</p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{offer.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Deadline: {new Date(offer.deadline).toLocaleDateString()}
                    </span>
                    <Link href={`/advertiser/offers/${offer.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Applications</h2>
            <Link href="/advertiser/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Instagram Story Campaign</h3>
                  <p className="text-sm text-muted-foreground">FitTrack Pro</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium mb-1">$1,200</div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    Pending
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">YouTube Review Video</h3>
                  <p className="text-sm text-muted-foreground">LearnAI</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium mb-1">$2,300</div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Accepted
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
