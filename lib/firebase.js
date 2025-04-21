// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHLnmqKqZvUSljnTPpJI6HmAxe_GVH4Ps",
  authDomain: "seat-kpi.firebaseapp.com",
  projectId: "seat-kpi",
  storageBucket: "seat-kpi.firebasestorage.app",
  messagingSenderId: "447206340128",
  appId: "1:447206340128:web:6a8831d2e33af43f78ee45",
  measurementId: "G-2MYG78N44Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
