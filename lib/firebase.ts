import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Log environment variables (without exposing sensitive data)
console.log("Firebase config check:", {
  apiKeyExists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomainExists: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectIdExists: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucketExists: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderIdExists: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appIdExists: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
})

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (only if it hasn't been initialized already)
let app
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
} catch (error) {
  console.error("Error initializing Firebase:", error)
  // Create a dummy app for fallback
  app = {} as any
}

// Initialize Firebase Authentication and get a reference to the service
let auth
try {
  auth = getAuth(app)
} catch (error) {
  console.error("Error initializing Firebase Auth:", error)
  auth = {} as any
}

// Initialize Cloud Firestore and get a reference to the service
let db
try {
  db = getFirestore(app)
} catch (error) {
  console.error("Error initializing Firestore:", error)
  db = {} as any
}

export { auth, db }
export default app
