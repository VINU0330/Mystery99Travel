import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"

export interface TripData {
  userId: string
  serviceType: string
  pickupLocation: string
  dropLocation: string
  pickupArea?: string
  dropArea?: string
  endLocationArea?: string
  startMeterCount?: number
  endMeterCount?: number
  distance?: number
  tripDuration: string
  elapsedTime: number
  waitingTime?: number
  waitingCharges?: number
  basePayment?: number
  totalPayment: number
  companyCommission: number
  driverPayment: number
  customerName?: string
  phoneNumber?: string
  paymentMethod: string
  status: "completed" | "pending"
  createdAt: Timestamp | Date
}

// Helper function to remove undefined values from an object
const removeUndefined = (obj: Record<string, any>) => {
  const result: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  })
  return result
}

export const saveTrip = async (tripData: Omit<TripData, "createdAt">) => {
  try {
    // Remove undefined values to prevent Firestore errors
    const cleanedData = removeUndefined(tripData)

    // Save to Firestore
    const docRef = await addDoc(collection(db, "trips"), {
      ...cleanedData,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error saving trip:", error)
    throw error
  }
}

export const getUserTrips = async (userId: string) => {
  try {
    try {
      // First attempt: Try with the composite index if it exists
      const q = query(collection(db, "trips"), where("userId", "==", userId), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const trips: Array<TripData & { id: string }> = []

      querySnapshot.forEach((doc) => {
        const data = doc.data() as TripData
        trips.push({
          ...data,
          id: doc.id,
        })
      })

      return trips
    } catch (indexError) {
      console.log("Index error, falling back to client-side sorting:", indexError)

      // Second attempt: Just filter by userId without ordering (no index needed)
      const q = query(collection(db, "trips"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const trips: Array<TripData & { id: string }> = []

      querySnapshot.forEach((doc) => {
        const data = doc.data() as TripData
        trips.push({
          ...data,
          id: doc.id,
        })
      })

      // Sort on the client side instead
      return trips.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt.toDate().getTime()
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt.toDate().getTime()
        return dateB - dateA // descending order
      })
    }
  } catch (error) {
    console.error("Error getting trips:", error)
    throw error
  }
}

export const formatTripForDisplay = (trip: TripData & { id: string }) => {
  const tripId = trip.id.substring(0, 6).toUpperCase()

  // Handle different date formats safely
  let dateStr = ""
  try {
    if (trip.createdAt instanceof Date) {
      dateStr = trip.createdAt.toISOString().split("T")[0]
    } else if (typeof trip.createdAt === "object" && trip.createdAt !== null && "toDate" in trip.createdAt) {
      dateStr = trip.createdAt.toDate().toISOString().split("T")[0]
    } else if (typeof trip.createdAt === "string") {
      dateStr = new Date(trip.createdAt).toISOString().split("T")[0]
    } else {
      dateStr = new Date().toISOString().split("T")[0] // Fallback
    }
  } catch (e) {
    console.error("Error formatting date:", e)
    dateStr = new Date().toISOString().split("T")[0] // Fallback
  }

  let service = ""
  switch (trip.serviceType) {
    case "drink-and-drive":
      service = "Drink and Drive"
      break
    case "day-time":
      service = "Day Time"
      break
    case "vehicle-delivery":
      service = "Vehicle Delivery"
      break
    default:
      service = trip.serviceType
  }

  return {
    tripId,
    date: dateStr,
    service,
    basePayment: trip.basePayment || trip.totalPayment,
    waitingCharges: trip.waitingCharges || 0,
    totalPayment: trip.totalPayment,
    commission: trip.companyCommission,
    riderPayment: trip.driverPayment,
    status: trip.status,
  }
}
