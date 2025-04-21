import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { firebaseConfig } from "./firebase-config"

// Initialize Firebase
let app
let auth
let db

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    console.log("Initializing Firebase app...")
    app = initializeApp(firebaseConfig)
  } else {
    console.log("Firebase app already initialized, getting existing app...")
    app = getApp()
  }

  auth = getAuth(app)
  db = getFirestore(app)
  console.log("Firebase services initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase:", error)

  // Create placeholder objects for development
  if (process.env.NODE_ENV === "development") {
    console.warn("Using placeholder Firebase objects for development")
    app = {} as any
    auth = {} as any
    db = {} as any
  } else {
    throw error // Re-throw in production
  }
}

export { auth, db }
export default app
