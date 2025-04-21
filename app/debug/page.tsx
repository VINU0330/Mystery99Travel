"use client"

import { useEffect, useState } from "react"
import { CardContainer } from "@/components/ui/card-container"
import MainLayout from "@/components/layout/main-layout"

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    // Get all NEXT_PUBLIC environment variables
    const publicEnvVars = Object.keys(process.env)
      .filter((key) => key.startsWith("NEXT_PUBLIC_"))
      .reduce(
        (obj, key) => {
          // For security, only show if the variable exists, not its value
          obj[key] = process.env[key] ? "[SET]" : "[NOT SET]"
          return obj
        },
        {} as Record<string, string>,
      )

    setEnvVars(publicEnvVars)
  }, [])

  return (
    <MainLayout title="Environment Debug">
      <CardContainer>
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Firebase Configuration</h3>
          <ul className="space-y-2">
            <li>
              <span className="font-mono text-sm">NEXT_PUBLIC_FIREBASE_API_KEY: </span>
              <span
                className={`font-mono text-sm ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "text-green-600" : "text-red-600"}`}
              >
                {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "[SET]" : "[NOT SET]"}
              </span>
            </li>
            <li>
              <span className="font-mono text-sm">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: </span>
              <span
                className={`font-mono text-sm ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "text-green-600" : "text-red-600"}`}
              >
                {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "[SET]" : "[NOT SET]"}
              </span>
            </li>
            <li>
              <span className="font-mono text-sm">NEXT_PUBLIC_FIREBASE_PROJECT_ID: </span>
              <span
                className={`font-mono text-sm ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "text-green-600" : "text-red-600"}`}
              >
                {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "[SET]" : "[NOT SET]"}
              </span>
            </li>
            <li>
              <span className="font-mono text-sm">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: </span>
              <span
                className={`font-mono text-sm ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "text-green-600" : "text-red-600"}`}
              >
                {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "[SET]" : "[NOT SET]"}
              </span>
            </li>
            <li>
              <span className="font-mono text-sm">NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: </span>
              <span
                className={`font-mono text-sm ${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "text-green-600" : "text-red-600"}`}
              >
                {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "[SET]" : "[NOT SET]"}
              </span>
            </li>
            <li>
              <span className="font-mono text-sm">NEXT_PUBLIC_FIREBASE_APP_ID: </span>
              <span
                className={`font-mono text-sm ${process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "text-green-600" : "text-red-600"}`}
              >
                {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "[SET]" : "[NOT SET]"}
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">All Public Environment Variables</h3>
          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">{JSON.stringify(envVars, null, 2)}</pre>
        </div>
      </CardContainer>
    </MainLayout>
  )
}
