import { auth, provider, onAuthStateChanged, signInWithPopup, signOut } from "../js/firebase.js";

export function subscribeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, provider);
}

export async function logoutUser() {
  return signOut(auth);
}
