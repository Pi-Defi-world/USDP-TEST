"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { PiAuthResult, PiPaymentDTO } from "@/pi-sdk"
import { apiClient } from "@/lib/api/client"
import type { AuthResponseData } from "@/types"

interface PiUser {
  uid: string
  username?: string
  wallet_address?: string
}

interface PiContextType {
  user: PiUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  authenticate: () => Promise<PiAuthResult>
  signOut: () => void
}

const PiContext = createContext<PiContextType | undefined>(undefined)

// API_URL is no longer needed - we use apiClient which handles URL construction correctly 

export function PiProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PiUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)

  // Initialize Pi SDK on mount and wait for it to be ready
  useEffect(() => {
    if (typeof window === 'undefined') return

    let retryCount = 0
    const maxRetries = 50 // 5 seconds max wait (50 * 100ms)

    const initSDK = () => {
      if (window.Pi && typeof window.Pi.init === 'function') {
        try {
          window.Pi.init({ 
            version: "2.0", 
            // sandbox: true
          })
          console.log("Pi SDK initialized")
          // Wait a bit for the iframe to be ready
          setTimeout(() => {
            setSdkReady(true)
            console.log("Pi SDK ready, iframe loaded")
          }, 200)
        } catch (error) {
          console.warn("Pi SDK already initialized:", error)
          setSdkReady(true)
        }
      } else {
        retryCount++
        if (retryCount < maxRetries) {
        setTimeout(initSDK, 100)
        } else {
          console.warn("Pi SDK not available after max retries")
          // Still set ready to false, but don't block forever
          setSdkReady(false)
        }
      }
    }

    initSDK()
  }, [])

  // Helper function to check if JWT token is expired
  const isJWTExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000 // Convert to milliseconds
      return Date.now() >= exp
    } catch {
      return true 
    }
  }

   
  useEffect(() => {
    if (typeof window === "undefined" || !sdkReady) return

    const restoreAuth = async () => {
    const savedToken = localStorage.getItem("pi_access_token")
    const savedUser = localStorage.getItem("pi_user")
      const savedAuthToken = localStorage.getItem("auth_token")

    if (savedToken && savedUser) {
      try {
        const userData: PiUser = JSON.parse(savedUser)
        setUser(userData)
        setAccessToken(savedToken)
        setIsAuthenticated(true)
          
          // Check if JWT token exists and is valid
          const needsReAuth = !savedAuthToken || isJWTExpired(savedAuthToken)
          
          if (needsReAuth) {
            // Re-authenticate with backend to get fresh JWT token
            console.log("JWT token missing or expired, re-authenticating with backend...")
            
            try {
              // Use API client which handles URL construction correctly
              const response = await apiClient.signIn({
                accessToken: savedToken,
                user: {
                  uid: userData.uid,
                  username: userData.username || '',
                  wallet_address: userData.wallet_address
                }
              })

              if (response.success && response.data) {
                const authData = response.data as AuthResponseData
                if (authData.token) {
                  localStorage.setItem("auth_token", authData.token)
                }
                if (authData.user?.piUsername) {
                  userData.username = authData.user.piUsername
                  localStorage.setItem("pi_user", JSON.stringify(userData))
                  setUser(userData)
                }
                console.log("Restored auth with fresh JWT token:", userData.username || userData.uid)
              } else {
                console.warn("Backend signin succeeded but no token returned")
              }
            } catch (error) {
              console.error("Failed to re-authenticate with backend:", error)
               
              const isProduction = process.env.NODE_ENV === 'production'
              if (isProduction) {
                console.error("Production mode: JWT token required. Clearing auth state.")
                localStorage.removeItem("pi_access_token")
                localStorage.removeItem("pi_user")
                localStorage.removeItem("auth_token")
                setUser(null)
                setAccessToken(null)
                setIsAuthenticated(false)
              } else {
                console.warn("Development mode: Continuing with Pi access token only")
                console.log("Restored auth (Pi token only, no JWT):", userData.username || userData.uid)
              }
            }
          } else {
            console.log("Restored auth with valid JWT token:", userData.username || userData.uid)
          }
      } catch (error) {
        console.error("Error restoring auth:", error)
        localStorage.removeItem("pi_access_token")
        localStorage.removeItem("pi_user")
          localStorage.removeItem("auth_token")
        }
      }
    }

    restoreAuth()
  }, [sdkReady])

  const authenticate = useCallback(async (): Promise<PiAuthResult> => {
    console.log("authenticate() called")
    
    if (typeof window === 'undefined' || !window.Pi) {
      throw new Error("Pi SDK not available. Please open in Pi Browser.")
    }

    setIsLoading(true)
    try {
      const onIncompletePaymentFound = (payment: PiPaymentDTO) => {
        console.warn("Incomplete payment found:", payment)
      }
      
      console.log("Calling Pi.authenticate()...")
      
      const auth = await window.Pi.authenticate(
        ["username", "payments", "wallet_address"],
        onIncompletePaymentFound
      )

      console.log("Pi SDK auth SUCCESS!")
      console.log("Response:", { uid: auth.user.uid, username: auth.user.username })

      const userData: PiUser = {
        uid: auth.user.uid,
        username: auth.user.username,
        wallet_address: auth.user.wallet_address
      }

      // Send to backend using API client (handles URL construction correctly)
      console.log("Sending to backend for signin...")
      
      try {
        // Use API client which handles URL construction correctly
        const response = await apiClient.signIn({
          accessToken: auth.accessToken,
          user: {
            uid: userData.uid,
            username: userData.username || '',
            wallet_address: userData.wallet_address
          }
        })

        console.log("Backend response:", response)

        if (response.success && response.data) {
          const authData = response.data as AuthResponseData
          if (authData.user?.piUsername) {
            userData.username = authData.user.piUsername
          }
          if (authData.token) {
            localStorage.setItem("auth_token", authData.token)
          }
        }
      } catch (error) {
        console.error("Backend call failed:", error)
      }

      // Update state
      setUser(userData)
      setAccessToken(auth.accessToken)
      setIsAuthenticated(true)

      // Save to localStorage
      localStorage.setItem("pi_access_token", auth.accessToken)
      localStorage.setItem("pi_user", JSON.stringify(userData))

      return { accessToken: auth.accessToken, user: userData }
    } catch (error) {
      console.error("Pi auth failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = () => {
    setUser(null)
    setAccessToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem("pi_access_token")
    localStorage.removeItem("pi_user")
    localStorage.removeItem("auth_token")
    console.log("Signed out")
  }

  return (
    <PiContext.Provider value={{ user, accessToken, isAuthenticated, isLoading, authenticate, signOut }}>
      {children}
    </PiContext.Provider>
  )
}

export function usePi() {
  const context = useContext(PiContext)
  if (!context) throw new Error("usePi must be used within PiProvider")
  return context
}
