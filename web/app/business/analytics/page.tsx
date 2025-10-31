"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { getUser } from "@/lib/auth"
import { mockAds } from "@/lib/mock-data"
import { TrendingUp, Eye, MousePointerClick, DollarSign, Star } from "lucide-react"

export default function BusinessAnalyticsPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user || user.mode !== "business") {
      router.push("/auth")
    }
  }, [router])

  const totalViews = mockAds.reduce((sum, ad) => sum + ad.views, 0)
  const totalClicks = mockAds.reduce((sum, ad) => sum + ad.clicks, 0)
  const totalBudget = mockAds.reduce((sum, ad) => sum + ad.budget, 0)
  const avgReputation = mockAds.reduce((sum, ad) => sum + ad.reputation, 0) / mockAds.length
  const clickThroughRate = ((totalClicks / totalViews) * 100).toFixed(2)

  // Mock performance data
  const performanceData = [
    { month: "Jan", views: 8500, clicks: 2100 },
    { month: "Feb", views: 12000, clicks: 3200 },
    { month: "Mar", views: 15000, clicks: 4100 },
    { month: "Apr", views: 18500, clicks: 5200 },
  ]

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics & Performance</h1>
          <p className="text-muted-foreground">Track your campaign performance and reputation metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span>+12%</span>
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{totalViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MousePointerClick className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span>+18%</span>
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{totalClicks.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Clicks</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>CTR</span>
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{clickThroughRate}%</div>
            <div className="text-sm text-muted-foreground">Click-Through Rate</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span>+0.2</span>
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{avgReputation.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg Reputation</div>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Performance Over Time</h2>
          <div className="space-y-4">
            {performanceData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{data.month}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-muted-foreground">
                      Views: <span className="font-medium text-foreground">{data.views.toLocaleString()}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Clicks: <span className="font-medium text-foreground">{data.clicks.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(data.clicks / data.views) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Performing Ads */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Top Performing Ads</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockAds
              .sort((a, b) => b.clicks - a.clicks)
              .slice(0, 4)
              .map((ad) => {
                const ctr = ((ad.clicks / ad.views) * 100).toFixed(2)
                return (
                  <Card key={ad.id} className="p-6">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={ad.imageUrl || "/placeholder.svg"}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-2 line-clamp-1">{ad.title}</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">Views</div>
                            <div className="font-semibold">{ad.views.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Clicks</div>
                            <div className="font-semibold">{ad.clicks.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">CTR</div>
                            <div className="font-semibold">{ctr}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Rating</div>
                            <div className="font-semibold flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              {ad.reputation}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
