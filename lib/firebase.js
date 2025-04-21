// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPTjzvguG6dSzPCSbHa-AYZf7VRBhvJOo",
  authDomain: "mystery99travel.firebaseapp.com",
  projectId: "mystery99travel",
  storageBucket: "mystery99travel.firebasestorage.app",
  messagingSenderId: "952417912759",
  appId: "1:952417912759:web:40b3bd9bc9088c31488a32",
  measurementId: "G-KJGSP82ZPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
