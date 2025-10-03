import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Config for your main app (Auth & Firestore)
const mainAppConfig = {
  apiKey: "AIzaSyAfV5O71IbZVPwmrA4Djuvq3a_uOLSTkQE",
  authDomain: "jal-rakshak2025.firebaseapp.com",
  projectId: "jal-rakshak2025",
  storageBucket: "jal-rakshak2025.firebasestorage.app",
  messagingSenderId: "588182343885",
  appId: "1:588182343885:web:1c7ae6246def1b5ccf9984",
  measurementId: "G-6SS08MHJZD"
};

// Config for your sensor data app (Realtime Database)
const sensorAppConfig = {
  apiKey: "AIzaSyBnRZL1iZxoQnvypRFCfeeK0dj0gL5ADS0",
  authDomain: "waterb-quality-detection.firebaseapp.com",
  databaseURL: "https://waterb-quality-detection-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "waterb-quality-detection",
  storageBucket: "waterb-quality-detection.firebasestorage.app",
  messagingSenderId: "726428939707",
  appId: "1:726428939707:web:a106c4900d10726a31409e"
};

// --- Corrected Initializations ---

// 1. Initialize your main app ONCE
const mainApp = initializeApp(mainAppConfig);

// 2. Initialize your secondary app with a unique name
const sensorApp = initializeApp(sensorAppConfig, "sensors"); 

// --- Corrected Exports ---

// Export services from the correct app instance
export const auth = getAuth(mainApp); // <-- Use mainApp
export const db = getFirestore(mainApp); // <-- Use mainApp
export const sensorDB = getDatabase(sensorApp); // <-- This was already correct