import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  let formattedTime = ""

  if (hours > 0) {
    formattedTime += `${hours}h `
  }

  if (minutes > 0 || hours > 0) {
    formattedTime += `${minutes}m `
  }

  formattedTime += `${secs}s`

  return formattedTime
}

export function formatTimeFromComponents(hours: number, minutes: number, seconds: number): string {
  let formattedTime = ""

  if (hours > 0) {
    formattedTime += `${hours}h `
  }

  if (minutes > 0 || hours > 0) {
    formattedTime += `${minutes}m `
  }

  formattedTime += `${seconds}s`

  return formattedTime
}

export function calculateDrinkAndDrivePayment(
  distance: number,
  durationMinutes: number,
  isPickupOutOfColombo: boolean,
  isDropOutOfColombo: boolean,
) {
  // Base package: LKR 1700 for first 55 minutes and first 10 kilometers
  let payment = 1700

  // Package rate based on duration
  if (durationMinutes > 55) {
    payment = 2400 // After first 55 minutes

    if (durationMinutes > 110) {
      payment = 3100 // After next 55 minutes

      if (durationMinutes > 165) {
        payment = 3700 // After next 55 minutes

        if (durationMinutes > 220) {
          payment = 4400 // After next 55 minutes

          if (durationMinutes > 275) {
            payment = 5500 // After next 55 minutes

            // After this package, LKR 500 will be added for every next hour
            const additionalHours = Math.floor((durationMinutes - 275) / 60)
            payment += additionalHours * 500
          }
        }
      }
    }
  }

  // Additional charge for distance beyond 10km
  if (distance > 10) {
    payment += (distance - 10) * 100
  }

  // Additional charge for out of Colombo area
  if (isPickupOutOfColombo) {
    payment += 500
  }

  if (isDropOutOfColombo) {
    payment += 500
  }

  return payment
}

export function calculateDayTimeServicePayment(durationMinutes: number) {
  // Convert minutes to hours (rounded up)
  const durationHours = Math.ceil(durationMinutes / 60)

  // Day time service pricing tiers
  if (durationHours <= 4) {
    return 2400 // 4 hours
  } else if (durationHours <= 6) {
    return 3000 // 6 hours
  } else if (durationHours <= 8) {
    return 3400 // 8 hours
  } else if (durationHours <= 10) {
    return 4000 // 10 hours
  } else if (durationHours <= 12) {
    return 5000 // 12 hours
  } else {
    // For durations beyond 12 hours, add 500 per additional hour
    const additionalHours = durationHours - 12
    return 5000 + additionalHours * 500
  }
}

export function calculateVehicleDeliveryPayment(endLocationArea: string) {
  switch (endLocationArea) {
    case "colombo-1-5":
      return 2500
    case "colombo-area":
      return 3000
    case "western-province":
      return 5000
    case "island-wide":
      return 7500
    default:
      return 2500 // Default to lowest rate
  }
}
