import express from "express";
import cors from "cors";
import transactionRoutes from "./routes/transactions.js";
import importRoutes from "./routes/import.js";

const app = express();

app.use(cors());
app.use(express.json());

// Bind API routes properly
app.use("/api", transactionRoutes);
app.use("/api", importRoutes);

// Catch-all 404 for API to prevent silent Vercel crashes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

export default app;
