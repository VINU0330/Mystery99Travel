"use client"

import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function ServiceSelection() {
  const router = useRouter()

  const handleServiceSelect = (service: string) => {
    // Store the selected service in localStorage for use in the calculator
    localStorage.setItem("selectedService", service)
    router.push(`/calculator?service=${service}`)
  }

  const services = [
    {
      id: "drink-and-drive",
      name: "Drink and Drive Service",
      description: "Safe transportation after drinking",
      icon: (
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
          className="w-8 h-8"
        >
          <path d="M8 22h8"></path>
          <path d="M7 10h10"></path>
          <path d="M12 10v12"></path>
          <path d="M18 2H6a2 2 0 0 0-2 2v6c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path>
        </svg>
      ),
    },
    {
      id: "day-time",
      name: "Day Time Service",
      description: "Scheduled rides during the day",
      icon: (
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
          className="w-8 h-8"
        >
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
      ),
    },
    {
      id: "day-time-long",
      name: "Day Time Long Service",
      description: "Multi-day scheduled service",
      icon: (
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
          className="w-8 h-8"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      id: "vehicle-delivery",
      name: "Vehicle Delivery Service",
      description: "Vehicle transport to your location",
      icon: (
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
          className="w-8 h-8"
        >
          <path d="M10 17h4V5H2v12h3"></path>
          <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"></path>
          <circle cx="7.5" cy="17.5" r="2.5"></circle>
          <circle cx="17.5" cy="17.5" r="2.5"></circle>
        </svg>
      ),
    },
    {
      id: "reports",
      name: "Reports",
      description: "Generate and download trip reports",
      icon: (
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
          className="w-8 h-8"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
      ),
    },
    {
      id: "payments",
      name: "Payments",
      description: "View and manage payments",
      icon: (
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
          className="w-8 h-8"
        >
          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
          <line x1="2" x2="22" y1="10" y2="10"></line>
        </svg>
      ),
    },
  ]

  return (
    <MainLayout title="Rider Payment Calculator">
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-200"
              onClick={() => {
                if (service.id === "payments") {
                  router.push("/payments")
                } else if (service.id === "reports") {
                  router.push("/reports")
                } else {
                  handleServiceSelect(service.id)
                }
              }}
            >
              <div className="bg-primary-50 p-4 rounded-full text-primary-600">{service.icon}</div>
              <div className="text-center">
                <h3 className="font-medium text-lg">{service.name}</h3>
                <p className="text-gray-500 text-sm">{service.description}</p>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </MainLayout>
  )
}
