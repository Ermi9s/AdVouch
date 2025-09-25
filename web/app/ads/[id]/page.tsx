"use client"

import type React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { ReputationBadge } from "@/components/reputation-badge"
import { LocationMap } from "@/components/map/location-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Clock, Flag, Send, User, ThumbsUp, ThumbsDown, Navigation } from "lucide-react"

// Mock data with coordinates
const mockAd = {
  id: "1",
  title: "Professional House Cleaning Service",
  description:
    "Reliable and thorough house cleaning service with eco-friendly products. We handle everything from deep cleaning to regular maintenance. Our experienced team ensures your home is spotless and sanitized using only the best eco-friendly cleaning products. We offer flexible scheduling and competitive rates.",
  category: "Home Services",
  location: "Bole, Addis Ababa",
  address: "Bole Road, near Edna Mall, Addis Ababa, Ethiopia",
  reputationScore: 87,
  publishedAt: "2024-01-15T10:00:00Z",
  coordinates: { lat: 8.9806, lng: 38.7578 },
  publisher: {
    name: "CleanPro Services",
    isPublic: true,
    memberSince: "2023-06-01",
  },
  contact: {
    phone: "+251 911 123 456",
    email: "info@cleanpro.com",
    website: "www.cleanpro.com",
  },
  imageUrls: ["/image.png", "/image-1.png", "/image-2.png"],
}

const mockComments = [
  {
    id: "1",
    userId: "2",
    userName: "Sarah Johnson",
    comment:
      "Excellent service! They were punctual, professional, and did an amazing job cleaning my apartment. Highly recommend!",
    timestamp: "2024-01-10T14:30:00Z",
    scoreEffect: 2,
    isRelevant: true,
  },
  {
    id: "2",
    userId: "3",
    userName: "Mike Chen",
    comment: "Good service overall, but they missed a few spots in the bathroom. Still satisfied with the work.",
    timestamp: "2024-01-08T09:15:00Z",
    scoreEffect: 1,
    isRelevant: true,
  },
  {
    id: "3",
    userId: "4",
    userName: "Lisa Rodriguez",
    comment: "Had to reschedule twice due to their availability issues. When they finally came, the work was decent.",
    timestamp: "2024-01-05T16:45:00Z",
    scoreEffect: -1,
    isRelevant: true,
  },
]

export default function AdDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState(mockComments)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a comment.",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) return

    setIsSubmitting(true)

    // Simulate AI processing
    setTimeout(() => {
      const scoreEffect = Math.floor(Math.random() * 5) - 2 // -2 to +2
      const isRelevant = Math.random() > 0.2 // 80% chance of being relevant

      const newComment = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        comment: comment.trim(),
        timestamp: new Date().toISOString(),
        scoreEffect: isRelevant ? scoreEffect : 0,
        isRelevant,
      }

      setComments([newComment, ...comments])
      setComment("")
      setIsSubmitting(false)

      toast({
        title: isRelevant ? "Comment submitted!" : "Comment received",
        description: isRelevant
          ? `Your comment has been processed and ${scoreEffect > 0 ? "positively" : scoreEffect < 0 ? "negatively" : "neutrally"} affected the reputation score.`
          : "Your comment was received but did not affect the reputation score as it was not deemed relevant to service quality.",
      })
    }, 2000)
  }

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for reporting this ad. We will review it shortly.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ad Header */}
            <Card>
              <CardContent className="p-6">
                {/* Image Gallery */}
                <div className="mb-6 rounded-lg overflow-hidden border bg-muted relative h-64 md:h-80 lg:h-96">
                  <Image
                    src={mockAd.imageUrls?.[selectedImageIndex] || "/placeholder.svg"}
                    alt={`${mockAd.title} - Image ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {mockAd.imageUrls && mockAd.imageUrls.length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                        onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? mockAd.imageUrls.length - 1 : prev - 1))}
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                        onClick={() => setSelectedImageIndex((prev) => (prev === mockAd.imageUrls.length - 1 ? 0 : prev + 1))}
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                        {selectedImageIndex + 1} / {mockAd.imageUrls.length}
                      </div>
                    </>
                  )}
                </div>
                {mockAd.imageUrls && mockAd.imageUrls.length > 1 && (
                  <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    {mockAd.imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity ${selectedImageIndex === index ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <Image
                          src={url}
                          alt={`${mockAd.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{mockAd.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {mockAd.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(mockAd.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="secondary" className="mb-4">
                      {mockAd.category}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-end space-y-2">

                    <Button variant="outline" size="sm" onClick={handleReport}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{mockAd.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Comments and Location */}
            <Card>
              <Tabs defaultValue="comments" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="comments">Community Feedback</TabsTrigger>
                    <TabsTrigger value="location">Location & Map</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  <TabsContent value="comments" className="space-y-6 mt-0">
                    {/* Comment Form */}
                    {user ? (
                      <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <Textarea
                          placeholder="Share your experience with this service..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                        />
                        <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                          {isSubmitting ? (
                            "Processing..."
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Feedback
                            </>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-8 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground mb-4">Sign in to leave feedback</p>
                        <Button asChild>
                          <Link href="/login">Sign In</Link>
                        </Button>
                      </div>
                    )}

                    <Separator />

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium text-foreground">{comment.userName}</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>

                          </div>
                          <p className="text-foreground">{comment.comment}</p>
                          {!comment.isRelevant && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              This comment did not affect the reputation score.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {comments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No feedback yet. Be the first to share your experience!
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4 mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Service Location</h3>
                        <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4" />
                          <span>{mockAd.address}</span>
                        </div>
                      </div>

                      <LocationMap address={mockAd.address} coordinates={mockAd.coordinates} height="400px" />

                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/map">
                            <MapPin className="h-4 w-4 mr-2" />
                            View on Map
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publisher Info */}
            <Card>
              <CardHeader>
                <CardTitle>Service Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">{mockAd.publisher.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(mockAd.publisher.memberSince).toLocaleDateString()}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Phone:</strong> {mockAd.contact.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {mockAd.contact.email}
                    </p>
                    <p>
                      <strong>Website:</strong> {mockAd.contact.website}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reputation Details */}
            <Card>
              <CardHeader>
                <CardTitle>Reputation Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary mb-2">{mockAd.reputationScore}</div>
                  <ReputationBadge score={mockAd.reputationScore} showTooltip={false} />
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    This score is calculated by our AI agent based on community feedback and service quality indicators.
                  </p>
                  <p>Scores are updated in real-time as new feedback is received.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
