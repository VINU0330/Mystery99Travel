"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would validate credentials here
    router.push("/service-selection")
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-md">
      <div className="border rounded-lg p-6 space-y-6">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Mystery 35 Travels & Tours" className="h-32" />
        </div>

        <h1 className="text-xl font-bold text-center">User Sign In</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="email or username"
              required
            />
          </div>

          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
            />
          </div>

          <div className="text-xs text-right">
            <a href="#" className="text-gray-500">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
            Sign In
          </Button>

          <div className="text-xs text-center">
            New User?{" "}
            <a href="#" className="text-blue-600">
              Join Now
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
