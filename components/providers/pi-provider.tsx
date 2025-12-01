"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { PiAuthResult, PiPaymentDTO } from "@/pi-sdk"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL 

export function PiProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PiUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize Pi SDK on mount - simple version
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initSDK = () => {
      if (window.Pi && typeof window.Pi.init === 'function') {
        try {
          window.Pi.init({ 
            version: "2.0", 
            sandbox: false
          })
          console.log("✅ Pi SDK initialized")
        } catch (error) {
          console.warn("Pi SDK already initialized:", error)
        }
      } else {
        setTimeout(initSDK, 100)
      }
    }

    initSDK()
  }, [])

  // Restore saved auth on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedToken = localStorage.getItem("pi_access_token")
    const savedUser = localStorage.getItem("pi_user")

    if (savedToken && savedUser) {
      try {
        const userData: PiUser = JSON.parse(savedUser)
        setUser(userData)
        setAccessToken(savedToken)
        setIsAuthenticated(true)
        console.log("✅ Restored auth:", userData.username || userData.uid)
      } catch (error) {
        console.error("Error restoring auth:", error)
        localStorage.removeItem("pi_access_token")
        localStorage.removeItem("pi_user")
      }
    }
  }, [])

  const authenticate = useCallback(async (): Promise<PiAuthResult> => {
    console.log("🔐 authenticate() called")
    
    if (typeof window === 'undefined' || !window.Pi) {
      throw new Error("Pi SDK not available. Please open in Pi Browser.")
    }

    setIsLoading(true)
    try {
      const onIncompletePaymentFound = (payment: PiPaymentDTO) => {
        console.warn("⚠️ Incomplete payment found:", payment)
      }
      
      console.log("🔑 Calling Pi.authenticate()...")
      
      const auth = await window.Pi.authenticate(
        ["username", "payments", "wallet_address"],
        onIncompletePaymentFound
      )

      console.log("✅ Pi SDK auth SUCCESS!")
      console.log("📦 Response:", { uid: auth.user.uid, username: auth.user.username })

      const userData: PiUser = {
        uid: auth.user.uid,
        username: auth.user.username,
        wallet_address: auth.user.wallet_address
      }

      // Send to backend
      console.log("📡 Sending to backend:", `${API_URL}/auth/signin`)
      
      try {
        const response = await fetch(`${API_URL}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: auth.accessToken,
            user: {
              uid: userData.uid,
              username: userData.username || '',
              wallet_address: userData.wallet_address
            }
          })
        })

        if (!response.ok) {
          throw new Error(`Backend signin failed: ${response.status}`)
        }

        const data = await response.json()
        console.log("📦 Backend response:", data)

        if (data.success && data.data?.user) {
          if (data.data.user.piUsername) {
            userData.username = data.data.user.piUsername
          }
          if (data.data.token) {
            localStorage.setItem("auth_token", data.data.token)
          }
        }
      } catch (error) {
        console.error("❌ Backend call failed:", error)
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
      console.error("❌ Pi auth failed:", error)
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
    console.log("✅ Signed out")
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
