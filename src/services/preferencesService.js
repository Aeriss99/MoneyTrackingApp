import { THEME_STORAGE_KEY } from "../utils/constants.js";

export function loadThemePreference() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function saveThemePreference(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
