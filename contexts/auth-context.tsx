"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  authReady: boolean
  isUsingLocalAuth: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [isUsingLocalAuth] = useState(false)
  const [auth, setAuth] = useState<any>(null)
  const [initError, setInitError] = useState<string | null>(null)

  // Initialize Firebase Auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing Firebase Auth...")

        // Check if environment variables are available
        const requiredEnvVars = [
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        ]

        const isConfigured = requiredEnvVars.every((envVar) => envVar && envVar.trim() !== "")

        if (!isConfigured) {
          throw new Error("Firebase environment variables are not properly configured")
        }

        // Dynamic import to avoid SSR issues
        const { auth: firebaseAuth } = await import("@/lib/firebase")

        if (!firebaseAuth) {
          throw new Error("Failed to initialize Firebase Auth")
        }

        setAuth(firebaseAuth)
        setAuthReady(true)

        // Set persistence to LOCAL
        try {
          await setPersistence(firebaseAuth, browserLocalPersistence)
          console.log("Firebase persistence set to LOCAL")
        } catch (persistenceError) {
          console.warn("Failed to set persistence:", persistenceError)
          // Continue without persistence
        }

        console.log("Firebase Auth initialized successfully")
      } catch (error) {
        console.error("Error initializing Firebase Auth:", error)
        setInitError(error instanceof Error ? error.message : "Failed to initialize authentication")
        setAuthReady(false)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    if (!auth || !authReady) return

    console.log("Setting up auth state listener")

    let unsubscribe: (() => void) | undefined

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          console.log("Auth state changed:", user ? `User ${user.uid} logged in` : "No user")
          setCurrentUser(user)
          setLoading(false)

          // Set session cookie for middleware
          if (typeof window !== "undefined") {
            if (user) {
              document.cookie = `auth-session=true; path=/; max-age=86400; SameSite=Strict`
            } else {
              document.cookie = "auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
            }
          }
        },
        (error) => {
          console.error("Auth state change error:", error)
          setLoading(false)
        },
      )
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        console.log("Cleaning up auth state listener")
        unsubscribe()
      }
    }
  }, [auth, authReady])

  // Signup function
  async function signup(email: string, password: string) {
    if (!auth || !authReady) {
      throw new Error("Authentication service is not ready. Please wait and try again.")
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("User signed up successfully:", userCredential.user.uid)
      return userCredential
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  // Login function
  async function login(email: string, password: string) {
    if (!auth || !authReady) {
      throw new Error("Authentication service is not ready. Please wait and try again.")
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("User logged in successfully:", userCredential.user.uid)
      return userCredential
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Logout function
  async function logout() {
    if (!auth || !authReady) {
      throw new Error("Authentication service is not ready. Please wait and try again.")
    }

    try {
      await signOut(auth)
      console.log("User logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const value = {
    currentUser,
    loading,
    authReady,
    isUsingLocalAuth,
    login,
    signup,
    logout,
  }

  // If there's an initialization error, show it
  if (initError) {
    return (
      <AuthContext.Provider value={value}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full text-center">
            <div className="text-red-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{initError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
