"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getUser } from "@/lib/auth"
import { Star, TrendingUp, Award, CheckCircle } from "lucide-react"

export default function AdvertiserReputationPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user || user.mode !== "advertiser") {
      router.push("/auth")
    }
  }, [router])

  // Mock reputation data
  const overallRating = 4.7
  const totalReviews = 24
  const completedCampaigns = 18
  const successRate = 95

  const reputationBreakdown = [
    { stars: 5, count: 15, percentage: 62.5 },
    { stars: 4, count: 7, percentage: 29.2 },
    { stars: 3, count: 2, percentage: 8.3 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ]

  const recentReviews = [
    {
      id: "1",
      businessName: "FitTrack Pro",
      rating: 5,
      comment:
        "Excellent work! The Instagram stories were engaging and drove significant app downloads. Highly professional.",
      date: "2025-01-20",
      campaign: "Instagram Story Campaign",
    },
    {
      id: "2",
      businessName: "LearnAI",
      rating: 5,
      comment: "Outstanding video review! Clear, informative, and authentic. Exceeded our expectations.",
      date: "2025-01-18",
      campaign: "YouTube Review Video",
    },
    {
      id: "3",
      businessName: "GreenThreads",
      rating: 4,
      comment: "Good content quality. Delivered on time and met all requirements. Would work together again.",
      date: "2025-01-15",
      campaign: "Blog Post Series",
    },
  ]

  const achievements = [
    { title: "Top Performer", description: "Maintained 4.5+ rating for 6 months", icon: Award, unlocked: true },
    { title: "Quick Responder", description: "Average response time under 2 hours", icon: TrendingUp, unlocked: true },
    { title: "Reliable Partner", description: "100% on-time delivery rate", icon: CheckCircle, unlocked: true },
    { title: "Rising Star", description: "Complete 25 campaigns", icon: Star, unlocked: false },
  ]

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Reputation</h1>
          <p className="text-muted-foreground">Track your ratings, reviews, and achievements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Rating */}
            <Card className="p-6">
              <div className="flex items-start gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{overallRating}</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= Math.floor(overallRating) ? "fill-yellow-500 text-yellow-500" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{totalReviews} reviews</div>
                </div>

                <div className="flex-1 space-y-3">
                  {reputationBreakdown.map((item) => (
                    <div key={item.stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium">{item.stars}</span>
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      </div>
                      <Progress value={item.percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="text-3xl font-bold mb-1">{completedCampaigns}</div>
                <div className="text-sm text-muted-foreground">Completed Campaigns</div>
              </Card>
              <Card className="p-6">
                <div className="text-3xl font-bold mb-1">{successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </Card>
            </div>

            {/* Recent Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold mb-1">{review.businessName}</h3>
                        <p className="text-sm text-muted-foreground">{review.campaign}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
                    <div className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Achievements</h3>
              <div className="space-y-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon
                  return (
                    <div key={index} className={`flex items-start gap-3 ${!achievement.unlocked && "opacity-50"}`}>
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${achievement.unlocked ? "bg-primary/10" : "bg-muted"}`}
                      >
                        <Icon
                          className={`h-5 w-5 ${achievement.unlocked ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{achievement.title}</h4>
                          {achievement.unlocked && (
                            <Badge variant="secondary" className="text-xs">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Improve Your Reputation</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Deliver high-quality work consistently</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Communicate promptly with businesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Meet deadlines and exceed expectations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Request feedback after completing campaigns</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
