import express from "express";
import cors from "cors";
import transactionRoutes from "./routes/transactions.js";
import importRoutes from "./routes/import.js";

const app = express();

// Izinkan semua domain
app.use(cors());
app.use(express.json());

// Dalam struktur folder /api, Vercel secara otomatis akan menjadikan file ini handler
app.use("/api", transactionRoutes);
app.use("/api", importRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
