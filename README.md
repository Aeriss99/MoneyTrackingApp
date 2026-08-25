# 💸 Lingz99 Finance v2 — Money Tracking App

Modern money tracker with **Neobrutalism UI**, cartoon illustrations, and full-stack architecture.

## Tech Stack
- **Frontend:** Vue 3 + Vite + Tailwind CSS + Chart.js + Pinia
- **Backend:** Express.js + SQLite (better-sqlite3)
- **Auth:** Firebase Google Sign-In (client-side only)
- **Theme:** Neobrutalism Modern UI

## Quick Start

### 1. Install Dependencies
```bash
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Start Backend (Terminal 1)
```bash
cd server
node index.js
```
Server runs on `http://localhost:3001`

### 3. Start Frontend (Terminal 2)
```bash
cd client
npm run dev
```
App runs on `http://localhost:5173`

### 4. Open Browser
```
http://localhost:5173
```

## Project Structure
```
MoneyTrackingApp-v2/
├── client/                   # Vue 3 Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── MoneyHeroSvg.vue       # Login hero illustration
│   │   │   ├── WalletCharacterSvg.vue # Dashboard mascot
│   │   │   ├── StatsCards.vue         # Summary cards
│   │   │   ├── TransactionForm.vue    # Add/Edit form
│   │   │   ├── TransactionList.vue    # Transaction list + filter
│   │   │   ├── ExpenseChart.vue       # Doughnut chart
│   │   │   ├── MonthlyTrendChart.vue  # Bar chart
│   │   │   └── ToastNotification.vue  # Toast messages
│   │   ├── views/
│   │   │   ├── LoginView.vue          # Login page
│   │   │   └── DashboardView.vue      # Main dashboard
│   │   ├── stores/            # Pinia state management
│   │   ├── router/            # Vue Router
│   │   └── styles/            # Tailwind + neobrutalism CSS
│   └── index.html
├── server/                    # Express Backend
│   ├── db/database.js         # SQLite setup + schema
│   ├── routes/transactions.js # REST API endpoints
│   └── index.js               # Server entry
└── README.md
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync` | Sync Firebase user to local DB |
| GET | `/api/transactions/:userId` | Get all transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/stats/:userId` | Get dashboard stats |

## Features
- 🔐 Google Login (Firebase Auth)
- 💰 Add/Edit/Delete transactions
- 📊 Expense by category chart (Doughnut)
- 📈 Monthly trend chart (Bar)
- 🔍 Search & filter transactions
- 💸 Auto Rupiah formatting
- 🎨 Neobrutalism modern UI with cartoon illustrations
- 📱 Fully responsive (mobile-friendly)
- ⚡ Lightweight — SQLite (no heavy DB server needed)
