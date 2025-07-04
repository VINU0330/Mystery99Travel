"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CardContainer } from "@/components/ui/card-container"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login, currentUser, loading, authReady } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.replace("/service-selection")
    }
  }, [currentUser, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!authReady) {
      setError("Authentication service is not ready. Please wait a moment and try again.")
      return
    }

    setIsLoading(true)

    try {
      await login(email, password)
      // Navigation will be handled by the useEffect above when currentUser changes
    } catch (error: any) {
      console.error("Login error:", error)

      // Provide user-friendly error messages based on Firebase error codes
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password. Please try again.")
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.")
      } else if (error.message?.includes("not ready")) {
        setError("Authentication service is starting up. Please wait a moment and try again.")
      } else {
        setError("Failed to sign in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while auth is initializing
  if (loading || !authReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <CardContainer>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{loading ? "Loading..." : "Initializing authentication..."}</p>
          </div>
        </CardContainer>
      </div>
    )
  }

  // Don't render the login form if user is already logged in
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <CardContainer>
          <div className="text-center">
            <p>Redirecting to dashboard...</p>
          </div>
        </CardContainer>
      </div>
    )
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
          <div className="flex flex-col items-center mb-6">
            <img src="/logo.png" alt="Mystery 99 Travels & Tours" className="h-24 md:h-32 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {!authReady && (
            <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>Authentication service is initializing. Please wait a moment.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200 text-red-700" variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
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
                disabled={isLoading || !authReady}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-11"
                disabled={isLoading || !authReady}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white"
              disabled={isLoading || !authReady}
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
