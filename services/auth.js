// services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";

export async function register(email, password) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log("Erro no register:", error);
    throw error; // ← ESSENCIAL
  }
}

export async function login(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log("Erro no login:", error);
    throw error;
  }
}

export async function logout() {
  try {
    return await signOut(auth);
  } catch (error) {
    console.log("Erro no logout:", error);
    throw error;
  }
}
