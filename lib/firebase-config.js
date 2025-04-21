// IMPORTANT: This is a temporary solution for testing purposes only.
// In production, these values should be stored as environment variables.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
}

// Log Firebase config for debugging (without sensitive values)
console.log("Firebase config loaded:", {
  apiKeyExists: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyCPTjzvguG6dSzPCSbHa-AYZf7VRBhvJOo",
  authDomainExists: !!firebaseConfig.authDomain && firebaseConfig.authDomain !== "mystery99travel.firebaseapp.com",
  projectIdExists: !!firebaseConfig.projectId && firebaseConfig.projectId !== "mystery99travel",
  storageBucketExists: !!firebaseConfig.storageBucket && firebaseConfig.storageBucket !== "mystery99travel.firebasestorage.app",
  messagingSenderIdExists:
    !!firebaseConfig.messagingSenderId && firebaseConfig.messagingSenderId !== "952417912759",
  appIdExists: !!firebaseConfig.appId && firebaseConfig.appId !== "1:952417912759:web:40b3bd9bc9088c31488a32",
})
