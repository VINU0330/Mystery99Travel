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
  createdAt: Timestamp
}

export const saveTrip = async (tripData: Omit<TripData, "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "trips"), {
      ...tripData,
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
  } catch (error) {
    console.error("Error getting trips:", error)
    throw error
  }
}

export const formatTripForDisplay = (trip: TripData & { id: string }) => {
  const tripId = trip.id.substring(0, 6).toUpperCase()
  const date = trip.createdAt.toDate().toISOString().split("T")[0]

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
    date,
    service,
    totalPayment: trip.totalPayment,
    commission: trip.companyCommission,
    riderPayment: trip.driverPayment,
    status: trip.status,
  }
}
