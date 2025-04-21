"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  formatTime,
  formatTimeFromComponents,
  calculateDrinkAndDrivePayment,
  calculateDayTimeServicePayment,
  calculateVehicleDeliveryPayment,
} from "@/lib/utils"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/app-layout"

export default function RideCalculator() {
  const router = useRouter()

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

  // Manual time input
  const [hours, setHours] = useState("0")
  const [minutes, setMinutes] = useState("0")
  const [seconds, setSeconds] = useState("0")
  const [isManualTime, setIsManualTime] = useState(false)

  // Payment calculation
  const [totalDistance, setTotalDistance] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [companyCommission, setCompanyCommission] = useState(0)
  const [driverPayment, setDriverPayment] = useState(0)

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load service type from localStorage on component mount
  useEffect(() => {
    const savedServiceType = localStorage.getItem("selectedService")
    if (savedServiceType) {
      setServiceType(savedServiceType)
    }
  }, [])

  // Update trip duration when manual inputs change
  useEffect(() => {
    if (isManualTime) {
      const h = Number.parseInt(hours) || 0
      const m = Number.parseInt(minutes) || 0
      const s = Number.parseInt(seconds) || 0

      // Calculate total seconds for payment calculation
      const totalSeconds = h * 3600 + m * 60 + s
      setElapsedTime(totalSeconds)

      // Format for display
      const formattedTime = formatTimeFromComponents(h, m, s)
      setTripDuration(formattedTime)
    }
  }, [hours, minutes, seconds, isManualTime])

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
    setIsManualTime(false)

    // Start the timer
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (tripStartTime && !isManualTime) {
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

  // Toggle between automatic and manual time input
  const toggleManualTime = () => {
    if (!isManualTime) {
      // When switching to manual, initialize with current elapsed time
      const h = Math.floor(elapsedTime / 3600)
      const m = Math.floor((elapsedTime % 3600) / 60)
      const s = elapsedTime % 60

      setHours(h.toString())
      setMinutes(m.toString())
      setSeconds(s.toString())

      // Stop the automatic timer
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      // When switching back to automatic, restart the timer if it was running
      if (isTimerRunning && tripStartTime) {
        timerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - tripStartTime) / 1000)
          setElapsedTime(elapsed)
          setTripDuration(formatTime(elapsed))
        }, 1000)
      }
    }

    setIsManualTime(!isManualTime)
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

  // Handle final end trip
  const handleFinalEndTrip = () => {
    setStep(3)
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
    setHours("0")
    setMinutes("0")
    setSeconds("0")
    setIsManualTime(false)

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
    if (isTimerRunning && !isManualTime) {
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
  }, [isTimerRunning, tripStartTime, isManualTime])

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

  // Render trip duration input based on mode
  const renderTripDurationInput = () => {
    if (isManualTime) {
      return (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-medium">Hours</label>
            <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} className="h-8" />
          </div>
          <div>
            <label className="text-xs font-medium">Minutes</label>
            <Input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="h-8"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Seconds</label>
            <Input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className="h-8"
            />
          </div>
        </div>
      )
    } else {
      return <div className="h-10 px-3 py-2 border rounded-md bg-gray-50">{tripDuration}</div>
    }
  }

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <p className="text-sm text-center text-gray-500">Calculate the Payment for {getServiceTitle()}</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Pickup Location</label>
                <Input
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Enter pickup location"
                />
              </div>

              {(serviceType === "drink-and-drive" || serviceType === "day-time") && (
                <div>
                  <label className="text-sm font-medium">Trip Area</label>
                  <Select value={pickupArea} onValueChange={setPickupArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
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
                  <div className="h-10 px-3 py-2 border rounded-md bg-gray-50">{pickupTime || "00:00:00"}</div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Trip Duration</label>
                    <Button variant="ghost" size="sm" onClick={toggleManualTime} className="h-6 text-xs px-2">
                      {isManualTime ? "Auto" : "Manual"}
                    </Button>
                  </div>
                  {renderTripDurationInput()}
                </div>
              </div>

              <Button className="w-full bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={handleMarkAsPickup}>
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
                  />
                </div>
              )}

              <Button
                className="w-full bg-green-100 text-green-800 hover:bg-green-200"
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
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <p className="text-sm text-center text-gray-500">Calculate the Payment for {getServiceTitle()}</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Drop Location</label>
                <Input
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  placeholder="Enter drop location"
                />
              </div>

              {serviceType === "vehicle-delivery" ? (
                <div>
                  <label className="text-sm font-medium">End Location Area</label>
                  <Select value={endLocationArea} onValueChange={setEndLocationArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
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
                  <div className="h-10 px-3 py-2 border rounded-md bg-gray-50">{pickupTime}</div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Trip Duration</label>
                    <Button variant="ghost" size="sm" onClick={toggleManualTime} className="h-6 text-xs px-2">
                      {isManualTime ? "Auto" : "Manual"}
                    </Button>
                  </div>
                  {renderTripDurationInput()}
                </div>
              </div>

              <Button
                className="w-full bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                onClick={handleMarkAsDropped}
              >
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
                  />
                </div>
              )}

              <Button
                className="w-full bg-red-100 text-red-800 hover:bg-red-200"
                onClick={handleEndTrip}
                disabled={
                  !dropLocation ||
                  (serviceType === "vehicle-delivery" ? !endLocationArea : !dropArea) ||
                  (serviceType !== "day-time" && !endMeterCount)
                }
              >
                End Trip
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-sm text-center text-gray-500">Calculate the Payment for {getServiceTitle()}</p>

            <div className="border rounded-lg p-4 space-y-4">
              <h2 className="text-base font-medium">Customer Payment</h2>

              <div className="grid grid-cols-2 gap-2">
                {(serviceType === "drink-and-drive" || serviceType === "vehicle-delivery") && (
                  <>
                    <div className="text-sm">Total Trip Distance (KM)</div>
                    <div className="text-sm text-right">{totalDistance.toFixed(2)}</div>
                  </>
                )}

                <div className="text-sm">Total Trip Time</div>
                <div className="text-sm text-right text-red-500">{finalTripDuration}</div>
              </div>

              <div className="bg-red-100 rounded-lg p-4 text-center">
                <div className="text-sm font-medium">Full Payment Amount</div>
                <div className="text-2xl font-bold text-red-600">Rs.{totalPayment.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Payment</label>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cash"
                      checked={paymentMethod === "cash"}
                      onCheckedChange={() => setPaymentMethod("cash")}
                    />
                    <label htmlFor="cash" className="text-sm">
                      Cash Payment
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="credit"
                      checked={paymentMethod === "credit"}
                      onCheckedChange={() => setPaymentMethod("credit")}
                    />
                    <label htmlFor="credit" className="text-sm">
                      Credit Payment
                    </label>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-red-600 text-white hover:bg-red-700" onClick={handleFinalEndTrip}>
                End Trip
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-sm text-center text-gray-500">Calculate the Payment for {getServiceTitle()}</p>

            <div className="border rounded-lg p-4 space-y-4">
              <h2 className="text-base font-medium">Driver Payment</h2>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">Trip Total Payment</div>
                <div className="text-sm text-right text-red-500">Rs.{totalPayment.toFixed(2)}</div>

                <div className="text-sm">Company Commission</div>
                <div className="text-sm text-right">Rs.{companyCommission.toFixed(2)}</div>
              </div>

              <div className="bg-red-100 rounded-lg p-4 text-center">
                <div className="text-sm font-medium">Payment Amount</div>
                <div className="text-2xl font-bold text-red-600">Rs.{driverPayment.toFixed(2)}</div>
              </div>
            </div>

            <Button className="w-full bg-green-100 text-green-800 hover:bg-green-200" onClick={handleRideAgain}>
              Ride Again
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return <AppLayout title="Rider Payment Calculator">{renderStep()}</AppLayout>
}
