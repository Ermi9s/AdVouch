export interface Business {
  id: string
  name: string
  description: string
  category: string
  location: string
  address: string
  reputationScore: number
  coordinates: {
    lat: number
    lng: number
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  memberSince: string
  isVerified: boolean
  logoUrl: string // Add logo URL
}

export interface Ad {
  id: string
  title: string
  description: string
  category: string
  location: string
  publishedAt: string
  businessId?: string // Reference to business if applicable
  business?: Business // Populated business data
  imageUrl: string // Make required
  tags: string[]
  shareCount: number
  vouchCount: number
}

export interface Comment {
  id: string
  userId: string
  userName: string
  businessId: string
  comment: string
  timestamp: string
  scoreEffect: number
  isRelevant: boolean
  status: "approved" | "rejected" | "flagged"
}

export interface Vouch {
  id: string
  userId: string
  userName: string
  businessId: string
  vouch: string
  timestamp: string
  scoreEffect: number
  isRelevant: boolean
  status: "approved" | "rejected" | "flagged"
}
