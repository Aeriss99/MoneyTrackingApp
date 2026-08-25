import { Router } from "express";
import db from "../db/database.js";

const router = Router();

const DEFAULT_ACCOUNT = "Cash";
const DEFAULT_CATEGORY = "Other";
const VALID_TYPES = new Set(["income", "expense"]);
const VALID_ACCOUNT_TYPES = new Set(["cash", "bank", "ewallet", "credit_card", "savings", "investment"]);
const VALID_SORTS = new Set(["newest", "oldest", "highest", "lowest"]);

function normalizeText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function normalizeAmount(value) {
  const amount = Number.parseInt(String(value), 10);
  return Number.isInteger(amount) && amount > 0 ? amount : null;
}

function normalizeDate(value) {
  const date = normalizeText(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function normalizeType(value) {
  const type = normalizeText(value).toLowerCase();
  return VALID_TYPES.has(type) ? type : null;
}

function normalizeMonth(value) {
  const month = normalizeText(value);
  return /^\d{4}-\d{2}$/.test(month) ? month : null;
}

function toLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalMonthString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function normalizeUserId(value) {
  const userId = Number.parseInt(String(value), 10);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function normalizeAccountName(value) {
  const accountName = normalizeText(value, DEFAULT_ACCOUNT);
  return accountName || DEFAULT_ACCOUNT;
}

function normalizeCategoryName(value) {
  const category = normalizeText(value, DEFAULT_CATEGORY);
  return category || DEFAULT_CATEGORY;
}

function ensureUser(firebaseUid, email = "", displayName = "", photoUrl = "") {
  let user = db.prepare("SELECT * FROM users WHERE firebase_uid = ?").get(firebaseUid);
  if (!user) {
    const result = db.prepare(
      "INSERT INTO users (firebase_uid, email, display_name, photo_url) VALUES (?, ?, ?, ?)"
    ).run(firebaseUid, email, displayName, photoUrl);
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  }

  const seedProfileTables = db.transaction((userId) => {
    const insertAccount = db.prepare(
      `INSERT OR IGNORE INTO accounts (user_id, name, type) VALUES (?, ?, ?)`
    );
    [
      ["Cash", "cash"],
      ["Bank", "bank"],
      ["E-Wallet", "ewallet"],
      ["Savings", "savings"],
    ].forEach(([name, type]) => insertAccount.run(userId, name, type));

    const insertCategory = db.prepare(
      `INSERT OR IGNORE INTO categories (user_id, name, kind) VALUES (?, ?, ?)`
    );
    [
      ["Salary", "income"],
      ["Bonus", "income"],
      ["Freelance", "income"],
      ["Makan", "expense"],
      ["Transportasi", "expense"],
      ["Tagihan", "expense"],
      ["Belanja", "expense"],
      ["Kesehatan", "expense"],
      ["Pendidikan", "expense"],
      ["Hiburan", "expense"],
      ["Pengeluaran Lain", "expense"],
    ].forEach(([name, kind]) => insertCategory.run(userId, name, kind));
  });

  seedProfileTables(user.id);
  return user;
}

function getTransactionById(id) {
  return db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
}

function requireOwnership(req, res, row) {
  const userId = normalizeUserId(req.body?.userId ?? req.query?.userId);
  if (!row) {
    res.status(404).json({ error: "Transaction not found" });
    return null;
  }
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return null;
  }
  if (Number(row.user_id) !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return userId;
}

function buildTransactionQuery(userId, query = {}) {
  const clauses = ["user_id = ?"];
  const params = [userId];

  const search = normalizeText(query.search).toLowerCase();
  if (search) {
    clauses.push("(LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(note) LIKE ? OR LOWER(account_name) LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  const type = normalizeText(query.type).toLowerCase();
  if (VALID_TYPES.has(type)) {
    clauses.push("type = ?");
    params.push(type);
  }

  const category = normalizeText(query.category);
  if (category && category !== "all") {
    clauses.push("category = ?");
    params.push(category);
  }

  const account = normalizeText(query.account);
  if (account && account !== "all") {
    clauses.push("account_name = ?");
    params.push(account);
  }

  const startDate = normalizeDate(query.startDate);
  if (startDate) {
    clauses.push("date >= ?");
    params.push(startDate);
  }

  const endDate = normalizeDate(query.endDate);
  if (endDate) {
    clauses.push("date <= ?");
    params.push(endDate);
  }

  const minAmount = normalizeAmount(query.minAmount);
  if (minAmount !== null) {
    clauses.push("amount >= ?");
    params.push(minAmount);
  }

  const maxAmount = normalizeAmount(query.maxAmount);
  if (maxAmount !== null) {
    clauses.push("amount <= ?");
    params.push(maxAmount);
  }

  const sort = VALID_SORTS.has(normalizeText(query.sort).toLowerCase())
    ? normalizeText(query.sort).toLowerCase()
    : "newest";

  const orderBy = {
    newest: "date DESC, created_at DESC",
    oldest: "date ASC, created_at ASC",
    highest: "amount DESC, date DESC, created_at DESC",
    lowest: "amount ASC, date ASC, created_at ASC",
  }[sort];

  const limit = Math.min(Math.max(Number.parseInt(String(query.limit || "0"), 10) || 0, 0), 500);
  const sql = `SELECT * FROM transactions WHERE ${clauses.join(" AND ")} ORDER BY ${orderBy}`;
  return { sql, params, limit };
}

router.post("/auth/sync", (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoUrl } = req.body;
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "firebaseUid and email required" });
    }
    const user = ensureUser(firebaseUid, email, displayName, photoUrl);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/transactions/:userId", (req, res) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const { sql, params, limit } = buildTransactionQuery(userId, req.query);
    const rows = limit > 0
      ? db.prepare(`${sql} LIMIT ?`).all(...params, limit)
      : db.prepare(sql).all(...params);

    res.json({ transactions: rows, total: rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/transactions", (req, res) => {
  try {
    const userId = normalizeUserId(req.body.userId);
    const description = normalizeText(req.body.description);
    const amount = normalizeAmount(req.body.amount);
    const type = normalizeType(req.body.type);
    const category = normalizeCategoryName(req.body.category);
    const accountName = normalizeAccountName(req.body.accountName || req.body.account_name);
    const date = normalizeDate(req.body.date);
    const note = normalizeText(req.body.note).slice(0, 180);

    if (!userId || !description || amount === null || !type || !date) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    const result = db.prepare(
      `INSERT INTO transactions (user_id, description, amount, type, category, account_name, date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(userId, description, amount, type, category, accountName, date, note);

    const transaction = getTransactionById(result.lastInsertRowid);
    res.status(201).json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/transactions/:id", (req, res) => {
  try {
    const transaction = getTransactionById(req.params.id);
    const ownerId = requireOwnership(req, res, transaction);
    if (!ownerId) return;

    const description = normalizeText(req.body.description);
    const amount = normalizeAmount(req.body.amount);
    const type = normalizeType(req.body.type);
    const category = normalizeCategoryName(req.body.category);
    const accountName = normalizeAccountName(req.body.accountName || req.body.account_name);
    const date = normalizeDate(req.body.date);
    const note = normalizeText(req.body.note).slice(0, 180);

    if (!description || amount === null || !type || !date) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    db.prepare(
      `UPDATE transactions
       SET description = ?, amount = ?, type = ?, category = ?, account_name = ?, date = ?, note = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
    ).run(description, amount, type, category, accountName, date, note, req.params.id, ownerId);

    const updated = getTransactionById(req.params.id);
    res.json({ transaction: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/transactions/:id", (req, res) => {
  try {
    const transaction = getTransactionById(req.params.id);
    const ownerId = requireOwnership(req, res, transaction);
    if (!ownerId) return;

    db.prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?").run(req.params.id, ownerId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/accounts/:userId", (req, res) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const accounts = db.prepare(
      "SELECT * FROM accounts WHERE user_id = ? ORDER BY is_archived ASC, name ASC"
    ).all(userId);
    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/accounts", (req, res) => {
  try {
    const userId = normalizeUserId(req.body.userId);
    const name = normalizeText(req.body.name);
    const type = normalizeText(req.body.type || "cash").toLowerCase();

    if (!userId || !name || !VALID_ACCOUNT_TYPES.has(type)) {
      return res.status(400).json({ error: "Missing or invalid account data" });
    }

    const result = db.prepare(
      `INSERT INTO accounts (user_id, name, type)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, name) DO UPDATE SET type = excluded.type, is_archived = 0, updated_at = CURRENT_TIMESTAMP`
    ).run(userId, name, type);

    const account = db.prepare("SELECT * FROM accounts WHERE id = ?").get(result.lastInsertRowid || db.prepare("SELECT id FROM accounts WHERE user_id = ? AND name = ?").get(userId, name)?.id);
    res.status(201).json({ account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/accounts/:id", (req, res) => {
  try {
    const account = db.prepare("SELECT * FROM accounts WHERE id = ?").get(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    const userId = normalizeUserId(req.body.userId);
    if (!userId || Number(account.user_id) !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const name = normalizeText(req.body.name);
    const type = normalizeText(req.body.type || account.type).toLowerCase();
    const isArchived = req.body.isArchived ? 1 : 0;

    if (!name || !VALID_ACCOUNT_TYPES.has(type)) {
      return res.status(400).json({ error: "Missing or invalid account data" });
    }

    db.prepare(
      `UPDATE accounts SET name = ?, type = ?, is_archived = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    ).run(name, type, isArchived, req.params.id, userId);

    const updated = db.prepare("SELECT * FROM accounts WHERE id = ?").get(req.params.id);
    res.json({ account: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/accounts/:id", (req, res) => {
  try {
    const account = db.prepare("SELECT * FROM accounts WHERE id = ?").get(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    const userId = normalizeUserId(req.body?.userId ?? req.query?.userId);
    if (!userId || Number(account.user_id) !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    db.prepare("UPDATE accounts SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?").run(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/categories/:userId", (req, res) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const kind = normalizeText(req.query.kind).toLowerCase();
    const clauses = ["user_id = ?"];
    const params = [userId];
    if (VALID_TYPES.has(kind)) {
      clauses.push("kind = ?");
      params.push(kind);
    }

    const categories = db.prepare(
      `SELECT * FROM categories WHERE ${clauses.join(" AND ")} ORDER BY is_archived ASC, name ASC`
    ).all(...params);

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/categories", (req, res) => {
  try {
    const userId = normalizeUserId(req.body.userId);
    const name = normalizeText(req.body.name);
    const kind = normalizeText(req.body.kind).toLowerCase();

    if (!userId || !name || !VALID_TYPES.has(kind)) {
      return res.status(400).json({ error: "Missing or invalid category data" });
    }

    const result = db.prepare(
      `INSERT INTO categories (user_id, name, kind)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, name, kind) DO UPDATE SET is_archived = 0, updated_at = CURRENT_TIMESTAMP`
    ).run(userId, name, kind);

    const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid || db.prepare("SELECT id FROM categories WHERE user_id = ? AND name = ? AND kind = ?").get(userId, name, kind)?.id);
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/categories/:id", (req, res) => {
  try {
    const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const userId = normalizeUserId(req.body.userId);
    if (!userId || Number(category.user_id) !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const name = normalizeText(req.body.name);
    const kind = normalizeText(req.body.kind || category.kind).toLowerCase();
    const isArchived = req.body.isArchived ? 1 : 0;

    if (!name || !VALID_TYPES.has(kind)) {
      return res.status(400).json({ error: "Missing or invalid category data" });
    }

    db.prepare(
      `UPDATE categories SET name = ?, kind = ?, is_archived = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    ).run(name, kind, isArchived, req.params.id, userId);

    const updated = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
    res.json({ category: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/categories/:id", (req, res) => {
  try {
    const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const userId = normalizeUserId(req.body?.userId ?? req.query?.userId);
    if (!userId || Number(category.user_id) !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    db.prepare("UPDATE categories SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?").run(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/budgets/:userId/:month", (req, res) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    const month = normalizeMonth(req.params.month);
    if (!userId || !month) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const rows = db.prepare(
      "SELECT * FROM budgets WHERE user_id = ? AND month = ? ORDER BY category ASC"
    ).all(userId, month);
    res.json({ budgets: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/budgets", (req, res) => {
  try {
    const userId = normalizeUserId(req.body.userId);
    const category = normalizeCategoryName(req.body.category);
    const limitAmount = normalizeAmount(req.body.limitAmount);
    const month = normalizeMonth(req.body.month);

    if (!userId || !category || limitAmount === null || !month) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }

    db.prepare(`
      INSERT INTO budgets (user_id, category, limit_amount, month, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, category, month)
      DO UPDATE SET limit_amount=excluded.limit_amount, updated_at=CURRENT_TIMESTAMP
    `).run(userId, category, limitAmount, month);

    const budget = db.prepare(
      "SELECT * FROM budgets WHERE user_id = ? AND category = ? AND month = ?"
    ).get(userId, category, month);

    res.json({ budget });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/backup/:userId", (req, res) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ?").all(userId);
    const budgets = db.prepare("SELECT * FROM budgets WHERE user_id = ?").all(userId);
    const accounts = db.prepare("SELECT * FROM accounts WHERE user_id = ?").all(userId);
    const categories = db.prepare("SELECT * FROM categories WHERE user_id = ?").all(userId);
    const financialGoals = db.prepare("SELECT * FROM financial_goals WHERE user_id = ?").all(userId);
    const debts = db.prepare("SELECT * FROM debts WHERE user_id = ?").all(userId);
    const debtPayments = db.prepare(
      "SELECT dp.* FROM debt_payments dp INNER JOIN debts d ON d.id = dp.debt_id WHERE d.user_id = ?"
    ).all(userId);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    res.json({
      exportedAt: new Date().toISOString(),
      user: {
        email: user?.email,
        displayName: user?.display_name,
      },
      transactions,
      budgets,
      accounts,
      categories,
      financialGoals,
      debts,
      debtPayments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/backup/restore/:userId", (req, res) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const {
      transactions = [],
      budgets = [],
      accounts = [],
      categories = [],
      financialGoals = [],
      debts = [],
      debtPayments = [],
    } = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: "Invalid backup data structure" });
    }

    const deleteTx = db.prepare("DELETE FROM transactions WHERE user_id = ?");
    const deleteBudgets = db.prepare("DELETE FROM budgets WHERE user_id = ?");
    const deleteAccounts = db.prepare("DELETE FROM accounts WHERE user_id = ?");
    const deleteCategories = db.prepare("DELETE FROM categories WHERE user_id = ?");
    const deleteGoals = db.prepare("DELETE FROM financial_goals WHERE user_id = ?");
    const deleteDebts = db.prepare("DELETE FROM debts WHERE user_id = ?");

    const insertTx = db.prepare(
      `INSERT INTO transactions (user_id, description, amount, type, category, account_name, date, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertBudget = db.prepare(
      `INSERT INTO budgets (user_id, category, limit_amount, month, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const insertAccount = db.prepare(
      `INSERT INTO accounts (user_id, name, type, is_archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const insertCategory = db.prepare(
      `INSERT INTO categories (user_id, name, kind, is_archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const insertGoal = db.prepare(
      `INSERT INTO financial_goals (user_id, name, target_amount, current_amount, deadline, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertDebt = db.prepare(
      `INSERT INTO debts (user_id, name, creditor, principal_amount, remaining_balance, interest_rate, due_date, installment_amount, status, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertDebtPayment = db.prepare(
      `INSERT INTO debt_payments (debt_id, payment_date, amount, note, created_at)
       VALUES (?, ?, ?, ?, ?)`
    );

    const restore = db.transaction(() => {
      deleteTx.run(userId);
      deleteBudgets.run(userId);
      deleteAccounts.run(userId);
      deleteCategories.run(userId);
      deleteGoals.run(userId);
      deleteDebts.run(userId);

      for (const account of accounts) {
        insertAccount.run(
          userId,
          normalizeText(account.name, DEFAULT_ACCOUNT),
          normalizeText(account.type || "cash").toLowerCase(),
          account.is_archived ? 1 : 0,
          account.created_at || new Date().toISOString(),
          account.updated_at || new Date().toISOString()
        );
      }

      for (const category of categories) {
        insertCategory.run(
          userId,
          normalizeText(category.name, DEFAULT_CATEGORY),
          normalizeText(category.kind || "expense").toLowerCase(),
          category.is_archived ? 1 : 0,
          category.created_at || new Date().toISOString(),
          category.updated_at || new Date().toISOString()
        );
      }

      for (const t of transactions) {
        insertTx.run(
          userId,
          normalizeText(t.description),
          normalizeAmount(t.amount) || 0,
          normalizeType(t.type) || "expense",
          normalizeCategoryName(t.category),
          normalizeAccountName(t.account_name || t.accountName),
          normalizeDate(t.date) || new Date().toISOString().slice(0, 10),
          normalizeText(t.note).slice(0, 180),
          t.created_at || new Date().toISOString(),
          t.updated_at || new Date().toISOString()
        );
      }

      for (const budget of budgets) {
        insertBudget.run(
          userId,
          normalizeCategoryName(budget.category),
          normalizeAmount(budget.limit_amount) || 0,
          normalizeMonth(budget.month) || new Date().toISOString().slice(0, 7),
          budget.created_at || new Date().toISOString(),
          budget.updated_at || new Date().toISOString()
        );
      }

      const goalIdMap = new Map();
      for (const goal of financialGoals) {
        const goalResult = insertGoal.run(
          userId,
          normalizeText(goal.name),
          normalizeAmount(goal.target_amount) || 0,
          normalizeAmount(goal.current_amount) || 0,
          goal.deadline ? normalizeDate(goal.deadline) : null,
          normalizeText(goal.description).slice(0, 250),
          normalizeText(goal.status || "active"),
          goal.created_at || new Date().toISOString(),
          goal.updated_at || new Date().toISOString()
        );
        goalIdMap.set(goal.id, goalResult.lastInsertRowid);
      }

      for (const debt of debts) {
        const debtResult = insertDebt.run(
          userId,
          normalizeText(debt.name),
          normalizeText(debt.creditor).slice(0, 120),
          normalizeAmount(debt.principal_amount) || 0,
          normalizeAmount(debt.remaining_balance) || 0,
          Number(debt.interest_rate || 0),
          debt.due_date ? normalizeDate(debt.due_date) : null,
          normalizeAmount(debt.installment_amount) || 0,
          normalizeText(debt.status || "active"),
          normalizeText(debt.description).slice(0, 250),
          debt.created_at || new Date().toISOString(),
          debt.updated_at || new Date().toISOString()
        );

        const relatedPayments = debtPayments.filter((payment) => Number(payment.debt_id) === Number(debt.id));
        for (const payment of relatedPayments) {
          insertDebtPayment.run(
            debtResult.lastInsertRowid,
            normalizeDate(payment.payment_date) || new Date().toISOString().slice(0, 10),
            normalizeAmount(payment.amount) || 0,
            normalizeText(payment.note).slice(0, 180),
            payment.created_at || new Date().toISOString()
          );
        }
      }
    });

    restore();
    res.json({
      success: true,
      transactionsCount: transactions.length,
      budgetsCount: budgets.length,
      accountsCount: accounts.length,
      categoriesCount: categories.length,
      goalsCount: financialGoals.length,
      debtsCount: debts.length,
      debtPaymentsCount: debtPayments.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stats/:userId", (req, res) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const now = new Date();
    const currentMonth = toLocalMonthString(now);
    const today = toLocalDateString(now);

    const totalIncome = db.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'income'"
    ).get(userId).total;

    const totalExpense = db.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'expense'"
    ).get(userId).total;

    const monthlyIncome = db.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'income' AND date LIKE ?"
    ).get(userId, `${currentMonth}%`).total;

    const monthlyExpense = db.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND date LIKE ?"
    ).get(userId, `${currentMonth}%`).total;

    const todayExpense = db.prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND date = ?"
    ).get(userId, today).total;

    const transactionCount = db.prepare(
      "SELECT COUNT(*) as count FROM transactions WHERE user_id = ?"
    ).get(userId).count;

    const categoryBreakdown = db.prepare(
      "SELECT category, SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'expense' GROUP BY category ORDER BY total DESC"
    ).all(userId);

    const monthlyTrend = db.prepare(
      `SELECT substr(date, 1, 7) as month, type, SUM(amount) as total
       FROM transactions
       WHERE user_id = ?
       GROUP BY substr(date, 1, 7), type
       ORDER BY month DESC, type ASC`
    ).all(userId);

    const recentTransactions = db.prepare(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 8"
    ).all(userId);

    const accountBalances = db.prepare(
      `SELECT account_name,
              SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS balance,
              COUNT(*) AS transaction_count
       FROM transactions
       WHERE user_id = ?
       GROUP BY account_name
       ORDER BY balance DESC, account_name ASC`
    ).all(userId);

    const budgetRows = db.prepare(
      "SELECT * FROM budgets WHERE user_id = ? AND month = ?"
    ).all(userId, currentMonth);

    const monthlyExpenseByCategory = db.prepare(
      `SELECT category, SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND type = 'expense' AND date LIKE ?
       GROUP BY category
       ORDER BY total DESC`
    ).all(userId, `${currentMonth}%`);

    res.json({
      balance: totalIncome - totalExpense,
      netCashFlow: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
      todayExpense,
      transactionCount,
      categoryBreakdown,
      monthlyTrend,
      recentTransactions,
      accountBalances,
      monthlyExpenseByCategory,
      budgets: budgetRows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
