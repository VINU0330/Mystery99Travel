"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CardContainer } from "@/components/ui/card-container"
import MainLayout from "@/components/layout/main-layout"
import { motion } from "framer-motion"
import {
  formatTime,
  calculateDrinkAndDrivePayment,
  calculateDayTimeServicePayment,
  calculateVehicleDeliveryPayment,
} from "@/lib/utils"

// Import the necessary functions and hooks
import { useAuth } from "@/contexts/auth-context"
import { saveTrip } from "@/services/trip-service"

export default function RideCalculator() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Service type
  const [serviceType, setServiceType] = useState("drink-and-drive")

  // Step state (0: pickup, 1: dropoff, 2: customer payment, 3: rider payment)
  const [step, setStep] = useState(0)

  // Form data
  const [pickupLocation, setPickupLocation] = useState("")
  const [dropLocation, setDropLocation] = useState("")
  const [pickupArea, setPickupArea] = useState("")
  const [dropArea, setDropArea] = useState("")
  const [endLocationArea, setEndLocationArea] = useState("")
  const [startMeterCount, setStartMeterCount] = useState("")
  const [endMeterCount, setEndMeterCount] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")

  // Time tracking
  const [pickupTime, setPickupTime] = useState("")
  const [tripStartTime, setTripStartTime] = useState<number | null>(null)
  const [tripEndTime, setTripEndTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [tripDuration, setTripDuration] = useState("00:00:00")
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [finalTripDuration, setFinalTripDuration] = useState("")
  const [finalElapsedTime, setFinalElapsedTime] = useState(0)

  // Payment calculation
  const [totalDistance, setTotalDistance] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [companyCommission, setCompanyCommission] = useState(0)
  const [driverPayment, setDriverPayment] = useState(0)

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Add loading state for saving
  const [isSaving, setIsSaving] = useState(false)
  const { currentUser } = useAuth()

  // Load service type from URL or localStorage on component mount
  useEffect(() => {
    const serviceFromUrl = searchParams.get("service")
    if (serviceFromUrl) {
      setServiceType(serviceFromUrl)
      localStorage.setItem("selectedService", serviceFromUrl)
    } else {
      const savedServiceType = localStorage.getItem("selectedService")
      if (savedServiceType) {
        setServiceType(savedServiceType)
      }
    }
  }, [searchParams])

  // Handle pickup marking
  const handleMarkAsPickup = () => {
    const now = new Date()
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    setPickupTime(formattedTime)
    setTripStartTime(Date.now())
    setIsTimerRunning(true)

    // Start the timer
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (tripStartTime) {
        const elapsed = Math.floor((Date.now() - tripStartTime) / 1000)
        setElapsedTime(elapsed)
        setTripDuration(formatTime(elapsed))
      }
    }, 1000)
  }

  // Handle trip start
  const handleStartTrip = () => {
    if (
      pickupLocation &&
      (serviceType === "vehicle-delivery" || pickupArea) &&
      (serviceType === "day-time" || startMeterCount)
    ) {
      setStep(1)
    }
  }

  // Handle drop marking
  const handleMarkAsDropped = () => {
    setTripEndTime(Date.now())
    setIsTimerRunning(false)
    setFinalTripDuration(tripDuration) // Save the current trip duration
    setFinalElapsedTime(elapsedTime) // Save the current elapsed time in seconds
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Handle trip end and calculate payment
  const handleEndTrip = () => {
    // Validation based on service type
    if (
      (serviceType === "drink-and-drive" && dropLocation && dropArea && endMeterCount) ||
      (serviceType === "day-time" && dropLocation && dropArea) ||
      (serviceType === "vehicle-delivery" && dropLocation && endLocationArea)
    ) {
      // Calculate distance for services that need it
      let distance = 0
      if (serviceType === "drink-and-drive" || serviceType === "vehicle-delivery") {
        distance = Math.max(0, Number.parseFloat(endMeterCount) - Number.parseFloat(startMeterCount))
      }
      setTotalDistance(distance)

      // Calculate trip duration in minutes - use the final elapsed time
      const durationMinutes = Math.ceil(finalElapsedTime / 60)

      // Calculate payment based on service type
      let payment = 0

      if (serviceType === "drink-and-drive") {
        // Check if either pickup or drop area is outside Colombo
        const isPickupOutOfColombo = pickupArea === "out-colombo"
        const isDropOutOfColombo = dropArea === "out-colombo"
        payment = calculateDrinkAndDrivePayment(distance, durationMinutes, isPickupOutOfColombo, isDropOutOfColombo)
      } else if (serviceType === "day-time") {
        payment = calculateDayTimeServicePayment(durationMinutes)
      } else if (serviceType === "vehicle-delivery") {
        payment = calculateVehicleDeliveryPayment(endLocationArea)
      }

      setTotalPayment(payment)
      setCompanyCommission(payment * 0.2) // 20% commission
      setDriverPayment(payment * 0.8) // 80% for driver

      // Ensure timer is completely stopped
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setIsTimerRunning(false)
      setStep(2)
    }
  }

  // Replace the handleFinalEndTrip function with this:
  const handleFinalEndTrip = async () => {
    if (!currentUser) {
      alert("You must be logged in to save trip data.")
      return
    }

    setIsSaving(true)

    try {
      // Save trip data to Firestore
      await saveTrip({
        userId: currentUser.uid,
        serviceType,
        pickupLocation,
        dropLocation,
        pickupArea: serviceType !== "vehicle-delivery" ? pickupArea : undefined,
        dropArea: serviceType !== "vehicle-delivery" ? dropArea : undefined,
        endLocationArea: serviceType === "vehicle-delivery" ? endLocationArea : undefined,
        startMeterCount: startMeterCount ? Number.parseFloat(startMeterCount) : undefined,
        endMeterCount: endMeterCount ? Number.parseFloat(endMeterCount) : undefined,
        distance: totalDistance,
        tripDuration: finalTripDuration,
        elapsedTime: finalElapsedTime,
        totalPayment,
        companyCommission,
        driverPayment,
        customerName,
        phoneNumber,
        paymentMethod,
        status: paymentMethod === "cash" ? "completed" : "pending",
      })

      setStep(3)
    } catch (error) {
      console.error("Error saving trip:", error)
      alert("Failed to save trip data. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Reset and start a new ride
  const handleRideAgain = () => {
    // Reset all states
    setStep(0)
    setPickupLocation("")
    setDropLocation("")
    setPickupArea("")
    setDropArea("")
    setEndLocationArea("")
    setStartMeterCount("")
    setEndMeterCount("")
    setCustomerName("")
    setPhoneNumber("")
    setPaymentMethod("cash")
    setPickupTime("")
    setTripStartTime(null)
    setTripEndTime(null)
    setElapsedTime(0)
    setFinalElapsedTime(0)
    setTripDuration("00:00:00")
    setTotalDistance(0)
    setTotalPayment(0)
    setCompanyCommission(0)
    setDriverPayment(0)
    setFinalTripDuration("")

    // Go back to service selection
    router.push("/service-selection")
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Update timer status when isTimerRunning changes
  useEffect(() => {
    if (isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        if (tripStartTime) {
          const elapsed = Math.floor((Date.now() - tripStartTime) / 1000)
          setElapsedTime(elapsed)
          setTripDuration(formatTime(elapsed))
        }
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning, tripStartTime])

  // Get service title based on service type
  const getServiceTitle = () => {
    switch (serviceType) {
      case "drink-and-drive":
        return "Drink and Drive Service"
      case "day-time":
        return "Day Time Service"
      case "vehicle-delivery":
        return "Vehicle Delivery Service"
      default:
        return "Ride Service"
    }
  }

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CardContainer>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Pickup Location</label>
                  <Input
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Enter pickup location"
                    className="h-10"
                  />
                </div>

                {(serviceType === "drink-and-drive" || serviceType === "day-time") && (
                  <div>
                    <label className="text-sm font-medium">Trip Area</label>
                    <Select value={pickupArea} onValueChange={setPickupArea}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colombo">Colombo Area</SelectItem>
                        <SelectItem value="out-colombo">Out of Colombo Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pickup Time</label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center justify-center font-mono">
                      {pickupTime || "00:00:00"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Trip Duration</label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center justify-center font-mono">
                      {tripDuration}
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white" onClick={handleMarkAsPickup}>
                  Mark As Picked
                </Button>

                {(serviceType === "drink-and-drive" || serviceType === "vehicle-delivery") && (
                  <div>
                    <label className="text-sm font-medium">Start Meter Count</label>
                    <Input
                      type="number"
                      value={startMeterCount}
                      onChange={(e) => setStartMeterCount(e.target.value)}
                      placeholder="Enter start meter reading"
                      className="h-10"
                    />
                  </div>
                )}
              </div>
            </CardContainer>

            <Button
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleStartTrip}
              disabled={
                !pickupLocation ||
                (serviceType !== "vehicle-delivery" && !pickupArea) ||
                (serviceType !== "day-time" && !startMeterCount) ||
                !pickupTime
              }
            >
              Start Trip
            </Button>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CardContainer>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Drop Location</label>
                  <Input
                    value={dropLocation}
                    onChange={(e) => setDropLocation(e.target.value)}
                    placeholder="Enter drop location"
                    className="h-10"
                  />
                </div>

                {serviceType === "vehicle-delivery" ? (
                  <div>
                    <label className="text-sm font-medium">End Location Area</label>
                    <Select value={endLocationArea} onValueChange={setEndLocationArea}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colombo-1-5">Colombo 1 to 5</SelectItem>
                        <SelectItem value="colombo-area">Colombo Area</SelectItem>
                        <SelectItem value="western-province">Western Province</SelectItem>
                        <SelectItem value="island-wide">Island Wide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium">Trip Area</label>
                    <Select value={dropArea} onValueChange={setDropArea}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colombo">Colombo Area</SelectItem>
                        <SelectItem value="out-colombo">Out of Colombo Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pickup Time</label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center justify-center font-mono">
                      {pickupTime}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Trip Duration</label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center justify-center font-mono">
                      {tripDuration}
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white" onClick={handleMarkAsDropped}>
                  Mark As Dropped
                </Button>

                {(serviceType === "drink-and-drive" || serviceType === "vehicle-delivery") && (
                  <div>
                    <label className="text-sm font-medium">End Meter Count</label>
                    <Input
                      type="number"
                      value={endMeterCount}
                      onChange={(e) => setEndMeterCount(e.target.value)}
                      placeholder="Enter end meter reading"
                      className="h-10"
                    />
                  </div>
                )}
              </div>
            </CardContainer>

            <Button
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleEndTrip}
              disabled={
                !dropLocation ||
                (serviceType === "vehicle-delivery" ? !endLocationArea : !dropArea) ||
                (serviceType !== "day-time" && !endMeterCount)
              }
            >
              End Trip
            </Button>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CardContainer className="bg-white">
              <h3 className="text-lg font-medium mb-4">Trip Summary</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(serviceType === "drink-and-drive" || serviceType === "vehicle-delivery") && (
                    <>
                      <div className="font-medium">Total Trip Distance</div>
                      <div className="text-right">{totalDistance.toFixed(2)} KM</div>
                    </>
                  )}

                  <div className="font-medium">Total Trip Time</div>
                  <div className="text-right font-mono text-primary-600">{finalTripDuration}</div>

                  <div className="font-medium">Pickup Location</div>
                  <div className="text-right">{pickupLocation}</div>

                  <div className="font-medium">Drop Location</div>
                  <div className="text-right">{dropLocation}</div>
                </div>

                <div className="bg-primary-50 rounded-lg p-4 text-center mt-4">
                  <div className="text-sm font-medium text-gray-600">Full Payment Amount</div>
                  <div className="text-3xl font-bold text-primary-600">Rs.{totalPayment.toLocaleString()}</div>
                </div>
              </div>
            </CardContainer>

            <CardContainer>
              <h3 className="text-lg font-medium mb-4">Customer Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Customer Name</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Payment Method</label>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cash"
                        checked={paymentMethod === "cash"}
                        onCheckedChange={() => setPaymentMethod("cash")}
                      />
                      <label htmlFor="cash" className="text-sm cursor-pointer">
                        Cash Payment
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="credit"
                        checked={paymentMethod === "credit"}
                        onCheckedChange={() => setPaymentMethod("credit")}
                      />
                      <label htmlFor="credit" className="text-sm cursor-pointer">
                        Credit Payment
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContainer>

            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleFinalEndTrip}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "End Trip"}
            </Button>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CardContainer className="bg-white">
              <h3 className="text-lg font-medium mb-4">Payment Summary</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Total Payment</div>
                  <div className="text-right">Rs.{totalPayment.toLocaleString()}</div>

                  <div className="font-medium">Company Commission (20%)</div>
                  <div className="text-right">Rs.{companyCommission.toLocaleString()}</div>

                  <div className="font-medium">Driver Payment (80%)</div>
                  <div className="text-right">Rs.{driverPayment.toLocaleString()}</div>
                </div>
              </div>
            </CardContainer>

            <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white" onClick={handleRideAgain}>
              Ride Again
            </Button>
          </motion.div>
        )

      default:
        return <div>Select a service to begin.</div>
    }
  }

  return (
    <MainLayout title={getServiceTitle()}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {step === 0
            ? "Pickup Details"
            : step === 1
              ? "Drop-off Details"
              : step === 2
                ? "Customer Payment"
                : "Rider Payment"}
        </h2>
        {renderStep()}
      </div>
    </MainLayout>
  )
}
