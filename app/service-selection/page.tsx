"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/app-layout"

export default function ServiceSelection() {
  const router = useRouter()

  const handleServiceSelect = (service: string) => {
    // Store the selected service in localStorage for use in the calculator
    localStorage.setItem("selectedService", service)
    router.push("/calculator")
  }

  const handlePaymentsClick = () => {
    router.push("/payments")
  }

  return (
    <AppLayout title="Rider Payment Calculator">
      <div className="space-y-3">
        <Button
          className="w-full bg-blue-100 text-blue-800 hover:bg-blue-200 py-6 text-lg"
          onClick={() => handleServiceSelect("drink-and-drive")}
        >
          Drink and Drive Service
        </Button>

        <Button
          className="w-full bg-blue-100 text-blue-800 hover:bg-blue-200 py-6 text-lg"
          onClick={() => handleServiceSelect("day-time")}
        >
          Day Time Service
        </Button>

        <Button
          className="w-full bg-blue-100 text-blue-800 hover:bg-blue-200 py-6 text-lg"
          onClick={() => handleServiceSelect("vehicle-delivery")}
        >
          Vehicle Delivery Service
        </Button>

        <Button
          className="w-full bg-blue-100 text-blue-800 hover:bg-blue-200 py-6 text-lg"
          onClick={handlePaymentsClick}
        >
          Payments
        </Button>
      </div>
    </AppLayout>
  )
}
