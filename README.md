# Money Tracker (Firebase + Tailwind)

A simple money tracker with Google login, Firestore storage, and a modern Tailwind UI.

## Features
- Google login (Firebase Auth)
- Transactions stored per user in Firestore
- Add / delete transactions
- Balance calculation
- Rupiah formatting
- Tailwind CSS UI

## Project Structure
```
money-tracker/
├── index.html
├── src/
│   ├── js/
│   │   ├── main.js
│   │   ├── firebase.js
│   │   ├── storage.js
│   │   ├── transaction.js
│   │   └── ui.js
│   └── css/
│       └── input.css
├── dist/
│   └── output.css
├── package.json
└── tailwind.config.js
```

## Setup
1) Install dependencies
```
npm install
```

2) Build Tailwind CSS
```
npm run dev
```

3) Run a local server (required for ES modules)
```
python3 -m http.server 5173
```
Open: `http://localhost:5173`

## Firebase Setup
1) Create Firebase project: `https://console.firebase.google.com/`
2) Authentication → Sign-in method → Enable **Google**
3) Authentication → Settings → Authorized domains → add:
   - `localhost`
   - `127.0.0.1`
4) Firestore Database → Create database (test mode for dev)
5) Project Settings → General → Your apps → **Web app** → copy config
6) Paste config into `src/js/firebase.js`:
```
const firebaseConfig = {
  apiKey: "AIzaSy...REAL",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcd1234",
};
```

## Firestore Rules (Dev)
Use this in Firestore Rules tab and Publish:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/transactions/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting
- `auth/unauthorized-domain`: add your domain to Authorized domains.
- `auth/api-key-not-valid`: config in `src/js/firebase.js` is wrong.
- `permission-denied`: Firestore rules not published or DB not created.

