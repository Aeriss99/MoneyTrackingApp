import express from "express";
import multer from "multer";
import dbInterface from "../db/database.js"; // menggunakan InMemory DB

import * as pdfParseModule from "pdf-parse";
const pdfParse = pdfParseModule.default ? pdfParseModule.default : pdfParseModule;

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/import/pdf", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;
    
    // Simple dummy parser for demo
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const parsedTransactions = [];
    
    // Simulate detecting a few transactions
    if (lines.length > 5) {
      parsedTransactions.push({
        date: new Date().toISOString().slice(0,10),
        description: "Transaksi Mutasi 1",
        amount: 50000,
        type: "expense",
        category: "Belanja"
      });
      parsedTransactions.push({
        date: new Date().toISOString().slice(0,10),
        description: "Gaji Masuk",
        amount: 2000000,
        type: "income",
        category: "Gaji"
      });
    }

    res.json({ message: "PDF parsed successfully", transactions: parsedTransactions });
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

router.post("/import/bulk", (req, res) => {
  const { userId, transactions } = req.body;
  if (!userId || !transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    let count = 0;
    for (const tx of transactions) {
      dbInterface.addTransaction(
        userId,
        tx.description || "Imported transaction",
        tx.amount || 0,
        tx.type || "expense",
        tx.category || "Lainnya",
        tx.accountName || "Bank",
        tx.date || new Date().toISOString().slice(0,10),
        tx.note || "Hasil import PDF"
      );
      count++;
    }
    
    res.json({ message: "Bulk import successful", count });
  } catch (error) {
    console.error("Bulk Import Error:", error);
    res.status(500).json({ error: "Failed to import transactions" });
  }
});

export default router;