import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBlZPPpwN9C2gSKpdrhXJBtaYJ0D6VonNY",
  authDomain: "moneytrackingapp-6c94a.firebaseapp.com",
  projectId: "moneytrackingapp-6c94a",
  storageBucket: "moneytrackingapp-6c94a.firebasestorage.app",
  messagingSenderId: "826077908631",
  appId: "1:826077908631:web:54be252edbdc817016e3d2",
  measurementId: "G-EFD7ZTC929",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
provider.addScope("email");
provider.addScope("profile");

const authPersistencePromise = setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed setting auth persistence:", error);
});

export {
  Timestamp,
  auth,
  authPersistencePromise,
  collection,
  db,
  deleteDoc,
  doc,
  limit,
  onAuthStateChanged,
  onSnapshot,
  orderBy,
  provider,
  query,
  serverTimestamp,
  setDoc,
  signInWithPopup,
  signOut,
  updateDoc,
  writeBatch,
};
