"use client"

import { useState, useEffect } from "react"
import axios, { type AxiosError } from "axios"

interface UseApiOptions {
  immediate?: boolean
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: () => Promise<void>
  reset: () => void
}

export function useApi<T>(apiFunction: () => Promise<{ data: T }>, options: UseApiOptions = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFunction()
      setData(response.data)
    } catch (err) {
      let errorMessage = "An unexpected error occurred"

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError
        if (axiosError.response?.data) {
          errorMessage = (axiosError.response.data as any).message || errorMessage
        } else if (axiosError.message) {
          errorMessage = axiosError.message
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [])

  return { data, loading, error, execute, reset }
}

// Specialized hook for mutations (POST, PUT, DELETE)
export function useMutation<T, P = any>(apiFunction: (params: P) => Promise<{ data: T }>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (params: P): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFunction(params)
      setData(response.data)
      return response.data
    } catch (err) {
      let errorMessage = "An unexpected error occurred"

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError
        if (axiosError.response?.data) {
          errorMessage = (axiosError.response.data as any).message || errorMessage
        } else if (axiosError.message) {
          errorMessage = axiosError.message
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
  }

  return { data, loading, error, mutate, reset }
}
