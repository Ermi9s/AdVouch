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
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  MapPin,
  Flag,
  Navigation,
  Phone,
  Mail,
  Globe,
  Calendar,
  Building2,
} from "lucide-react"
import type { Business } from "@/types"
import { Separator } from "@radix-ui/react-separator"
import { Badge } from "@/components/ui/badge"

// Mock business data
const mockBusiness: Business = {
  id: "biz-1",
  name: "CleanPro Services",
  description:
    "Professional cleaning service with eco-friendly products and experienced staff. We provide comprehensive cleaning solutions for residential and commercial properties, using only environmentally friendly products that are safe for your family and pets.",
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
  logoUrl: "/placeholder.svg?height=120&width=120&text=CP",
}



const mockServices = [
  "Residential Cleaning",
  "Commercial Cleaning",
  "Deep Cleaning",
  "Move-in/Move-out Cleaning",
  "Post-Construction Cleanup",
  "Eco-Friendly Products",
  "Same-Day Service Available",
  "Insured & Bonded",
]

export default function BusinessDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()


  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for reporting this business. We will review it shortly.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Businesses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={mockBusiness.logoUrl || "/placeholder.svg"}
                      alt={`${mockBusiness.name} logo`}
                      fill
                      className="object-cover rounded-xl"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">{mockBusiness.name}</h1>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {mockBusiness.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Since {new Date(mockBusiness.memberSince).getFullYear()}
                          </div>
                        </div>
                        <Badge variant="secondary" className="mb-4">
                          {mockBusiness.category}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <ReputationBadge score={mockBusiness.reputationScore} showStars />
                        <Button variant="outline" size="sm" onClick={handleReport}>
                          <Flag className="h-4 w-4 mr-2" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h2 className="text-xl font-semibold mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed">{mockBusiness.description}</p>
                </div>

                {/* Services */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Services Offered</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mockServices.map((service, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Vouchs and Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Business Location</h3>
                    <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{mockBusiness.address}</span>
                    </div>
                  </div>

                  <LocationMap
                    address={mockBusiness.address}
                    coordinates={mockBusiness.coordinates}
                    height="400px"
                  />

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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{mockBusiness.contact.phone}</p>
                    <p className="text-sm text-muted-foreground">Phone</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{mockBusiness.contact.email}</p>
                    <p className="text-sm text-muted-foreground">Email</p>
                  </div>
                </div>

                {mockBusiness.contact.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{mockBusiness.contact.website}</p>
                      <p className="text-sm text-muted-foreground">Website</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{mockBusiness.address}</p>
                    <p className="text-sm text-muted-foreground">Address</p>
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
                  <div className="text-3xl font-bold text-primary mb-2">{mockBusiness.reputationScore}</div>
                  <ReputationBadge score={mockBusiness.reputationScore} showTooltip={false} showStars />
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    This score is calculated by our AI agent based on community vouchs and service quality indicators.
                  </p>
                  <p>Scores are updated in real-time as new vouchs are received.</p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Member Since</span>
                    <span className="font-medium">{new Date(mockBusiness.memberSince).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => window.open(`tel:${mockBusiness.contact.phone}`)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Business
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => window.open(`mailto:${mockBusiness.contact.email}`)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>

                {mockBusiness.contact.website && (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => window.open(`https://${mockBusiness.contact.website}`)}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
