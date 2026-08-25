import express from "express";
import cors from "cors";
import transactionRoutes from "./routes/transactions.js";
import importRoutes from "./routes/import.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Izinkan semua domain
app.use(cors());
app.use(express.json());

app.use("/api", transactionRoutes);
app.use("/api", importRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Dalam Vercel (environment VERCEL=1), jangan gunakan app.listen
// Vercel hanya membutuhkan export default aplikasi Express-nya
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
