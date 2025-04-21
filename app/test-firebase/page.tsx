"use client"

import { useState, useEffect } from "react"
import { CardContainer } from "@/components/ui/card-container"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { initializeApp } from "firebase/app"
import { getAuth, signInAnonymously } from "firebase/auth"
import { firebaseConfig } from "@/lib/firebase-config"

export default function TestFirebase() {
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [configStatus, setConfigStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check Firebase config
    const config = {
      apiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY",
      authDomain: !!firebaseConfig.authDomain && firebaseConfig.authDomain !== "YOUR_AUTH_DOMAIN",
      projectId: !!firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID",
      storageBucket: !!firebaseConfig.storageBucket && firebaseConfig.storageBucket !== "YOUR_STORAGE_BUCKET",
      messagingSenderId:
        !!firebaseConfig.messagingSenderId && firebaseConfig.messagingSenderId !== "YOUR_MESSAGING_SENDER_ID",
      appId: !!firebaseConfig.appId && firebaseConfig.appId !== "YOUR_APP_ID",
    }

    setConfigStatus(config)
  }, [])

  const testFirebase = async () => {
    setStatus("testing")
    setMessage("")

    try {
      // Initialize Firebase
      const app = initializeApp(firebaseConfig)
      const auth = getAuth(app)

      // Try anonymous sign-in as a simple test
      await signInAnonymously(auth)

      setStatus("success")
      setMessage("Firebase initialized and authenticated successfully!")
    } catch (error) {
      setStatus("error")
      if (error instanceof Error) {
        setMessage(`Firebase test failed: ${error.message}`)
      } else {
        setMessage("Firebase test failed with an unknown error")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <CardContainer>
          <h1 className="text-2xl font-bold text-center mb-6">Firebase Configuration Test</h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-2">Configuration Status</h2>
              <ul className="space-y-2">
                {Object.entries(configStatus).map(([key, value]) => (
                  <li key={key} className="flex items-center">
                    {value ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="font-mono text-sm">{key}: </span>
                    <span className={`ml-2 ${value ? "text-green-600" : "text-red-600"}`}>
                      {value ? "Valid" : "Missing or Invalid"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center">
              <Button onClick={testFirebase} disabled={status === "testing"} className="px-6">
                {status === "testing" ? "Testing..." : "Test Firebase Connection"}
              </Button>
            </div>

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContainer>
      </div>
    </div>
  )
}
