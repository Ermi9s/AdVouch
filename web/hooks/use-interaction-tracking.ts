"use client"

import { useEffect, useCallback, useRef } from 'react'
import { interactionsApi } from '@/lib/api'

/**
 * Hook for tracking ad interactions (views, clicks, shares)
 */
export function useInteractionTracking() {
  const trackedViews = useRef<Set<number>>(new Set())
  const trackedClicks = useRef<Set<number>>(new Set())

  /**
   * Track an ad view (impression)
   * Automatically prevents duplicate tracking for the same ad in the same session
   */
  const trackView = useCallback(async (adId: number) => {
    // Prevent duplicate tracking in the same session
    if (trackedViews.current.has(adId)) {
      return
    }

    try {
      await interactionsApi.trackView(adId)
      trackedViews.current.add(adId)
      console.log(`[Tracking] View tracked for ad ${adId}`)
    } catch (error) {
      console.error(`[Tracking] Failed to track view for ad ${adId}:`, error)
    }
  }, [])

  /**
   * Track an ad click
   * Can be called multiple times for the same ad (e.g., multiple clicks)
   */
  const trackClick = useCallback(async (adId: number, referrer?: string) => {
    try {
      await interactionsApi.trackClick(adId, referrer)
      trackedClicks.current.add(adId)
      console.log(`[Tracking] Click tracked for ad ${adId}`)
    } catch (error) {
      console.error(`[Tracking] Failed to track click for ad ${adId}:`, error)
    }
  }, [])

  /**
   * Track an ad share
   */
  const trackShare = useCallback(async (adId: number) => {
    try {
      await interactionsApi.trackShare(adId)
      console.log(`[Tracking] Share tracked for ad ${adId}`)
    } catch (error) {
      console.error(`[Tracking] Failed to track share for ad ${adId}:`, error)
    }
  }, [])

  /**
   * Track a search query
   */
  const trackSearch = useCallback(async (
    query: string,
    resultsCount?: number,
    clickedAdId?: number,
    clickedBusinessId?: number
  ) => {
    try {
      await interactionsApi.trackSearch(query, resultsCount, clickedAdId, clickedBusinessId)
      console.log(`[Tracking] Search tracked: "${query}"`)
    } catch (error) {
      console.error(`[Tracking] Failed to track search:`, error)
    }
  }, [])

  return {
    trackView,
    trackClick,
    trackShare,
    trackSearch,
  }
}

/**
 * Hook to automatically track ad view when component mounts
 */
export function useTrackAdView(adId: number | undefined) {
  const { trackView } = useInteractionTracking()

  useEffect(() => {
    if (adId) {
      // Small delay to ensure the ad is actually visible
      const timer = setTimeout(() => {
        trackView(adId)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [adId, trackView])
}

/**
 * Hook to track search with debouncing
 */
export function useTrackSearch(delay: number = 1000) {
  const { trackSearch } = useInteractionTracking()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedTrackSearch = useCallback(
    (query: string, resultsCount?: number) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Only track non-empty searches
      if (!query.trim()) {
        return
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        trackSearch(query, resultsCount)
      }, delay)
    },
    [trackSearch, delay]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedTrackSearch
}

