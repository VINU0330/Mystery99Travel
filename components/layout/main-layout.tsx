"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  title?: string
}

export default function MainLayout({ children, showHeader = true, title }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  // Navigation items
  const navItems = [
    { name: "Home", path: "/service-selection" },
    { name: "Drink and Drive", path: "/calculator?service=drink-and-drive" },
    { name: "Day Time Service", path: "/calculator?service=day-time" },
    { name: "Vehicle Delivery", path: "/calculator?service=vehicle-delivery" },
    { name: "Payments", path: "/payments" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      {showHeader && (
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/service-selection" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Mystery 35" className="h-10" />
              {!isMobile && <span className="font-semibold text-primary-600">Mystery 35</span>}
            </Link>

            {title && <h1 className="text-lg font-semibold text-center hidden md:block">{title}</h1>}

            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Menu">
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
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          </div>
        </header>
      )}

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50"
          >
            <div className="flex flex-col h-full">
              {/* User Profile */}
              <div className="bg-primary-600 p-6 text-center">
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
                <div className="text-white font-medium">User Name</div>
                <div className="flex items-center justify-center mt-2">
                  <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                  <span className="text-white text-xs">Online</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "block px-4 py-2 rounded-md transition-colors",
                        pathname === item.path
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Sign Out */}
              <div className="p-4 border-t">
                <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Sign Out
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {title && isMobile && <h1 className="text-xl font-bold text-center mb-6">{title}</h1>}
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
