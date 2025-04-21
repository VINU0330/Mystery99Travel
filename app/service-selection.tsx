"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ServiceSelection() {
  const router = useRouter()

  const handleServiceSelect = (service: string) => {
    // Store the selected service in localStorage for use in the calculator
    localStorage.setItem("selectedService", service)
    router.push("/")
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-md">
      <div className="border rounded-lg p-6 space-y-6">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">MYSTERY 35</span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-center">Rider Payment Calculator</h1>

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
        </div>
      </div>
    </div>
  )
}
