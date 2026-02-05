import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCqGxi8rQF0u-NT9bbCP47LZGeVInKPK-4",
    authDomain: "poyomed-8638f.firebaseapp.com",
    projectId: "poyomed-8638f",
    storageBucket: "poyomed-8638f.firebasestorage.app",
    messagingSenderId: "464711032174",
    appId: "1:464711032174:web:1cbac7340f228f51a3b57f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with Persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// ✅ Initialize Firestore
export const db = getFirestore(app);

