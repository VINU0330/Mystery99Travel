"use client"

import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { CardContainer } from "@/components/ui/card-container"
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
          className="w-6 h-6"
        >
          <path d="M12 2v2"></path>
          <path d="M12 8v2"></path>
          <path d="M12 14v2"></path>
          <path d="M12 20v2"></path>
          <path d="M6 4l1.5 1.5"></path>
          <path d="M16.5 5.5 18 4"></path>
          <path d="M4 6l1.5 1.5"></path>
          <path d="M18 6l-1.5 1.5"></path>
          <path d="M8 17a4 4 0 0 1-4-4"></path>
          <path d="M16 13a4 4 0 0 1 4 4"></path>
          <circle cx="12" cy="12" r="3"></circle>
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
          className="w-6 h-6"
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
          className="w-6 h-6"
        >
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
          <circle cx="7" cy="17" r="2"></circle>
          <path d="M9 17h6"></path>
          <circle cx="17" cy="17" r="2"></circle>
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
          className="w-6 h-6"
        >
          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
          <line x1="2" x2="22" y1="10" y2="10"></line>
        </svg>
      ),
    },
  ]

  // Animation variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <MainLayout title="Rider Payment Calculator">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {services.map((service) => (
          <motion.div key={service.id} variants={item}>
            <CardContainer
              className="card-hover cursor-pointer"
              onClick={() => {
                if (service.id === "payments") {
                  router.push("/payments")
                } else {
                  handleServiceSelect(service.id)
                }
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-primary-50 p-3 rounded-full text-primary-600">{service.icon}</div>
                <div>
                  <h3 className="font-medium text-lg">{service.name}</h3>
                  <p className="text-gray-500 text-sm">{service.description}</p>
                </div>
              </div>
            </CardContainer>
          </motion.div>
        ))}
      </motion.div>
    </MainLayout>
  )
}
