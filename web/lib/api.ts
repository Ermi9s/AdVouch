// API service layer for AdVouch backend
import { getAccessTokenCache, setAccessTokenCache, refreshToken as refreshAuthToken } from './api-client'
import type {
  User,
  Business,
  Ad,
  Offer,
  Application,
  Review,
  Rating,
  Share,
  Reputation,
  PaginatedResponse,
} from './types'

// Base URLs
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_BASE_URL || 'http://localhost:8080'
const RESOURCE_BASE_URL = process.env.NEXT_PUBLIC_RESOURCE_BASE_URL || 'http://localhost:8000'

// Generic API request handler with automatic token refresh
async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  useAuth = true
): Promise<T> {
  const token = getAccessTokenCache()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token && useAuth) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  // If unauthorized, try to refresh token
  if (response.status === 401 && useAuth) {
    const refreshResult = await refreshAuthToken()

    if (refreshResult) {
      // Retry request with new token
      headers['Authorization'] = `Bearer ${refreshResult.access_token}`
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })
    } else {
      // Refresh failed - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }
      throw new Error('Authentication failed')
    }
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API Error: ${response.status} - ${error}`)
  }

  return response.json()
}

// ============================================================================
// USER API
// ============================================================================

export const userApi = {
  getMe: () => apiRequest<User>(`${RESOURCE_BASE_URL}/api/v1/me/`),

  // Sync user profile from OAuth (Fayda eSignet is source of truth)
  syncProfile: (userInfo: any) =>
    apiRequest<{ message: string; data: User }>(`${RESOURCE_BASE_URL}/api/v1/me/sync/`, {
      method: 'POST',
      body: JSON.stringify(userInfo),
    }),

  listUsers: (params?: { page?: number; search?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.search) queryParams.append('search', params.search)

    return apiRequest<PaginatedResponse<User>>(
      `${RESOURCE_BASE_URL}/api/v1/user/?${queryParams}`
    )
  },

  deleteUser: (id: number) =>
    apiRequest(`${RESOURCE_BASE_URL}/api/v1/user/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// BUSINESS API
// ============================================================================

export const businessApi = {
  list: (params?: { page?: number; search?: string; owner?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.owner) queryParams.append('owner', params.owner.toString())
    
    return apiRequest<PaginatedResponse<Business>>(
      `${RESOURCE_BASE_URL}/api/v1/business/?${queryParams}`
    )
  },

  getMyBusinesses: () =>
    apiRequest<PaginatedResponse<Business>>(
      `${RESOURCE_BASE_URL}/api/v1/business/my/`
    ),

  create: (data: Partial<Business>) =>
    apiRequest<Business>(`${RESOURCE_BASE_URL}/api/v1/business/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Business>) =>
    apiRequest<Business>(`${RESOURCE_BASE_URL}/api/v1/business/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`${RESOURCE_BASE_URL}/api/v1/business/${id}/`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// ADS API
// ============================================================================

export const adsApi = {
  list: (params?: {
    page?: number
    search?: string
    owner?: number
    business?: number
    ordering?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.owner) queryParams.append('owner', params.owner.toString())
    if (params?.business) queryParams.append('business', params.business.toString())
    if (params?.ordering) queryParams.append('ordering', params.ordering)
    
    return apiRequest<PaginatedResponse<Ad>>(
      `${RESOURCE_BASE_URL}/api/v1/ads/?${queryParams}`
    )
  },

  getMyAds: () =>
    apiRequest<PaginatedResponse<Ad>>(
      `${RESOURCE_BASE_URL}/api/v1/ads/my/`
    ),

  create: (data: Partial<Ad>) =>
    apiRequest<Ad>(`${RESOURCE_BASE_URL}/api/v1/ads/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Ad>) =>
    apiRequest<Ad>(`${RESOURCE_BASE_URL}/api/v1/ads/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`${RESOURCE_BASE_URL}/api/v1/ads/${id}/`, {
      method: 'DELETE',
    }),

  getById: (id: string | number) =>
    apiRequest<Ad>(`${RESOURCE_BASE_URL}/api/v1/ads/${id}/`),

  getEmbedCode: (id: string | number) =>
    apiRequest<{
      ad_id: number
      ad_title: string
      embed_url: string
      iframe_code: string
      direct_link: string
      preview_url: string
    }>(`${RESOURCE_BASE_URL}/api/v1/ads/${id}/embed-code/`),

  getExportData: (id: string | number) =>
    apiRequest<{
      ad: any
      business: any
      branding: any
      export_info: any
    }>(`${RESOURCE_BASE_URL}/api/v1/ads/${id}/export/`),
}

// ============================================================================
// OFFERS API
// ============================================================================

export const offersApi = {
  list: (params?: { page?: number; search?: string; ordering?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.ordering) queryParams.append('ordering', params.ordering)
    
    return apiRequest<PaginatedResponse<Offer>>(
      `${RESOURCE_BASE_URL}/api/v1/offer/?${queryParams}`
    )
  },

  create: (data: Partial<Offer>) =>
    apiRequest<Offer>(`${RESOURCE_BASE_URL}/api/v1/offer/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Offer>) =>
    apiRequest<Offer>(`${RESOURCE_BASE_URL}/api/v1/offer/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`${RESOURCE_BASE_URL}/api/v1/offer/${id}/`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// APPLICATIONS API
// ============================================================================

export const applicationsApi = {
  list: (params?: {
    page?: number
    status?: string
    offer?: number
    ordering?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.offer) queryParams.append('offer', params.offer.toString())
    if (params?.ordering) queryParams.append('ordering', params.ordering)
    
    return apiRequest<PaginatedResponse<Application>>(
      `${RESOURCE_BASE_URL}/api/v1/application/?${queryParams}`
    )
  },

  create: (data: Partial<Application>) =>
    apiRequest<Application>(`${RESOURCE_BASE_URL}/api/v1/application/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Application>) =>
    apiRequest<Application>(`${RESOURCE_BASE_URL}/api/v1/application/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`${RESOURCE_BASE_URL}/api/v1/application/${id}/`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// REVIEWS API
// ============================================================================

export const reviewsApi = {
  list: (adId: number, params?: { page?: number; user?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.user) queryParams.append('user', params.user.toString())

    return apiRequest<PaginatedResponse<Review>>(
      `${RESOURCE_BASE_URL}/api/v1/review/${adId}?${queryParams}`
    )
  },

  create: (data: Partial<Review>) =>
    apiRequest<Review>(`${RESOURCE_BASE_URL}/api/v1/review/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Review>) =>
    apiRequest<Review>(`${RESOURCE_BASE_URL}/api/v1/review/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`${RESOURCE_BASE_URL}/api/v1/review/${id}/`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// RATINGS API
// ============================================================================

export const ratingsApi = {
  list: (adId: number, params?: { page?: number; user?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.user) queryParams.append('user', params.user.toString())

    return apiRequest<PaginatedResponse<Rating>>(
      `${RESOURCE_BASE_URL}/api/v1/rating/${adId}?${queryParams}`
    )
  },

  create: (data: Partial<Rating>) =>
    apiRequest<Rating>(`${RESOURCE_BASE_URL}/api/v1/rating/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Rating>) =>
    apiRequest<Rating>(`${RESOURCE_BASE_URL}/api/v1/rating/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`${RESOURCE_BASE_URL}/api/v1/rating/${id}/`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// SHARES API (for tracking ad shares)
// ============================================================================

export const sharesApi = {
  create: (data: { ad: number }) =>
    apiRequest<Share>(`${RESOURCE_BASE_URL}/api/v1/share/create/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ============================================================================
// INTERACTION TRACKING API (Public endpoints for analytics)
// ============================================================================

export const interactionsApi = {
  /**
   * Track when a user clicks on an ad
   */
  trackClick: (adId: number, referrer?: string) =>
    apiRequest<{ success: boolean; click_id: number; message: string }>(
      `${RESOURCE_BASE_URL}/api/v1/track/click/`,
      {
        method: 'POST',
        body: JSON.stringify({
          ad_id: adId,
          referrer: referrer || window.location.href,
          user_agent: navigator.userAgent,
        }),
      },
      false // Don't require authentication for tracking
    ),

  /**
   * Track when a user views an ad
   */
  trackView: (adId: number) =>
    apiRequest<{ success: boolean; view_id: number; message: string }>(
      `${RESOURCE_BASE_URL}/api/v1/track/view/`,
      {
        method: 'POST',
        body: JSON.stringify({
          ad_id: adId,
        }),
      },
      false // Don't require authentication for tracking
    ),

  /**
   * Track when a user shares an ad
   */
  trackShare: (adId: number) =>
    apiRequest<{ success: boolean; share_id: number; message: string }>(
      `${RESOURCE_BASE_URL}/api/v1/track/share/`,
      {
        method: 'POST',
        body: JSON.stringify({
          ad_id: adId,
        }),
      },
      false // Don't require authentication for tracking
    ),

  /**
   * Track search queries
   */
  trackSearch: (query: string, resultsCount?: number, clickedAdId?: number, clickedBusinessId?: number) =>
    apiRequest<{ success: boolean; search_id: number; message: string }>(
      `${RESOURCE_BASE_URL}/api/v1/track/search/`,
      {
        method: 'POST',
        body: JSON.stringify({
          query,
          results_count: resultsCount,
          clicked_ad_id: clickedAdId,
          clicked_business_id: clickedBusinessId,
        }),
      },
      false // Don't require authentication for tracking
    ),
}

// ============================================================================
// REPUTATION API
// ============================================================================

export const reputationApi = {
  /**
   * Get reputation for a specific business
   */
  getBusinessReputation: (businessId: number) =>
    apiRequest<{
      id: number
      business_id: number
      business_name: string
      share_count: number
      average_rating: number
      review_count: number
      click_count: number
      view_count: number
      search_count: number
      overall_score: number
      last_updated: string
    }>(`${RESOURCE_BASE_URL}/api/v1/reputation/business/${businessId}/`),

  /**
   * Update reputation for a business (owner only)
   */
  updateBusinessReputation: (businessId: number) =>
    apiRequest<{
      success: boolean
      message: string
      reputation: any
    }>(`${RESOURCE_BASE_URL}/api/v1/reputation/business/${businessId}/update/`, {
      method: 'POST',
    }),
}

