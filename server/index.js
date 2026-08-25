import express from "express";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import transactionRoutes from "./routes/transactions.js";
import importRoutes from "./routes/import.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api", transactionRoutes);
app.use("/api", importRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(express.static(join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../client/dist/index.html"));
});

// For Vercel Serverless Function support
if (process.env.VERCEL) {
  // Don't use app.listen in Vercel
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
