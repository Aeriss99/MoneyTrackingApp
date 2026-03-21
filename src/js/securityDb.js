import {
  doc,
  db,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "./firebase.js";

function getSecurityDocRef(userId) {
  return doc(db, "users", userId, "settings", "security");
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  return null;
}

async function hashPin(pin) {
  const normalizedPin = String(pin || "").trim();
  const encoder = new TextEncoder();
  const bytes = encoder.encode(normalizedPin);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function subscribeSecurityPin(userId, onData, onError) {
  const docRef = getSecurityDocRef(userId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData({
          hasPin: false,
          pinHash: "",
          updatedAt: null,
        });
        return;
      }

      const data = snapshot.data();
      const pinHash = String(data.pinHash || "");

      onData({
        hasPin: Boolean(pinHash),
        pinHash,
        updatedAt: toDate(data.updatedAt),
      });
    },
    (error) => {
      console.error("Security PIN subscription error:", error);
      onError(error);
    },
  );
}

export async function saveSecurityPin(userId, pin) {
  const pinHash = await hashPin(pin);
  const docRef = getSecurityDocRef(userId);

  await setDoc(
    docRef,
    {
      pinHash,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function verifySecurityPin(pin, expectedHash) {
  const normalizedHash = String(expectedHash || "").trim();
  if (!normalizedHash) return false;
  const hashedInput = await hashPin(pin);
  return hashedInput === normalizedHash;
}
