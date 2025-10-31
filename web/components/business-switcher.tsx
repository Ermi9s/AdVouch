"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, ChevronDown, Plus } from "lucide-react"
import { businessApi } from "@/lib/api"
import type { Business } from "@/lib/types"

export function BusinessSwitcher() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      const response = await businessApi.getMyBusinesses()
      const businessList = response.results || []
      setBusinesses(businessList)

      // Get active business from localStorage or use first business
      const activeBusinessId = localStorage.getItem("active_business_id")
      const active = activeBusinessId
        ? businessList.find((b) => b.id.toString() === activeBusinessId)
        : businessList[0]

      if (active) {
        setActiveBusiness(active)
        localStorage.setItem("active_business_id", active.id.toString())
      }
    } catch (error) {
      console.error("[BusinessSwitcher] Failed to load businesses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessSwitch = (business: Business) => {
    setActiveBusiness(business)
    localStorage.setItem("active_business_id", business.id.toString())
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("businessChanged"))
    // Reload the current page to refresh data
    router.refresh()
  }

  const handleCreateBusiness = () => {
    router.push("/business/create")
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <Button onClick={handleCreateBusiness} size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Create Your First Business
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[200px] justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{activeBusiness?.name || "Select Business"}</span>
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel>Your Businesses</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => handleBusinessSwitch(business)}
            className={activeBusiness?.id === business.id ? "bg-accent" : ""}
          >
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="font-medium truncate">{business.name}</span>
              <span className="text-xs text-muted-foreground truncate">{business.location}</span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCreateBusiness} className="text-primary">
          <Plus className="mr-2 h-4 w-4" />
          <span>Create New Business</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Helper function to get active business ID
export function getActiveBusinessId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("active_business_id")
}

