import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if all required Firebase config values are present
const configValues = Object.values(firebaseConfig)
const allConfigValuesPresent = configValues.every((value) => value !== undefined && value !== null && value !== "")

if (!allConfigValuesPresent) {
  console.error(
    "Firebase configuration is incomplete. Missing values:",
    Object.keys(firebaseConfig).filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]),
  )
}

// Initialize Firebase
let app
let auth
let db

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  console.log("Firebase initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase:", error)
  // Create a placeholder app for development if config is missing
  if (!allConfigValuesPresent && process.env.NODE_ENV === "development") {
    console.warn("Using placeholder Firebase app for development")
    app = {} as any
    auth = {} as any
    db = {} as any
  }
}

export { auth, db }
export default app
