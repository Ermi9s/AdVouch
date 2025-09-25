"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Phone, Mail, Globe } from "lucide-react"
import { ReputationBadge } from "@/components/reputation-badge"
import type { Business } from "@/types"
import { businessAPI } from "@/lib/api"
import { useApi } from "@/hooks/use-api"

interface BusinessCardProps {
  business: Business
  showActions?: boolean
}

export function BusinessCard({ business, showActions = true }: BusinessCardProps) {
  const { execute: fetchBusiness, loading } = useApi(() => businessAPI.getBusiness(business.id), { immediate: false })

  const handleViewBusiness = () => {
    if (!loading) {
      fetchBusiness()
    }
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden">
      <Link href={`/businesses/${business.id}`}>
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
                <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {business.name}
                </h3>
                <Badge variant="secondary" className="mt-1">
                  {business.category}
                </Badge>
              </div>
              <div className="flex-shrink-0">
                <ReputationBadge score={business.reputationScore} size="sm" />
              </div>
            </div>

            <p className="text-muted-foreground text-sm line-clamp-3">{business.description}</p>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{business.location}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>Since {new Date(business.memberSince).getFullYear()}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  {business.contact.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>Phone</span>
                    </div>
                  )}
                  {business.contact.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>Email</span>
                    </div>
                  )}
                  {business.contact.website && (
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>Website</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleViewBusiness()
                  }}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "View Details"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
