import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format time from seconds to HH:MM:SS
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

// Calculate waiting charges for drink and drive service
// First 15 minutes free, then Rs.300 per 15 minutes
export function calculateWaitingCharges(waitingTimeSeconds: number): number {
  if (waitingTimeSeconds <= 900) {
    // 15 minutes = 900 seconds
    return 0
  }

  const extraSeconds = waitingTimeSeconds - 900
  const extra15MinuteBlocks = Math.ceil(extraSeconds / 900) // 900 seconds = 15 minutes
  return extra15MinuteBlocks * 300
}

// Calculate payment for drink and drive service
export function calculateDrinkAndDrivePayment(
  distance: number,
  durationMinutes: number,
  isPickupOutOfColombo: boolean,
  isDropOutOfColombo: boolean,
  waitingCharges: number,
): number {
  let basePayment = 0

  // Base charge: Rs.2000 for first 10km or first 2 hours, whichever is higher
  const baseDistance = 10
  const baseDuration = 120 // 2 hours in minutes

  if (distance <= baseDistance && durationMinutes <= baseDuration) {
    basePayment = 2000
  } else {
    basePayment = 2000

    // Additional distance charges: Rs.100 per km after 10km
    if (distance > baseDistance) {
      basePayment += (distance - baseDistance) * 100
    }

    // Additional time charges: Rs.50 per minute after 2 hours
    if (durationMinutes > baseDuration) {
      basePayment += (durationMinutes - baseDuration) * 50
    }
  }

  // Area charges
  let areaCharges = 0
  if (isPickupOutOfColombo) {
    areaCharges += 500
  }
  if (isDropOutOfColombo) {
    areaCharges += 500
  }

  return basePayment + areaCharges + waitingCharges
}

// Calculate payment for day time service with updated pricing
export function calculateDayTimeServicePayment(durationMinutes: number, isOutOfColombo = false): number {
  // Convert minutes to hours (rounded up)
  const durationHours = Math.ceil(durationMinutes / 60)

  // Base pricing structure
  let basePayment = 0
  if (durationHours <= 4) {
    basePayment = 3000
  } else if (durationHours === 5) {
    basePayment = 3400
  } else if (durationHours === 6) {
    basePayment = 3800
  } else if (durationHours === 7) {
    basePayment = 4200
  } else if (durationHours === 8) {
    basePayment = 4600
  } else if (durationHours === 9) {
    basePayment = 5000
  } else if (durationHours === 10) {
    basePayment = 5400
  } else if (durationHours === 11) {
    basePayment = 5800
  } else if (durationHours === 12) {
    basePayment = 6000
  } else {
    // After 12 hours: 6000 + 500 per additional hour
    const additionalHours = durationHours - 12
    basePayment = 6000 + additionalHours * 500
  }

  // Add Rs.300 if out of Colombo area
  if (isOutOfColombo) {
    basePayment += 300
  }

  return basePayment
}

// Calculate payment for day time long service
export function calculateDayTimeLongServicePayment(days: number): number {
  // Fixed rate of Rs.5500 per day
  return days * 5500
}

// Calculate payment for vehicle delivery service
export function calculateVehicleDeliveryPayment(endLocationArea: string): number {
  switch (endLocationArea) {
    case "colombo-1-5":
      return 1500 // Colombo 1 to 5
    case "colombo-area":
      return 2000 // Colombo Area
    case "western-province":
      return 3000 // Western Province
    case "island-wide":
      return 5000 // Island Wide
    default:
      return 1500 // Default to lowest rate
  }
}
