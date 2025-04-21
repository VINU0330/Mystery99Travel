"use client"

import type React from "react"

import { useState } from "react"
import SideMenu from "./side-menu"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)

  return (
    <div className="container mx-auto py-6 px-4 max-w-md relative">
      <div className="border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <img src="/logo.png" alt="Mystery 35 Travels & Tours" className="h-12" />
          </div>
          <button className="text-gray-500 menu-button" onClick={() => setIsSideMenuOpen(true)}>
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
          </button>
        </div>

        {title && <h1 className="text-xl font-bold text-center mb-4">{title}</h1>}

        {children}
      </div>

      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
    </div>
  )
}
