"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const router = useRouter()
  const [userName, setUserName] = useState("User Name")
  const [isOnline, setIsOnline] = useState(true)

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const handleSignOut = () => {
    // In a real app, you would handle sign out logic here
    router.push("/")
    onClose()
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isOpen && !target.closest(".side-menu") && !target.closest(".menu-button")) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 side-menu ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* User Profile Section */}
        <div className="bg-blue-600 p-6 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="text-white">Hello</div>
          <div className="text-white font-medium">{userName}</div>
          <div className="flex items-center justify-center mt-2">
            <div className={`h-3 w-3 rounded-full ${isOnline ? "bg-green-400" : "bg-gray-400"} mr-2`}></div>
            <span className="text-white text-xs">{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => handleNavigation("/service-selection")}
              className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation("/payments")}
              className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded"
            >
              Payments
            </button>
          </nav>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleSignOut}
            className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded text-gray-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
