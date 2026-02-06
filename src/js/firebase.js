import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBlZPPpwN9C2gSKpdrhXJBtaYJ0D6VonNY",
  authDomain: "moneytrackingapp-6c94a.firebaseapp.com",
  projectId: "moneytrackingapp-6c94a",
  storageBucket: "moneytrackingapp-6c94a.firebasestorage.app",
  messagingSenderId: "826077908631",
  appId: "1:826077908631:web:54be252edbdc817016e3d2",
  measurementId: "G-EFD7ZTC929"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export {
  auth,
  provider,
  db,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
};
