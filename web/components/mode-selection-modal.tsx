"use client"
import { Building2, Megaphone, User } from "lucide-react"

interface ModeSelectionModalProps {
  onSelect: (mode: "user" | "business" | "advertiser") => void
}

export function ModeSelectionModal({ onSelect }: ModeSelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-lg max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to AdVouch</h2>
          <p className="text-muted-foreground">Choose how you'd like to use the platform</p>
        </div>

        <div className="grid gap-4">
          {/* Normal User */}
          <button
            onClick={() => onSelect("user")}
            className="flex items-start gap-4 p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-accent transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Normal User</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Discover services, products, and trusted businesses. Search, share, and review ads to help others find
                quality offerings.
              </p>
            </div>
          </button>

          {/* Business Owner */}
          <button
            onClick={() => onSelect("business")}
            className="flex items-start gap-4 p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-accent transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Business Owner</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Post ads for your products or services, manage your reputation, and collaborate with advertisers to
                expand your reach.
              </p>
            </div>
          </button>

          {/* Advertiser */}
          <button
            onClick={() => onSelect("advertiser")}
            className="flex items-start gap-4 p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-accent transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Advertiser</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse ads from businesses, connect with quality partners, and manage advertising deals on your
                platform.
              </p>
            </div>
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          You can change your mode anytime from your profile settings
        </p>
      </div>
    </div>
  )
}
