"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getUser } from "@/lib/auth"
import { mockOffers, mockAds } from "@/lib/mock-data"
import { ArrowLeft, Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react"

export default function OfferApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  useEffect(() => {
    const user = getUser()
    if (!user || user.mode !== "business") {
      router.push("/auth")
    }
  }, [router])

  const offer = mockOffers.find((o) => o.id === id)
  const ad = offer ? mockAds.find((a) => a.id === offer.adId) : null

  // Mock applications data
  const applications = [
    {
      id: "1",
      advertiserName: "FitLife Media",
      bidAmount: 1200,
      proposal:
        "I run a health and fitness Instagram account with 45k engaged followers. My audience is primarily 25-40 year olds interested in fitness and wellness. I can create 5 high-quality story posts showcasing your app's key features with swipe-up links.",
      status: "pending",
      submittedAt: "2025-01-22",
      advertiserReputation: 4.7,
    },
    {
      id: "2",
      advertiserName: "Wellness Warriors",
      bidAmount: 1500,
      proposal:
        "With 80k followers in the health niche, I specialize in app reviews and tutorials. I'll create engaging stories with before/after transformations and feature highlights. My engagement rate is 8.5%.",
      status: "pending",
      submittedAt: "2025-01-21",
      advertiserReputation: 4.9,
    },
    {
      id: "3",
      advertiserName: "Active Lifestyle",
      bidAmount: 1000,
      proposal:
        "I have 30k followers focused on fitness and nutrition. I can deliver authentic, relatable content that resonates with your target audience. Previous campaigns have seen 12% conversion rates.",
      status: "accepted",
      submittedAt: "2025-01-20",
      advertiserReputation: 4.6,
    },
  ]

  if (!offer || !ad) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Offer not found</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "rejected":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/business/offers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to offers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{offer.title}</h1>
              <p className="text-muted-foreground">Review and manage applications for this offer</p>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{application.advertiserName}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{application.advertiserReputation}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(application.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold mb-1">${application.bidAmount.toLocaleString()}</div>
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
                      >
                        {getStatusIcon(application.status)}
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Proposal</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{application.proposal}</p>
                  </div>

                  {application.status === "pending" && (
                    <div className="flex items-center gap-3">
                      <Button size="sm">Accept</Button>
                      <Button size="sm" variant="outline">
                        Reject
                      </Button>
                      <Button size="sm" variant="ghost">
                        Message
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {applications.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No applications yet</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Offer Details</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Budget</div>
                  <div className="text-2xl font-bold">${offer.budget.toLocaleString()}</div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Deadline</div>
                      <div className="font-medium">{new Date(offer.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Applications</div>
                      <div className="font-medium">{applications.length} received</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium mb-2">Status</div>
                  <Badge variant={offer.status === "open" ? "default" : "secondary"}>{offer.status}</Badge>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <Link href={`/business/offers/${offer.id}/edit`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    Edit Offer
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full">
                  Close Offer
                </Button>
              </div>
            </Card>

            {/* Related Ad */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Related Campaign</h3>
              <div className="space-y-3">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={ad.imageUrl || "/placeholder.svg"} alt={ad.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-semibold">{ad.title}</h4>
                <Link href={`/ads/${ad.id}`}>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Campaign
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
