// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEJOzWMbRt8eHofI88MqyTr1dWWPdGIAU",
  authDomain: "quanlytailieu-demo.firebaseapp.com",
  projectId: "quanlytailieu-demo",
  storageBucket: "quanlytailieu-demo.firebasestorage.app",
  messagingSenderId: "19661308499",
  appId: "1:19661308499:web:2ee7127f3fb566472cfca6",
  measurementId: "G-8EX9RN3ZWH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Analytics is optional and might not work perfectly in localhost without full setup
export const analytics = getAnalytics(app);
