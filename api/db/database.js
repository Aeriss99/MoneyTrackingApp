// IN-MEMORY MOCK DATABASE FOR VERCEL SERVERLESS ENVIRONMENT
// Menggantikan better-sqlite3 yang crash di Vercel (Read-Only File System)

const db = {
  users: [],
  transactions: [],
  accounts: [
    { id: 1, user_id: 1, name: 'Cash', type: 'cash', is_archived: 0 },
    { id: 2, user_id: 1, name: 'Bank', type: 'bank', is_archived: 0 },
    { id: 3, user_id: 1, name: 'E-Wallet', type: 'e-wallet', is_archived: 0 }
  ],
  categories: [
    { id: 1, user_id: 1, name: 'Makan', kind: 'expense', is_archived: 0 },
    { id: 2, user_id: 1, name: 'Gaji', kind: 'income', is_archived: 0 }
  ],
  budgets: []
};

let txIdCounter = 1;
let userIdCounter = 1;
let budgetIdCounter = 1;

// Simulasi fungsi get() dan all() dari better-sqlite3 agar routes/transactions.js tidak banyak berubah
export const dbInterface = {
  // Authentication Sync
  syncUser: (firebase_uid, email, display_name, photo_url) => {
    let user = db.users.find(u => u.firebase_uid === firebase_uid);
    if (!user) {
      user = { id: userIdCounter++, firebase_uid, email, display_name, photo_url };
      db.users.push(user);
    } else {
      user.email = email;
      user.display_name = display_name;
      user.photo_url = photo_url;
    }
    return user;
  },
  
  // Transactions
  getTransactions: (userId) => {
    return db.transactions
      .filter(t => t.user_id === parseInt(userId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  
  addTransaction: (userId, desc, amount, type, cat, account, date, note) => {
    const tx = {
      id: txIdCounter++,
      user_id: parseInt(userId),
      description: desc,
      amount: parseInt(amount),
      type: type,
      category: cat,
      account_name: account,
      date: date,
      note: note || '',
      created_at: new Date().toISOString()
    };
    db.transactions.unshift(tx); // add to top
    return tx;
  },

  updateTransaction: (id, userId, desc, amount, type, cat, account, date, note) => {
    const idx = db.transactions.findIndex(t => t.id === parseInt(id) && t.user_id === parseInt(userId));
    if (idx === -1) return null;
    
    db.transactions[idx] = {
      ...db.transactions[idx],
      description: desc,
      amount: parseInt(amount),
      type: type,
      category: cat,
      account_name: account,
      date: date,
      note: note || ''
    };
    return db.transactions[idx];
  },

  deleteTransaction: (id, userId) => {
    const initialLen = db.transactions.length;
    db.transactions = db.transactions.filter(t => !(t.id === parseInt(id) && t.user_id === parseInt(userId)));
    return db.transactions.length !== initialLen;
  },

  // Stats
  getStats: (userId) => {
    const userTxs = db.transactions.filter(t => t.user_id === parseInt(userId));
    
    let totalIncome = 0;
    let totalExpense = 0;
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayPrefix = currentMonthPrefix + `-${String(now.getDate()).padStart(2, '0')}`;
    
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let todayExpense = 0;
    
    const catMap = {};
    const accMap = {};
    const trendMap = {};

    userTxs.forEach(tx => {
      // Balance
      if (tx.type === 'income') totalIncome += tx.amount;
      if (tx.type === 'expense') totalExpense += tx.amount;
      
      // Monthly & Today
      if (tx.date.startsWith(currentMonthPrefix)) {
        if (tx.type === 'income') monthlyIncome += tx.amount;
        if (tx.type === 'expense') {
          monthlyExpense += tx.amount;
          catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
        }
      }
      if (tx.date.startsWith(todayPrefix) && tx.type === 'expense') {
        todayExpense += tx.amount;
      }
      
      // Account Breakdown
      const acc = tx.account_name || 'Cash';
      if (!accMap[acc]) accMap[acc] = { account_name: acc, balance: 0, transaction_count: 0 };
      accMap[acc].transaction_count += 1;
      accMap[acc].balance += (tx.type === 'income' ? tx.amount : -tx.amount);
      
      // Trend
      const monthKey = tx.date.substring(0, 7); // YYYY-MM
      const tKey = `${monthKey}_${tx.type}`;
      if (!trendMap[tKey]) trendMap[tKey] = { month: monthKey, type: tx.type, total: 0 };
      trendMap[tKey].total += tx.amount;
    });

    const categoryBreakdown = Object.keys(catMap).map(k => ({ category: k, total: catMap[k] }))
                                   .sort((a,b) => b.total - a.total);
                                   
    return {
      balance: totalIncome - totalExpense,
      monthlyIncome,
      monthlyExpense,
      todayExpense,
      transactionCount: userTxs.length,
      categoryBreakdown,
      accountBalances: Object.values(accMap).sort((a,b) => b.balance - a.balance),
      monthlyTrend: Object.values(trendMap)
    };
  },

  // Budgets
  getBudgets: (userId, month) => {
    return db.budgets.filter(b => b.user_id === parseInt(userId) && b.month === month);
  },

  setBudget: (userId, category, limit, month) => {
    const idx = db.budgets.findIndex(b => b.user_id === parseInt(userId) && b.category === category && b.month === month);
    if (idx !== -1) {
      db.budgets[idx].limit_amount = parseInt(limit);
      return db.budgets[idx];
    } else {
      const newB = { id: budgetIdCounter++, user_id: parseInt(userId), category, limit_amount: parseInt(limit), month };
      db.budgets.push(newB);
      return newB;
    }
  }
};

export default dbInterface;