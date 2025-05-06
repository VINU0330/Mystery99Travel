"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function AuthCheck() {
  const { currentUser } = useAuth()
  const [cookies, setCookies] = useState<string>("")

  useEffect(() => {
    setCookies(document.cookie)
  }, [])

  if (process.env.NODE_ENV !== "production") {
    return (
      <div className="fixed bottom-2 right-2 bg-black/80 text-white p-2 rounded text-xs z-50 max-w-xs overflow-hidden">
        <div>
          <strong>Auth Status:</strong> {currentUser ? "Logged In" : "Not Logged In"}
        </div>
        {currentUser && (
          <div>
            <strong>User:</strong> {currentUser.email}
          </div>
        )}
        <div className="truncate">
          <strong>Cookies:</strong> {cookies || "None"}
        </div>
      </div>
    )
  }

  return null
}
