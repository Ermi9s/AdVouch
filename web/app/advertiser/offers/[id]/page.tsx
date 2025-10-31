"use client"

import type React from "react"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { getUser } from "@/lib/auth"
import { mockOffers, mockAds } from "@/lib/mock-data"
import { ArrowLeft, Calendar, Users, Building2, Loader2 } from "lucide-react"
import { offersApi, adsApi, applicationsApi } from "@/lib/api"
import type { Offer, Ad } from "@/lib/types"

export default function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [bidAmount, setBidAmount] = useState("")
  const [proposal, setProposal] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [offer, setOffer] = useState<Offer | null>(null)
  const [ad, setAd] = useState<Ad | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user || user.mode !== "advertiser") {
      router.push("/auth")
    }
  }, [router])

  // Fetch offer and ad from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        try {
          const offersResponse = await offersApi.list()
          const foundOffer = offersResponse.results?.find((o) => o.id === parseInt(id))
          if (foundOffer) {
            setOffer(foundOffer)

            // Fetch the ad for this offer
            if (foundOffer.ad) {
              const adsResponse = await adsApi.list({ id: foundOffer.ad })
              const foundAd = adsResponse.results?.[0]
              if (foundAd) {
                setAd(foundAd)
              }
            }
          } else {
            // Fallback to mock data
            const mockOffer = mockOffers.find((o) => o.id === id)
            if (mockOffer) {
              setOffer({
                id: parseInt(mockOffer.id),
                ad: parseInt(mockOffer.adId),
                business: parseInt(mockOffer.businessId),
                maximum_offer_amount: mockOffer.budget.toString(),
                description: mockOffer.description,
                status: "Active",
                created_at: new Date().toISOString(),
              })
              const mockAd = mockAds.find((a) => a.id === mockOffer.adId)
              if (mockAd) {
                setAd({
                  id: parseInt(mockAd.id),
                  title: mockAd.title,
                  description: mockAd.description,
                  share_count: mockAd.views,
                  business: 1,
                  owner: 1,
                  status: mockAd.status as "draft" | "active" | "archived",
                  created_at: mockAd.createdAt,
                })
              }
            }
          }
        } catch (err) {
          console.warn("Failed to fetch from API, using mock data:", err)
          const mockOffer = mockOffers.find((o) => o.id === id)
          if (mockOffer) {
            setOffer({
              id: parseInt(mockOffer.id),
              ad: parseInt(mockOffer.adId),
              business: parseInt(mockOffer.businessId),
              maximum_offer_amount: mockOffer.budget.toString(),
              description: mockOffer.description,
              status: "Active",
              created_at: new Date().toISOString(),
            })
            const mockAd = mockAds.find((a) => a.id === mockOffer.adId)
            if (mockAd) {
              setAd({
                id: parseInt(mockAd.id),
                title: mockAd.title,
                description: mockAd.description,
                share_count: mockAd.views,
                business: 1,
                owner: 1,
                status: mockAd.status as "draft" | "active" | "archived",
                created_at: mockAd.createdAt,
              })
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (offer) {
        await applicationsApi.create({
          offer: offer.id,
          status: "Inactive",
        })
      }
      router.push("/advertiser/applications")
    } catch (err) {
      console.error("Failed to submit application:", err)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading offer...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Offer not found</p>
            <Link href="/advertiser/offers" className="text-primary hover:underline mt-4 inline-block">
              Back to offers
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/advertiser/offers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to offers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold text-balance">{offer.description || "Offer"}</h1>
                <Badge variant={offer.status === "Active" ? "default" : "secondary"}>{offer.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">Business</span>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Offer Description</h2>
              <p className="text-muted-foreground leading-relaxed">{offer.description}</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Related Campaign</h3>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src="/placeholder.svg" alt={ad?.title || "Ad"} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1">{ad?.title || "Campaign"}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ad?.description}</p>
                  {ad && (
                    <Link href={`/ads/${ad.id}`}>
                      <Button variant="outline" size="sm">
                        View Campaign
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>

            {showApplicationForm && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Submit Your Application</h2>
                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bidAmount">Your Bid Amount ($)</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      placeholder="Enter your bid"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Suggested budget: ${parseFloat(offer.maximum_offer_amount).toLocaleString()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proposal">Your Proposal</Label>
                    <Textarea
                      id="proposal"
                      placeholder="Explain why you're a great fit for this campaign..."
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowApplicationForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">Offer Budget</div>
                <div className="text-3xl font-bold">${parseFloat(offer.maximum_offer_amount).toLocaleString()}</div>
              </div>

              <Separator className="my-6" />

              {!showApplicationForm ? (
                <Button className="w-full" size="lg" onClick={() => setShowApplicationForm(true)}>
                  Apply Now
                </Button>
              ) : (
                <p className="text-sm text-center text-muted-foreground">Fill out the application form below</p>
              )}

              <Separator className="my-6" />

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Deadline</div>
                    <div className="font-medium">{new Date(offer.deadline).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Applications</div>
                    <div className="font-medium">{offer.applicationsCount} submitted</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
