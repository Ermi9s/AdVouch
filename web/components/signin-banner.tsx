"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, LogIn } from "lucide-react"
import { useState } from "react"

interface SignInBannerProps {
  onDismiss?: () => void
}

export function SignInBanner({ onDismiss }: SignInBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <LogIn className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Sign in to unlock more features and manage your profile
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/auth">
              <Button size="sm" variant="default">
                Sign In
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

