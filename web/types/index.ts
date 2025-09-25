export interface User {
  id: string
  full_name: string
  phone_number: string
  socials: string[] // list of contacts since only phone number is guaranteed from fayda id
  faydaId: string
}

export interface Business {
  id: string
  name: string
  description_text: string
  location: string // location bearing string
  owner: User
  category: string
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
  share_count: number // Integer Field default = 0
  category: string
  location: string
  business: Business | null // Auto field
  owner: User // Auto field
  status: "Draft" | "Archived" | "Active" // Choice field with default "Draft"
  created_at: string // Auto created field
  imageUrl: string // Make required
  tags: string[]
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

export interface Media {
  url: string
  ad: Ad | null // if it is media for ad else null
  business: Business | null // if it is media for business else null
  media_type: "image" | "video"
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
