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
import { useRouter } from "next/navigation"

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isUsingLocalAuth: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Local authentication fallback
interface LocalUser {
  uid: string
  email: string
  displayName?: string
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUsingLocalAuth, setIsUsingLocalAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      // Try to use Firebase Auth
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user)
        setLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error("Firebase auth error:", error)
      console.log("Falling back to local authentication")
      setIsUsingLocalAuth(true)

      // Check for local user in localStorage
      const localUserJson = localStorage.getItem("localUser")
      if (localUserJson) {
        try {
          const localUser = JSON.parse(localUserJson) as LocalUser
          setCurrentUser(localUser as unknown as User)
        } catch (e) {
          console.error("Error parsing local user:", e)
        }
      }

      setLoading(false)
      return () => {}
    }
  }, [])

  async function signup(email: string, password: string) {
    if (isUsingLocalAuth) {
      // Local authentication fallback
      const localUser: LocalUser = {
        uid: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        email,
      }
      localStorage.setItem("localUser", JSON.stringify(localUser))
      localStorage.setItem(`user_${email}`, password) // Not secure, just for demo
      setCurrentUser(localUser as unknown as User)

      // Set a cookie to simulate a session
    document.cookie = `session=local_${Date.now()}; path=/; max-age=86400; SameSite=Lax; Secure`



      return Promise.resolve()
    } else {
      return createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        // Signed up
        setCurrentUser(userCredential.user)
      })
    }
  }

  async function login(email: string, password: string) {
    if (isUsingLocalAuth) {
      // Local authentication fallback
      const storedPassword = localStorage.getItem(`user_${email}`)
      if (storedPassword === password) {
        const localUserJson = localStorage.getItem("localUser")
        if (localUserJson) {
          const localUser = JSON.parse(localUserJson) as LocalUser
          setCurrentUser(localUser as unknown as User)

          // Set a cookie to simulate a session
         document.cookie = `session=local_${Date.now()}; path=/; max-age=86400; SameSite=Lax; Secure`


          return Promise.resolve()
        }
      }
      return Promise.reject(new Error("Invalid email or password"))
    } else {
      return signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        // Signed in
        setCurrentUser(userCredential.user)
      })
    }
  }

  async function logout() {
    if (isUsingLocalAuth) {
      // Local authentication fallback
      setCurrentUser(null)

      // Clear the session cookie
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      return Promise.resolve()
    } else {
      return signOut(auth).then(() => {
        setCurrentUser(null)
      })
    }
  }

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    isUsingLocalAuth,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
