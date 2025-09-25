"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { MessageSquare, ThumbsUp, ThumbsDown, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"

// Mock data for user vouchs
const mockUserVouchs = [
  {
    id: "1",
    adId: "1",
    adTitle: "Professional House Cleaning Service",
    vouch:
      "Excellent service! They were punctual, professional, and did an amazing job cleaning my apartment. Highly recommend!",
    timestamp: "2024-01-10T14:30:00Z",
    scoreEffect: 2,
    status: "approved",
    isRelevant: true,
  },
  {
    id: "2",
    adId: "2",
    adTitle: "Expert Auto Repair & Maintenance",
    vouch: "Great work on my car. Fixed the brake issue quickly and at a fair price.",
    timestamp: "2024-01-08T09:15:00Z",
    scoreEffect: 1,
    status: "approved",
    isRelevant: true,
  },
  {
    id: "3",
    adId: "3",
    adTitle: "Personal Fitness Training",
    vouch: "The trainer was knowledgeable but the gym facilities were not as clean as expected.",
    timestamp: "2024-01-05T16:45:00Z",
    scoreEffect: -1,
    status: "approved",
    isRelevant: true,
  },
  {
    id: "4",
    adId: "4",
    adTitle: "Web Development Services",
    vouch: "This is just a test vouch that is not relevant to the service quality.",
    timestamp: "2024-01-03T11:20:00Z",
    scoreEffect: 0,
    status: "rejected",
    isRelevant: false,
  },
  {
    id: "5",
    adId: "5",
    adTitle: "Gourmet Catering Services",
    vouch: "Food was okay but service was slow. Expected better for the price.",
    timestamp: "2024-01-01T13:30:00Z",
    scoreEffect: -1,
    status: "flagged",
    isRelevant: true,
  },
]

export default function MyCommentsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to view your comments.</p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const getFilteredComments = () => {
    switch (activeTab) {
      case "approved":
        return mockUserVouchs.filter((comment) => comment.status === "approved")
      case "rejected":
        return mockUserVouchs.filter((comment) => comment.status === "rejected")
      case "flagged":
        return mockUserVouchs.filter((comment) => comment.status === "flagged")
      default:
        return mockUserVouchs
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "flagged":
        return <Badge className="bg-yellow-100 text-yellow-800">Flagged</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getScoreEffectIcon = (scoreEffect: number) => {
    if (scoreEffect > 0) {
      return <ThumbsUp className="h-4 w-4 text-green-600" />
    } else if (scoreEffect < 0) {
      return <ThumbsDown className="h-4 w-4 text-red-600" />
    }
    return <div className="h-4 w-4" />
  }

  const filteredComments = getFilteredComments()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Vouchs</h1>
          <p className="text-gray-600">
            Track your vouch contributions and their impact on business reputation scores.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Vouchs</p>
                  <p className="text-2xl font-bold text-gray-900">{mockUserVouchs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockUserVouchs.filter((c) => c.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ThumbsDown className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockUserVouchs.filter((c) => c.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockUserVouchs.filter((c) => c.status === "flagged").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Vouch History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({mockUserVouchs.length})</TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({mockUserVouchs.filter((c) => c.status === "approved").length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({mockUserVouchs.filter((c) => c.status === "rejected").length})
                </TabsTrigger>
                <TabsTrigger value="flagged">
                  Flagged ({mockUserVouchs.filter((c) => c.status === "flagged").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredComments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link
                            href={`/ads/${comment.adId}`}
                            className="text-lg font-semibold text-primary-600 hover:text-primary-700 flex items-center"
                          >
                            {comment.adTitle}
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(comment.timestamp).toLocaleDateString()} at{" "}
                            {new Date(comment.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(comment.status)}
                          {comment.isRelevant && (
                            <div className="flex items-center space-x-1">
                              {getScoreEffectIcon(comment.scoreEffect)}
                              <span
                                className={`text-sm font-medium ${
                                  comment.scoreEffect > 0
                                    ? "text-green-600"
                                    : comment.scoreEffect < 0
                                      ? "text-red-600"
                                      : "text-gray-600"
                                }`}
                              >
                                {comment.scoreEffect > 0 ? "+" : ""}
                                {comment.scoreEffect}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{comment.vouch}</p>

                      {!comment.isRelevant && (
                        <p className="text-sm text-gray-500 italic">
                          This vouch was not considered relevant to service quality and did not affect the reputation
                          score.
                        </p>
                      )}

                      {comment.status === "flagged" && (
                        <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mt-2">
                          This vouch is under review by our moderation team.
                        </p>
                      )}
                    </div>
                  ))}

                  {filteredComments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No vouchs found in this category.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
