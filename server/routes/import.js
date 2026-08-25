import { Router } from "express";
import multer from "multer";
import { createRequire } from "module";
import db from "../db/database.js";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const router = Router();
const DEFAULT_ACCOUNT = "Cash";
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // limit 5MB

// 🧠 Smart Keyword Mapper for Auto-Categorization
const KEYWORD_MAP = [
  // Makan (Food)
  { keywords: ["kfc", "mcd", "starbucks", "kopi", "cafe", "food", "gofood", "grabfood", "shopeefood", "restoran", "warung", "bakso", "mie", "mart", "indomaret", "alfamart"], category: "Makan" },
  // Transportasi (Transport)
  { keywords: ["gojek", "grab", "uber", "maxim", "pertamina", "bensin", "tol", "kereta", "kai", "tiket", "garuda", "citilink", "flight", "shell", "go-ride", "go-car"], category: "Transportasi" },
  // Tagihan (Bills)
  { keywords: ["pln", "listrik", "pdam", "air", "telkom", "wifi", "indihome", "biznet", "bpjs", "asuransi", "pulsa", "kuota", "xl", "telkomsel", "indosat", "pajak"], category: "Tagihan" },
  // Belanja (Shopping)
  { keywords: ["tokopedia", "shopee", "lazada", "bukalapak", "blibli", "mall", "uniqlo", "h&m", "zara", "baju", "sepatu", "celana", "belanja", "fashion"], category: "Belanja" },
  // Kesehatan (Health)
  { keywords: ["halodoc", "apotek", "dokter", "rumah sakit", "klinik", "obat", "bpjs kesehatan", "kimia farma"], category: "Kesehatan" },
  // Pendidikan (Education)
  { keywords: ["spp", "sekolah", "kuliah", "buku", "course", "udemy", "ruangguru", "zenius", "sertifikasi"], category: "Pendidikan" },
  // Hiburan (Entertainment)
  { keywords: ["netflix", "spotify", "youtube premium", "disney", "cinema", "xxi", "cgv", "game", "steam", "playstation", "topup game", "mlbb", "pubg"], category: "Hiburan" },
  // Gaji (Salary - Income)
  { keywords: ["gaji", "salary", "payroll", "paycheck", "upah"], category: "Gaji" },
  // Investasi (Investment - Income/Expense)
  { keywords: ["bibit", "bareksa", "saham", "reksadana", "crypto", "binance", "tokocrypto", "pintu", "emas", "pegadaian"], category: "Investasi" },
  // Hadiah (Gift)
  { keywords: ["hadiah", "gift", "giveaway", "angpao", "thr"], category: "Hadiah" }
];

function autoCategorize(description, type) {
  const descLower = description.toLowerCase();
  for (const group of KEYWORD_MAP) {
    for (const keyword of group.keywords) {
      if (descLower.includes(keyword)) {
        return group.category;
      }
    }
  }
  // Fallback default
  return type === "income" ? "Pemasukan Lain" : "Pengeluaran Lain";
}

function parseBCA(text) {
  const lines = text.split("\n");
  const transactions = [];
  const regex = /^(\d{2}\/\d{2})\s+(.+?)\s+([\d,.]+)\s+(CR|DB)/i;

  for (let line of lines) {
    line = line.trim();
    const match = line.match(regex);
    if (match) {
      const dateStr = match[1]; // DD/MM
      const desc = match[2].trim();
      const amount = Math.round(parseFloat(match[3].replace(/,/g, "")));
      const type = match[4].toUpperCase() === "CR" ? "income" : "expense";
      
      const now = new Date();
      const [dd, mm] = dateStr.split("/");
      const fullDate = `${now.getFullYear()}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
      const category = autoCategorize(desc, type);

      transactions.push({
        description: desc,
        amount,
        type,
        date: fullDate,
        category,
        accountName: DEFAULT_ACCOUNT,
        note: "Imported via BCA PDF (Auto Categorized)"
      });
    }
  }
  return transactions;
}

function parseMandiri(text) {
  const lines = text.split("\n");
  const transactions = [];
  // Mandiri format: DD/MM/YY desc amount CR/DR
  const regex = /^(\d{2}\/\d{2}\/\d{2})\s+(.+?)\s+([\d,.]+)\s+(CR|DR)/i;

  for (let line of lines) {
    line = line.trim();
    const match = line.match(regex);
    if (match) {
      const dateStr = match[1]; // DD/MM/YY
      const desc = match[2].trim();
      const amount = Math.round(parseFloat(match[3].replace(/,/g, "")));
      const type = match[4].toUpperCase() === "CR" ? "income" : "expense";
      
      const [dd, mm, yy] = dateStr.split("/");
      const fullDate = `20${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
      const category = autoCategorize(desc, type);

      transactions.push({
        description: desc,
        amount,
        type,
        date: fullDate,
        category,
        accountName: DEFAULT_ACCOUNT,
        note: "Imported via Mandiri PDF (Auto Categorized)"
      });
    }
  }
  return transactions;
}

function parseGoPay(text) {
  const lines = text.split("\n");
  const transactions = [];
  // GoPay: DD MMM YYYY desc - Rp 50.000 atau Rp 50.000
  const regex = /^(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s+(.+?)\s+(-)?\s*(?:Rp|IDR)?\s*([\d,.]+)/i;
  const months = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };

  for (let line of lines) {
    line = line.trim();
    const match = line.match(regex);
    if (match) {
      const dateStr = match[1]; // DD MMM YYYY
      const desc = match[2].trim();
      const isNegative = !!match[3];
      const amount = Math.round(parseFloat(match[4].replace(/[.,]/g, "")));
      const type = isNegative ? "expense" : "income";

      const parts = dateStr.split(/\s+/);
      const dd = parts[0].padStart(2, "0");
      const mm = months[parts[1].toLowerCase().substring(0,3)] || "01";
      const yyyy = parts[2];
      const fullDate = `${yyyy}-${mm}-${dd}`;
      const category = autoCategorize(desc, type);

      transactions.push({
        description: desc,
        amount,
        type,
        date: fullDate,
        category,
        accountName: DEFAULT_ACCOUNT,
        note: "Imported via GoPay PDF (Auto Categorized)"
      });
    }
  }
  return transactions;
}

router.post("/import/pdf", upload.single("file"), async (req, res) => {
  try {
    const { bank } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dataBuffer = req.file.buffer;
    const parsedPdf = await pdf(dataBuffer);
    const text = parsedPdf.text;

    let parsedTransactions = [];
    if (bank === "bca") {
      parsedTransactions = parseBCA(text);
    } else if (bank === "mandiri") {
      parsedTransactions = parseMandiri(text);
    } else if (bank === "gopay") {
      parsedTransactions = parseGoPay(text);
    } else {
      // Fallback: mix of parsers
      parsedTransactions = [...parseBCA(text), ...parseMandiri(text), ...parseGoPay(text)];
    }

    res.json({
      success: true,
      rawTextLength: text.length,
      bank,
      transactions: parsedTransactions
    });
  } catch (error) {
    console.error("PDF Parsing error:", error);
    res.status(500).json({ error: "Failed to parse PDF statement" });
  }
});

router.post("/import/bulk", (req, res) => {
  try {
    const { userId, transactions } = req.body;
    if (!userId || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const insert = db.prepare(
      `INSERT INTO transactions (user_id, description, amount, type, category, account_name, date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction((txs) => {
      for (const tx of txs) {
        insert.run(
          userId,
          tx.description,
          tx.amount,
          tx.type,
          tx.category,
          tx.accountName || tx.account_name || DEFAULT_ACCOUNT,
          tx.date,
          tx.note || ""
        );
      }
    });

    insertMany(transactions);
    res.json({ success: true, count: transactions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
