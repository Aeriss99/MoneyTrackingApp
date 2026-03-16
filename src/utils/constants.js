export const APP_NAME = "Lingz99 Finance";
export const STORAGE_PREFIX = "lumina-finance";
export const THEME_STORAGE_KEY = `${STORAGE_PREFIX}:theme`;

export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

export const CATEGORIES = [
  { value: "Makan", color: "#f97316" },
  { value: "Transportasi", color: "#0ea5e9" },
  { value: "Belanja", color: "#8b5cf6" },
  { value: "Gaji", color: "#10b981" },
  { value: "Hiburan", color: "#ec4899" },
  { value: "Investasi", color: "#14b8a6" },
];

export const DEFAULT_FILTERS = {
  search: "",
  type: "all",
  category: "all",
  from: "",
  to: "",
};
