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
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  currentUser: User | null
  loading: boolean
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
  const router = useRouter()

  // Set persistence to LOCAL on mount
  useEffect(() => {
    try {
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log("Firebase persistence set to LOCAL")
        })
        .catch((error) => {
          console.error("Error setting persistence:", error)
        })
    } catch (error) {
      console.error("Error setting persistence:", error)
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener")
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log("Auth state changed:", user ? `User ${user.uid} logged in` : "No user")
        setCurrentUser(user)
        setLoading(false)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setLoading(false)
      },
    )

    return () => {
      console.log("Cleaning up auth state listener")
      unsubscribe()
    }
  }, [])

  // Signup function
  async function signup(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("User signed up successfully:", userCredential.user.uid)
      setCurrentUser(userCredential.user)

      // Set a session cookie to help with middleware
      document.cookie = `auth-session=true; path=/; max-age=86400; SameSite=Strict`

      return userCredential
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  // Login function
  async function login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("User logged in successfully:", userCredential.user.uid)
      setCurrentUser(userCredential.user)

      // Set a session cookie to help with middleware
      document.cookie = `auth-session=true; path=/; max-age=86400; SameSite=Strict`

      return userCredential
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(auth)
      console.log("User logged out successfully")
      setCurrentUser(null)

      // Clear the session cookie
      document.cookie = "auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"

      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
