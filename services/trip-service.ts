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

// Check if we're using local storage fallback
const isUsingLocalStorage = typeof window !== "undefined" && localStorage.getItem("localUser") !== null

export const saveTrip = async (tripData: Omit<TripData, "createdAt">) => {
  try {
    // Remove undefined values to prevent Firestore errors
    const cleanedData = removeUndefined(tripData)

    if (isUsingLocalStorage) {
      // Local storage fallback
      const trips = JSON.parse(localStorage.getItem("trips") || "[]")
      const newTrip = {
        ...cleanedData,
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date(),
      }
      trips.push(newTrip)
      localStorage.setItem("trips", JSON.stringify(trips))
      return newTrip.id
    } else {
      // Firestore
      const docRef = await addDoc(collection(db, "trips"), {
        ...cleanedData,
        createdAt: Timestamp.now(),
      })
      return docRef.id
    }
  } catch (error) {
    console.error("Error saving trip:", error)

    // Fallback to local storage if Firestore fails
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    const newTrip = {
      ...removeUndefined(tripData),
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
    }
    trips.push(newTrip)
    localStorage.setItem("trips", JSON.stringify(trips))
    return newTrip.id
  }
}

export const getUserTrips = async (userId: string) => {
  try {
    if (isUsingLocalStorage) {
      // Local storage fallback
      const trips = JSON.parse(localStorage.getItem("trips") || "[]")
      return trips
        .filter((trip: any) => trip.userId === userId)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else {
      // Firestore - Modified to avoid composite index requirement
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
    }
  } catch (error) {
    console.error("Error getting trips:", error)

    // Fallback to local storage if Firestore fails
    const trips = JSON.parse(localStorage.getItem("trips") || "[]")
    return trips
      .filter((trip: any) => trip.userId === userId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
    totalPayment: trip.totalPayment,
    commission: trip.companyCommission,
    riderPayment: trip.driverPayment,
    status: trip.status,
  }
}
