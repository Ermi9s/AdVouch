import axios from "axios"

// Mock data for fallback when API is unavailable
const mockAuthData = {
  api_url:
    "https://mock-fayda-auth.example.com/oauth/authorize?client_id=demo&redirect_uri=http://localhost:3000/login&state=demo_state",
  session_id: "mock_session_" + Date.now(),
}

const mockUserData = {
  fayda_id: "DEMO_USER_" + Date.now(),
  name: "Demo User",
  email: "demo@example.com",
  verified: true,
}

// Simple API test function
export const testApiConnection = async () => {
  try {
    console.log("🔍 Testing API connection...")
    const response = await axios.get("https://advouch.onrender.com/ads")
    console.log("✅ API connection successful")
    return { status: "online" }
  } catch (error) {
    console.log("❌ API connection failed:", error)
    return { status: "offline" }
  }
}

// Auth API functions
export const authAPI = {
  getAuthUrl: async () => {
    try {
      console.log("🔐 Getting auth URL...")
      const response = await axios.get("https://advouch.onrender.com/api/authorize/")
      console.log("✅ Auth URL retrieved successfully:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Auth URL request failed, using mock data:", error)
      return mockAuthData
    }
  },

  authenticate: async (authData: {
    auth_code: string
    csrf_token: string
    session_id: string
  }) => {
    try {
      console.log("🔐 Authenticating...")
      const response = await axios.post("https://advouch.onrender.com/api/authenticate/", authData)
      console.log("✅ Authentication successful:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Authentication failed, using mock data:", error)
      return mockUserData
    }
  },

  mockAuthenticate: async () => {
    console.log("🎭 Using mock authentication")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return mockUserData
  },
}

// Business API functions
export const businessAPI = {
  getBusinesses: async () => {
    try {
      console.log("🏢 Getting businesses...")
      const response = await axios.get("https://advouch.onrender.com/api/businesses/")
      console.log("✅ Businesses retrieved:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Businesses request failed, using mock data:", error)
      return []
    }
  },

  getBusiness: async (id: string) => {
    try {
      console.log(`🏢 Getting business ${id}...`)
      const response = await axios.get(`https://advouch.onrender.com/api/businesses/${id}/`)
      console.log("✅ Business retrieved:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Business request failed, using mock data:", error)
      return null
    }
  },

  searchBusinesses: async (query: string) => {
    try {
      console.log(`🔍 Searching businesses for: ${query}`)
      const response = await axios.get(
        `https://advouch.onrender.com/api/businesses/search/?q=${encodeURIComponent(query)}`,
      )
      console.log("✅ Business search completed:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Business search failed, using mock data:", error)
      return []
    }
  },
}

// Ads API functions
export const adsAPI = {
  getAds: async () => {
    try {
      console.log("📢 Getting ads...")
      const response = await axios.get("https://advouch.onrender.com/api/ads/")
      console.log("✅ Ads retrieved:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Ads request failed, using mock data:", error)
      return []
    }
  },

  getAd: async (id: string) => {
    try {
      console.log(`📢 Getting ad ${id}...`)
      const response = await axios.get(`https://advouch.onrender.com/api/ads/${id}/`)
      console.log("✅ Ad retrieved:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Ad request failed, using mock data:", error)
      return null
    }
  },

  searchAds: async (query: string) => {
    try {
      console.log(`🔍 Searching ads for: ${query}`)
      const response = await axios.get(`https://advouch.onrender.com/api/ads/search/?q=${encodeURIComponent(query)}`)
      console.log("✅ Ad search completed:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Ad search failed, using mock data:", error)
      return []
    }
  },
}

// Vouch API functions
export const vouchAPI = {
  submitVouch: async (vouchData: {
    business_id: string
    vouch: string
  }) => {
    try {
      console.log("👍 Submitting vouch...")
      const response = await axios.post("https://advouch.onrender.com/api/vouchs/", vouchData)
      console.log("✅ Vouch submitted:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Vouch submission failed, using mock data:", error)
      return {
        id: "mock_vouch_" + Date.now(),
        ...vouchData,
        timestamp: new Date().toISOString(),
        status: "submitted",
      }
    }
  },

  getBusinessVouchs: async (businessId: string) => {
    try {
      console.log(`👍 Getting vouchs for business ${businessId}...`)
      const response = await axios.get(`https://advouch.onrender.com/api/businesses/${businessId}/vouchs/`)
      console.log("✅ Business vouchs retrieved:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ Business vouchs request failed, using mock data:", error)
      return []
    }
  },

  getUserVouchs: async () => {
    try {
      console.log("👍 Getting user vouchs...")
      const response = await axios.get("https://advouch.onrender.com/api/user/vouchs/")
      console.log("✅ User vouchs retrieved:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ User vouchs request failed, using mock data:", error)
      return []
    }
  },
}

// User API functions
export const userAPI = {
  getProfile: async () => {
    try {
      console.log("👤 Getting user profile...")
      const response = await axios.get("https://advouch.onrender.com/api/user/profile/")
      console.log("✅ User profile retrieved:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ User profile request failed, using mock data:", error)
      return mockUserData
    }
  },

  updateProfile: async (profileData: {
    name?: string
    email?: string
    phone?: string
  }) => {
    try {
      console.log("👤 Updating user profile...")
      const response = await axios.patch("https://advouch.onrender.com/api/user/profile/", profileData)
      console.log("✅ User profile updated:", response.data)
      return response.data
    } catch (error) {
      console.warn("⚠️ User profile update failed, using mock data:", error)
      return { ...mockUserData, ...profileData }
    }
  },
}

export default axios
