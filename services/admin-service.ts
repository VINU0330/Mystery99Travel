import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import type { TripData } from "./trip-service";

export interface AdminUser {
  email: string;
  role: "admin" | "super-admin";
  createdAt: Timestamp | Date;
}

export interface JobData {
  rideType: string;
  pickupLocation: string;
  dropLocation: string;
  customerName: string;
  phoneNumber: string;
  createdAt?: Timestamp | Date;
}

// Check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { db } = (await import("@/lib/firebase")) as any;
    const adminDoc = await getDoc(doc(db, "admins", userId));
    return adminDoc.exists();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Get admin user details
export const getAdminDetails = async (
  userId: string
): Promise<AdminUser | null> => {
  try {
    const { db } = (await import("@/lib/firebase")) as any;
    const adminDoc = await getDoc(doc(db, "admins", userId));

    if (adminDoc.exists()) {
      return adminDoc.data() as AdminUser;
    }
    return null;
  } catch (error) {
    console.error("Error getting admin details:", error);
    return null;
  }
};

// Add admin user
export const addAdminUser = async (
  userId: string,
  email: string,
  role: "admin" | "super-admin" = "admin"
) => {
  try {
    const { db } = (await import("@/lib/firebase")) as any;
    await setDoc(doc(db, "admins", userId), {
      email,
      role,
      createdAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error adding admin user:", error);
    throw error;
  }
};

// Create job manually (admin function)
export const createJob = async (jobData: JobData) => {
  try {
    const { db } = (await import("@/lib/firebase")) as any;

    const docRef = await addDoc(collection(db, "admin-jobs"), {
      rideType: jobData.rideType,
      pickupLocation: jobData.pickupLocation,
      dropLocation: jobData.dropLocation,
      customerName: jobData.customerName,
      phoneNumber: jobData.phoneNumber,
      createdAt: Timestamp.now(),
      createdBy: "admin",
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

// Get all admin-created jobs
export const getAllAdminJobs = async () => {
  try {
    const { db } = (await import("@/lib/firebase")) as any;

    try {
      const q = query(
        collection(db, "admin-jobs"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const jobs: Array<JobData & { id: string }> = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as JobData;
        jobs.push({
          ...data,
          id: doc.id,
        });
      });

      return jobs;
    } catch (indexError) {
      console.log(
        "Index error, falling back to client-side sorting:",
        indexError
      );

      const querySnapshot = await getDocs(collection(db, "admin-jobs"));
      const jobs: Array<JobData & { id: string }> = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as JobData;
        jobs.push({
          ...data,
          id: doc.id,
        });
      });

      return jobs.sort((a, b) => {
        const dateA =
          a.createdAt instanceof Date
            ? a.createdAt.getTime()
            : a.createdAt?.toDate().getTime() || 0;
        const dateB =
          b.createdAt instanceof Date
            ? b.createdAt.getTime()
            : b.createdAt?.toDate().getTime() || 0;
        return dateB - dateA;
      });
    }
  } catch (error) {
    console.error("Error getting admin jobs:", error);
    throw error;
  }
};

// Get all trips from all users (admin function)
export const getAllTrips = async () => {
  try {
    const { db } = (await import("@/lib/firebase")) as any;

    try {
      const q = query(collection(db, "trips"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const trips: Array<
        TripData & { id: string; rideType?: string; vehicleType?: string }
      > = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as TripData & {
          rideType?: string;
          vehicleType?: string;
        };
        trips.push({
          ...data,
          id: doc.id,
        });
      });

      return trips;
    } catch (indexError) {
      console.log(
        "Index error, falling back to client-side sorting:",
        indexError
      );

      const querySnapshot = await getDocs(collection(db, "trips"));
      const trips: Array<
        TripData & { id: string; rideType?: string; vehicleType?: string }
      > = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as TripData & {
          rideType?: string;
          vehicleType?: string;
        };
        trips.push({
          ...data,
          id: doc.id,
        });
      });

      return trips.sort((a, b) => {
        const dateA =
          a.createdAt instanceof Date
            ? a.createdAt.getTime()
            : a.createdAt.toDate().getTime();
        const dateB =
          b.createdAt instanceof Date
            ? b.createdAt.getTime()
            : b.createdAt.toDate().getTime();
        return dateB - dateA;
      });
    }
  } catch (error) {
    console.error("Error getting all trips:", error);
    throw error;
  }
};

// Get all users (admin function)
export const getAllUsers = async () => {
  try {
    const { db } = (await import("@/lib/firebase")) as any;

    const querySnapshot = await getDocs(collection(db, "users"));
    const users: Array<{ id: string; email: string; [key: string]: any }> = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email || "",
        ...data,
      });
    });

    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};
