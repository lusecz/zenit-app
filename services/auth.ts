// services/authService.ts

import {
  AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";

export async function register(email: string, password: string) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log("Erro no register:", error);
    throw error as AuthError;
  }
}

export async function login(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log("Erro no login:", error);
    throw error as AuthError;
  }
}

export async function logout() {
  try {
    return await signOut(auth);
  } catch (error) {
    console.log("Erro no logout:", error);
    throw error as AuthError;
  }
}
