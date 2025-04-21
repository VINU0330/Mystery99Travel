"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  error: string | null
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
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user)
          setLoading(false)
          setInitialized(true)
        },
        (error) => {
          console.error("Auth state change error:", error)
          setError(error.message)
          setLoading(false)
          setInitialized(true)
        },
      )

      return unsubscribe
    } catch (error) {
      console.error("Firebase auth initialization error:", error)
      setError(error instanceof Error ? error.message : "Failed to initialize authentication")
      setLoading(false)
      setInitialized(true)
      return () => {}
    }
  }, [])

  async function signup(email: string, password: string) {
    try {
      setError(null)
      return createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        // Signed up
        setCurrentUser(userCredential.user)
      })
    } catch (error) {
      console.error("Signup error in context:", error)
      setError(error instanceof Error ? error.message : "Failed to create account")
      throw error
    }
  }

  async function login(email: string, password: string) {
    try {
      setError(null)
      return signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        // Signed in
        setCurrentUser(userCredential.user)
      })
    } catch (error) {
      console.error("Login error in context:", error)
      setError(error instanceof Error ? error.message : "Failed to sign in")
      throw error
    }
  }

  async function logout() {
    try {
      setError(null)
      return signOut(auth).then(() => {
        setCurrentUser(null)
      })
    } catch (error) {
      console.error("Logout error:", error)
      setError(error instanceof Error ? error.message : "Failed to sign out")
      throw error
    }
  }

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>{initialized ? children : <div>Initializing...</div>}</AuthContext.Provider>
  )
}
