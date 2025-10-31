export interface Ad {
  id: string
  title: string
  description: string
  category: string
  budget: number
  imageUrl: string
  businessName: string
  businessId: string
  createdAt: string
  status: "active" | "paused" | "completed"
  views: number
  clicks: number
  reputation: number
}

export interface Business {
  id: string
  name: string
  description: string
  category: string
  location: {
    lat: number
    lng: number
    address: string
    city: string
  }
  reputation: number
  totalAds: number
  imageUrl: string
}

export interface Offer {
  id: string
  adId: string
  businessId: string
  title: string
  description: string
  budget: number
  requirements: string
  deadline: string
  status: "open" | "closed"
  applicationsCount: number
}

export interface Application {
  id: string
  offerId: string
  advertiserId: string
  advertiserName: string
  bidAmount: number
  proposal: string
  status: "pending" | "accepted" | "rejected"
  submittedAt: string
  advertiserReputation: number
}

export const mockAds: Ad[] = [
  {
    id: "1",
    title: "Premium Fitness App Launch Campaign",
    description:
      "Promote our new fitness tracking app with personalized workout plans and nutrition guidance. Looking for health and wellness advertisers.",
    category: "Health & Fitness",
    budget: 5000,
    imageUrl: "/fitness-app-interface.png",
    businessName: "FitTrack Pro",
    businessId: "b1",
    createdAt: "2025-01-15",
    status: "active",
    views: 1250,
    clicks: 340,
    reputation: 4.8,
  },
  {
    id: "2",
    title: "Eco-Friendly Fashion Brand Awareness",
    description:
      "Sustainable clothing line made from recycled materials. Seeking fashion and lifestyle influencers to spread awareness.",
    category: "Fashion",
    budget: 3500,
    imageUrl: "/sustainable-fashion.png",
    businessName: "GreenThreads",
    businessId: "b2",
    createdAt: "2025-01-18",
    status: "active",
    views: 890,
    clicks: 210,
    reputation: 4.6,
  },
  {
    id: "3",
    title: "AI-Powered Learning Platform",
    description:
      "Revolutionary education platform using AI to personalize learning experiences. Target audience: students and educators.",
    category: "Education",
    budget: 7500,
    imageUrl: "/online-learning-platform.png",
    businessName: "LearnAI",
    businessId: "b3",
    createdAt: "2025-01-20",
    status: "active",
    views: 2100,
    clicks: 580,
    reputation: 4.9,
  },
  {
    id: "4",
    title: "Gourmet Meal Kit Delivery Service",
    description:
      "Chef-curated meal kits delivered to your door. Fresh ingredients, easy recipes. Perfect for food bloggers and lifestyle content creators.",
    category: "Food & Beverage",
    budget: 4200,
    imageUrl: "/gourmet-meal-kit.png",
    businessName: "ChefBox",
    businessId: "b4",
    createdAt: "2025-01-22",
    status: "active",
    views: 1450,
    clicks: 390,
    reputation: 4.7,
  },
  {
    id: "5",
    title: "Smart Home Security System",
    description:
      "Next-gen home security with AI detection and mobile monitoring. Looking for tech reviewers and home improvement advertisers.",
    category: "Technology",
    budget: 6000,
    imageUrl: "/smart-home-security-camera.jpg",
    businessName: "SecureHome AI",
    businessId: "b5",
    createdAt: "2025-01-25",
    status: "active",
    views: 1780,
    clicks: 470,
    reputation: 4.8,
  },
  {
    id: "6",
    title: "Travel Adventure Booking Platform",
    description:
      "Discover and book unique travel experiences worldwide. Seeking travel bloggers and adventure content creators.",
    category: "Travel",
    budget: 5500,
    imageUrl: "/travel-adventure-destination.jpg",
    businessName: "WanderQuest",
    businessId: "b6",
    createdAt: "2025-01-28",
    status: "active",
    views: 1620,
    clicks: 420,
    reputation: 4.7,
  },
]

export const mockOffers: Offer[] = [
  {
    id: "o1",
    adId: "1",
    businessId: "b1",
    title: "Instagram Story Campaign",
    description: "Create 5 engaging Instagram stories showcasing our fitness app features",
    budget: 1500,
    requirements: "10k+ followers, health/fitness niche, high engagement rate",
    deadline: "2025-02-15",
    status: "open",
    applicationsCount: 12,
  },
  {
    id: "o2",
    adId: "3",
    businessId: "b3",
    title: "YouTube Review Video",
    description: "Produce a detailed review video of our AI learning platform",
    budget: 2500,
    requirements: "Education-focused channel, 50k+ subscribers",
    deadline: "2025-02-20",
    status: "open",
    applicationsCount: 8,
  },
]

export const mockBusinesses: Business[] = [
  {
    id: "b1",
    name: "FitTrack Pro",
    description: "Leading fitness technology company specializing in health tracking apps",
    category: "Health & Fitness",
    location: {
      lat: 8.9806,
      lng: 38.7578,
      address: "Bole Road, near Edna Mall",
      city: "Addis Ababa, Ethiopia",
    },
    reputation: 87,
    totalAds: 3,
    imageUrl: "/fitness-app-interface.png",
  },
  {
    id: "b2",
    name: "GreenThreads",
    description: "Sustainable fashion brand committed to eco-friendly clothing",
    category: "Fashion",
    location: {
      lat: 9.0084,
      lng: 38.7267,
      address: "Merkato Area, Auto Spare Parts District",
      city: "Addis Ababa, Ethiopia",
    },
    reputation: 92,
    totalAds: 2,
    imageUrl: "/sustainable-fashion.png",
  },
  {
    id: "b3",
    name: "LearnAI",
    description: "Revolutionary AI-powered education platform",
    category: "Education",
    location: {
      lat: 9.0192,
      lng: 38.7525,
      address: "Kazanchis Business District, near ECA",
      city: "Addis Ababa, Ethiopia",
    },
    reputation: 105,
    totalAds: 4,
    imageUrl: "/online-learning-platform.png",
  },
  {
    id: "b4",
    name: "ChefBox",
    description: "Premium meal kit delivery service with chef-curated recipes",
    category: "Food & Beverage",
    location: {
      lat: 9.0054,
      lng: 38.7636,
      address: "CMC Area, near Friendship City Center",
      city: "Addis Ababa, Ethiopia",
    },
    reputation: 23,
    totalAds: 2,
    imageUrl: "/gourmet-meal-kit.png",
  },
  {
    id: "b5",
    name: "SecureHome AI",
    description: "Next-generation smart home security solutions",
    category: "Technology",
    location: {
      lat: 9.0348,
      lng: 38.7369,
      address: "Piassa Area, near St. George Cathedral",
      city: "Addis Ababa, Ethiopia",
    },
    reputation: -45,
    totalAds: 3,
    imageUrl: "/smart-home-security-camera.jpg",
  },
  {
    id: "b6",
    name: "WanderQuest",
    description: "Discover unique travel experiences worldwide",
    category: "Travel",
    location: {
      lat: 9.0411,
      lng: 38.7614,
      address: "Arat Kilo Area, near Addis Ababa University",
      city: "Addis Ababa, Ethiopia",
    },
    reputation: -75,
    totalAds: 2,
    imageUrl: "/travel-adventure-destination.jpg",
  },
]

export const categories = [
  "All Categories",
  "Technology",
  "Health & Fitness",
  "Fashion",
  "Education",
  "Food & Beverage",
  "Travel",
  "Finance",
  "Entertainment",
]
