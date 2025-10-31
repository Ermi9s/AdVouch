"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SplitViewLayoutProps {
  children: React.ReactNode
  detailsContent?: React.ReactNode
  selectedId?: string | null
  onClose?: () => void
}

export function SplitViewLayout({ children, detailsContent, selectedId, onClose }: SplitViewLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // On mobile, if there's a selected item, show only the details
  if (isMobile) {
    return <>{children}</>
  }

  const hasDetails = !!detailsContent

  // On desktop, show split view
  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* List View - Left Side */}
      <div
        className={`transition-all duration-300 flex-shrink-0 ${
          hasDetails && !isCollapsed ? "w-full lg:w-2/5" : "w-full"
        }`}
      >
        <ScrollArea className="h-full pr-4">{children}</ScrollArea>
      </div>

      {/* Details View - Right Side (Only shown when item is selected) */}
      {hasDetails && (
        <div
          className={`hidden lg:flex flex-col sticky top-24 h-full transition-all duration-300 ${
            isCollapsed ? "w-12" : "w-3/5"
          } flex-shrink-0`}
        >
          {isCollapsed ? (
            // Collapsed state - just show expand button
            <div className="h-full flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="h-24 w-12 rounded-l-lg rounded-r-none border-r-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // Expanded state - show full details
            <div className="h-full border border-border rounded-lg bg-card overflow-hidden flex flex-col">
              {/* Header with Close and Collapse Buttons */}
              <div className="flex justify-between items-center p-2 border-b border-border bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(true)}
                  className="gap-1"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-xs">Collapse</span>
                </Button>
                {onClose && (
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Details Content */}
              <ScrollArea className="flex-1">{detailsContent}</ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

