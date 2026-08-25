import express from "express";
import cors from "cors";
import transactionRoutes from "./routes/transactions.js";
import importRoutes from "./routes/import.js";

const app = express();

app.use(cors());
app.use(express.json());

// Express Router akan mendengarkan di root karena Vercel sudah meroute /api ke sini
app.use("/", transactionRoutes);
app.use("/", importRoutes);

// Catch-all 404 for API
app.use("*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found on this Serverless Function" });
});

export default app;
