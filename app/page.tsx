"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CardContainer } from "@/components/ui/card-container"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { firebaseConfig } from "@/lib/firebase-config"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [firebaseInitialized, setFirebaseInitialized] = useState(false)
  const router = useRouter()

  // Initialize Firebase on component mount
  useEffect(() => {
    try {
      console.log("Initializing Firebase in Login component...")
      initializeApp(firebaseConfig)
      setFirebaseInitialized(true)
      console.log("Firebase initialized successfully in Login component")
    } catch (error) {
      console.error("Error initializing Firebase in Login component:", error)
      setError("Failed to initialize authentication. Please try again later.")
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!firebaseInitialized) {
      setError("Authentication service is not initialized. Please try again later.")
      setIsLoading(false)
      return
    }

    try {
      console.log("Starting login process...")
      const auth = getAuth()

      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Login successful, redirecting...")

      // Set session cookie
      document.cookie = `session=${await userCredential.user.getIdToken()}; path=/; max-age=3600; SameSite=Strict`

      router.push("/service-selection")
    } catch (error) {
      console.error("Login error:", error)

      // Handle specific Firebase error codes
      if (error instanceof Error) {
        const errorMessage = error.message

        if (errorMessage.includes("auth/user-not-found") || errorMessage.includes("auth/wrong-password")) {
          setError("Invalid email or password. Please try again.")
        } else if (errorMessage.includes("auth/invalid-email")) {
          setError("Please enter a valid email address.")
        } else if (errorMessage.includes("auth/too-many-requests")) {
          setError("Too many failed login attempts. Please try again later.")
        } else if (errorMessage.includes("auth/configuration-not-found")) {
          setError("Firebase configuration error. Please check your environment variables.")
        } else {
          setError(`Failed to sign in: ${errorMessage}`)
        }
      } else {
        setError("An unexpected error occurred. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <CardContainer>
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="Mystery 99 Travels & Tours" className="h-24 md:h-32 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {!firebaseInitialized && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-700">Initializing authentication service...</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white"
              disabled={isLoading || !firebaseInitialized}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">New to Mystery99?</span>{" "}
              <Link href="/signup" className="text-primary-600 hover:underline font-medium">
                Create an account
              </Link>
            </div>
          </form>
        </CardContainer>
      </motion.div>
    </div>
  )
}
