"use client"

import { useEffect, useState } from "react"

export function FirebaseConfigCheck() {
  const [configStatus, setConfigStatus] = useState<{
    apiKey: boolean
    authDomain: boolean
    projectId: boolean
    storageBucket: boolean
    messagingSenderId: boolean
    appId: boolean
  }>({
    apiKey: false,
    authDomain: false,
    projectId: false,
    storageBucket: false,
    messagingSenderId: false,
    appId: false,
  })

  useEffect(() => {
    // Check if Firebase config environment variables are available
    setConfigStatus({
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  }, [])

  const allConfigPresent = Object.values(configStatus).every(Boolean)

  if (allConfigPresent) {
    return null // Don't show anything if all config is present
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Firebase configuration issue detected.</strong> The following environment variables are missing:
          </p>
          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
            {!configStatus.apiKey && <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>}
            {!configStatus.authDomain && <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>}
            {!configStatus.projectId && <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>}
            {!configStatus.storageBucket && <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>}
            {!configStatus.messagingSenderId && <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>}
            {!configStatus.appId && <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
