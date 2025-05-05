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
          <path d="M10 17h4V5H2v12h3"></path>
          <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"></path>
          <circle cx="7.5" cy="17.5" r="2.5"></circle>
          <circle cx="17.5" cy="17.5" r="2.5"></circle>
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
