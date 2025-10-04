import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDvBK-JCKuXrApgXIBu5oFPB48Sr8fDQmo",
  authDomain: "odoo-9d53d.firebaseapp.com",
  projectId: "odoo-9d53d",
  storageBucket: "odoo-9d53d.firebasestorage.app",
  messagingSenderId: "732033928621",
  appId: "1:732033928621:web:1d9caf2bc7df18f1c86524",
  measurementId: "G-EL26JQGG23"
};

// Initialize Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
