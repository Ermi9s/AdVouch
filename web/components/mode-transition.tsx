"use client"

import { useEffect, useState } from "react"
import { Building2, Megaphone, User } from "lucide-react"

interface ModeTransitionProps {
  mode: "user" | "business" | "advertiser"
  onComplete: () => void
}

export function ModeTransition({ mode, onComplete }: ModeTransitionProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    console.log("[ModeTransition] Starting transition for mode:", mode)
    setIsVisible(true)

    // Show animation for 1.5 seconds, then fade out quickly
    const timer = setTimeout(() => {
      console.log("[ModeTransition] Fading out transition")
      setIsVisible(false)
      // Call onComplete after fade out animation (300ms)
      setTimeout(() => {
        onComplete()
      }, 300)
    }, 1500)

    return () => clearTimeout(timer)
  }, [mode, onComplete])

  const getModeConfig = () => {
    switch (mode) {
      case "user":
        return {
          icon: User,
          name: "AdVouch",
          subtitle: "Discover",
          color: "text-foreground",
          bg: "bg-background",
        }
      case "business":
        return {
          icon: Building2,
          name: "AdVouch",
          subtitle: "Business",
          color: "text-[oklch(0.75_0.15_85)]",
          bg: "bg-[oklch(0.12_0.01_240)]",
        }
      case "advertiser":
        return {
          icon: Megaphone,
          name: "AdVouch",
          subtitle: "Advertiser",
          color: "text-[oklch(0.65_0.25_270)]",
          bg: "bg-[oklch(0.1_0.02_280)]",
        }
    }
  }

  const config = getModeConfig()
  const Icon = config.icon

  return (
    <div
      className={`z-[9999] flex items-center justify-center ${config.bg} transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0
      }}
    >
      <div className="text-center" style={{ marginTop: 0 }}>
        {/* Rolling logo animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 animate-spin-slow">
              <Icon className={`w-24 h-24 ${config.color}`} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Mode name */}
        <h1 className={`text-4xl font-bold mb-2 ${config.color} animate-fade-in`}>{config.name}</h1>
        <p className={`text-xl ${config.color} opacity-70 animate-fade-in-delay`}>{config.subtitle}</p>
      </div>
    </div>
  )
}
