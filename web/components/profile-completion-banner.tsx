"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, AlertCircle } from "lucide-react"

interface ProfileCompletionBannerProps {
  mode: "business" | "advertiser"
}

export function ProfileCompletionBanner({ mode }: ProfileCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const modeLabel = mode === "business" ? "Business Owner" : "Advertiser"
  const actionUrl = mode === "business" ? "/business/create" : "/advertiser/onboarding"
  const actionLabel = mode === "business" ? "Create Business" : "Complete Profile"

  return (
    <div className="bg-primary/10 border-l-4 border-primary">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {mode === "business"
                  ? "Create your first business to unlock all features"
                  : `Complete your ${modeLabel} profile to unlock all features`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mode === "business"
                  ? "Add your business information to start creating ads and offers"
                  : "Add your information to start applying to offers"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={actionUrl}>
              <Button size="sm">{actionLabel}</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
