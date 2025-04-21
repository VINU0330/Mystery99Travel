"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CardContainer } from "@/components/ui/card-container"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess(true)
    } catch (error) {
      console.error("Password reset error:", error)

      if (error instanceof Error) {
        const errorCode = error.message.match(/$$([^)]+)$$/)?.[1]

        switch (errorCode) {
          case "auth/user-not-found":
            setError("No account found with this email address.")
            break
          case "auth/invalid-email":
            setError("Please enter a valid email address.")
            break
          case "auth/configuration-not-found":
            setError("Authentication service is not properly configured. Please contact support.")
            break
          default:
            setError(`Failed to send reset email: ${error.message}`)
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
            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-500 mt-1">Enter your email to receive a reset link</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Password reset email sent! Check your inbox for further instructions.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
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

            <Button
              type="submit"
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white"
              disabled={isLoading || success}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Remember your password?</span>{" "}
              <Link href="/" className="text-primary-600 hover:underline font-medium">
                Back to Sign In
              </Link>
            </div>
          </form>
        </CardContainer>
      </motion.div>
    </div>
  )
}
