// services/firebase.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";

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

// Auth com persistência usando AsyncStorage
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error: any) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth };
