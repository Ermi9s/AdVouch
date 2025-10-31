"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { getUser } from "@/lib/auth"
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"
import { applicationsApi } from "@/lib/api"
import type { Application } from "@/lib/types"

export default function AdvertiserApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user || user.mode !== "advertiser") {
      router.push("/auth")
    }
  }, [router])

  // Fetch applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        try {
          const applicationsResponse = await applicationsApi.list()
          const applications = (applicationsResponse.results || [])
            .filter((a) => a.id && !isNaN(a.id)) // Filter out invalid IDs
          setApplications(applications)
        } catch (err) {
          console.warn("Failed to fetch applications from API:", err)
          // Fallback to empty array
          setApplications([])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "Rejected":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">My Applications</h1>
              <p className="text-muted-foreground">Track the status of your offer applications</p>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{application.offer_title || "Offer"}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{application.business_name || "Business"}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Bid:{" "}
                          <span className="font-medium text-foreground">${parseFloat(application.offer_bid).toLocaleString()}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Submitted: {new Date(application.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}
                    >
                      {getStatusIcon(application.status)}
                      {application.status}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {applications.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No applications yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
