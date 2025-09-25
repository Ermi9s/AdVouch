import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Star, AlertTriangle, Shield, TrendingUp, Clock, X } from "lucide-react"

interface ReputationBadgeProps {
  score: number
  showTooltip?: boolean
  size?: "sm" | "md" | "lg"
  showStars?: boolean
}

export function ReputationBadge({ score, showTooltip = true, size = "md", showStars = false }: ReputationBadgeProps) {
  const getReputationData = (score: number) => {
    if (score >= 100) {
      return {
        label: "Trusted Champion",
        emoji: "🟢",
        icon: Shield,
        stars: 5,
        className: "reputation-champion",
        description: "Outstanding — verified, consistently positive, highly reliable.",
      }
    } else if (score >= 60) {
      return {
        label: "Trusted Provider",
        emoji: "🟢",
        icon: Shield,
        stars: 4,
        className: "reputation-trusted",
        description: "Strongly trusted — most feedback is relevant and positive.",
      }
    } else if (score >= 20) {
      return {
        label: "Growing Reputation",
        emoji: "🟡",
        icon: TrendingUp,
        stars: 3,
        className: "reputation-growing",
        description: "Mixed to good — rising reputation, room for growth.",
      }
    } else if (score >= -19) {
      return {
        label: "New / Neutral",
        emoji: "⚪",
        icon: Clock,
        stars: 2,
        className: "reputation-neutral",
        description: "Unproven — too early or feedback is mixed/limited.",
      }
    } else if (score >= -59) {
      return {
        label: "Under Watch",
        emoji: "🟠",
        icon: AlertTriangle,
        stars: 2,
        className: "reputation-under-watch",
        description: "Significant concerns — multiple negative/relevant comments.",
      }
    } else if (score >= -99) {
      return {
        label: "Poor Standing",
        emoji: "🔴",
        icon: AlertTriangle,
        stars: 1,
        className: "reputation-poor",
        description: "Majority negative — trust significantly eroded.",
      }
    } else {
      return {
        label: "Not Recommended",
        emoji: "🔴",
        icon: X,
        stars: 0,
        className: "reputation-not-recommended",
        description: "Major red flags — low engagement quality, flagged or unreliable service.",
      }
    }
  }

  const reputation = getReputationData(score)
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const StarRating = ({ stars, size }: { stars: number; size: "sm" | "md" | "lg" }) => {
    const starSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"

    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    )
  }

  const badge = (
    <div className={`reputation-badge ${reputation.className} ${sizeClasses[size]} inline-flex items-center gap-2`}>
      <span>{reputation.emoji}</span>
      <span className="font-medium">
        {score > 0 ? "+" : ""}
        {score}
      </span>
      <span className="hidden sm:inline">• {reputation.label}</span>
      {showStars && <StarRating stars={reputation.stars} size={size} />}
    </div>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <reputation.icon className="h-4 w-4" />
              <span className="font-semibold">
                {reputation.label} ({score > 0 ? "+" : ""}
                {score})
              </span>
            </div>
            <StarRating stars={reputation.stars} size="sm" />
            <div className="text-sm">{reputation.description}</div>
            <div className="text-xs text-gray-500 mt-3 space-y-1">
              <div className="font-medium">Score Ranges:</div>
              <div>≥ +100: 🟢 Trusted Champion ★★★★★</div>
              <div>+60 to +99: 🟢 Trusted Provider ★★★★☆</div>
              <div>+20 to +59: 🟡 Growing Reputation ★★★☆☆</div>
              <div>-19 to +19: ⚪ New/Neutral ★★☆☆☆</div>
              <div>-20 to -59: 🟠 Under Watch ★★☆☆☆</div>
              <div>-60 to -99: 🔴 Poor Standing ★☆☆☆☆</div>
              <div>≤ -100: 🔴 Not Recommended 🚫</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
