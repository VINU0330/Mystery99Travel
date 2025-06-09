import { initializeApp, getApps } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only if it hasn't been initialized already
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firebase Authentication
let auth
try {
  auth = getAuth(app)

  // Only connect to emulator in development and if not already connected
  if (process.env.NODE_ENV === "development" && !auth.config.emulator) {
    try {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    } catch (error) {
      // Emulator connection failed, continue with production auth
      console.log("Auth emulator not available, using production auth")
    }
  }
} catch (error) {
  console.error("Error initializing Firebase Auth:", error)
  throw error
}

// Initialize Cloud Firestore
let db
try {
  db = getFirestore(app)

  // Only connect to emulator in development and if not already connected
  if (process.env.NODE_ENV === "development") {
    try {
      connectFirestoreEmulator(db, "localhost", 8080)
    } catch (error) {
      // Emulator connection failed, continue with production firestore
      console.log("Firestore emulator not available, using production firestore")
    }
  }
} catch (error) {
  console.error("Error initializing Firestore:", error)
  throw error
}

export { auth, db }
export default app
