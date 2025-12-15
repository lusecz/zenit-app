// services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAcjNeeFE8TKAHbqPBXFG98tRBHqICJCAU",
  authDomain: "zenitapp-9a3f6.firebaseapp.com",
  projectId: "zenitapp-9a3f6",
  storageBucket: "zenitapp-9a3f6.firebasestorage.app",
  messagingSenderId: "194052764326",
  appId: "1:194052764326:web:68468a096880a67760fa67",
  measurementId: "G-L829W16RL0",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Auth padrão (funciona no Expo)
export const auth = getAuth(app);