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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  async function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
      // Signed up
      setCurrentUser(userCredential.user)
    })
  }

  async function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      // Signed in
      setCurrentUser(userCredential.user)
    })
  }

  async function logout() {
    return signOut(auth).then(() => {
      setCurrentUser(null)
    })
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
