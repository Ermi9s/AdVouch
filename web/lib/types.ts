// TypeScript types matching backend Django models

export interface User {
  id: number
  full_name: string
  phone_number: string
  email: string
  birthdate?: string
  profile_picture?: string
  public: boolean
  created_at: string
  socials?: Social[]
}

export interface Social {
  id: number
  user: number
  name: string
  url: string
}

export interface Business {
  id: number
  name: string
  location?: string
  description?: string
  category?: string
  reputation?: number
  owner: number
  created_at: string
  media_files?: Media[]
}

export interface Media {
  id: number
  url: string
  media_type: 'image' | 'video'
}

export interface Ad {
  id: number
  title: string
  description?: string
  share_count: number
  business?: number
  owner?: number
  status: 'draft' | 'active' | 'archived'
  created_at: string
  media_files?: Media[]
  // Optional fields for display
  budget?: number
  views?: number
  clicks?: number
  reputation?: number
}

export interface Offer {
  id: number
  ad?: number
  business?: number
  maximum_offer_amount: string
  description?: string
  status: 'Active' | 'Inactive'
  created_at: string
  // Optional display fields
  title?: string
  adId?: number
  businessId?: number
  deadline?: string
  applicationsCount?: number
  requirements?: string
}

export interface Application {
  id: number
  user: number
  offer: number
  offer_bid: string
  additional_description: string
  status: 'Active' | 'Inactive'
}

export interface Review {
  id: number
  ad: number
  user: number
  content: string
  created_at: string
}

export interface Rating {
  id: number
  ad: number
  user: number
  ratting: number
  created_at: string
}

export interface Share {
  id: number
  ad: number
  user: number
  created_at: string
}

export interface Reputation {
  id: number
  business: number
  share_count: number
  average_ratting: number
  review_count: number
  overall_score: number
}

// API Response types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Auth types
export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface AuthUser {
  id: string
  name: string
  type?: 'normal_user' | 'business_owner' | 'advertiser'
}

export interface AuthResponse {
  message: string
  data: {
    access_token: string
    refresh_token: string
  }
}

export interface AuthorizeResponse {
  message: string
  data: {
    auth_url: string
    session_id: string
  }
}

// Frontend-specific types
export interface UserMode {
  id: string
  name: string
  mode: 'user' | 'business' | 'advertiser'
  businessProfileComplete?: boolean
  advertiserProfileComplete?: boolean
}

