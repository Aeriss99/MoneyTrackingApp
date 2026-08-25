import express from "express";
import cors from "cors";
import transactionRoutes from "./routes/transactions.js";
import importRoutes from "./routes/import.js";

const app = express();

// Izinkan semua domain
app.use(cors());
app.use(express.json());

// Tangkap baik dengan /api maupun tanpa /api agar Vercel Serverless tidak kebingungan path
app.use("/api", transactionRoutes);
app.use("/api", importRoutes);
app.use("/", transactionRoutes);
app.use("/", importRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Vercel Serverless Function expects the Express app to be exported
export default app;
