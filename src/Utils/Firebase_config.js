import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-WDje125P3ztzZ4A6YvIkB7KHphf1Z8A",
  authDomain: "lmsystem-qrcode.firebaseapp.com",
  projectId: "lmsystem-qrcode",
  storageBucket: "lmsystem-qrcode.appspot.com",
  messagingSenderId: "1034892031148",
  appId: "1:1034892031148:web:d9c6ef85bca04909da1b09",
  measurementId: "G-4MT9LQPE1Z"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const STORAGE = getStorage(FIREBASE_APP);
