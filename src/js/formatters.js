const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function countDigits(text) {
  return String(text || "").replace(/\D/g, "").length;
}

function findCaretPositionByDigitCount(formattedText, digitCount) {
  if (digitCount <= 0) return formattedText.length;

  let seenDigits = 0;
  for (let index = 0; index < formattedText.length; index += 1) {
    if (/\d/.test(formattedText[index])) {
      seenDigits += 1;
      if (seenDigits === digitCount) {
        return index + 1;
      }
    }
  }

  return formattedText.length;
}

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatDisplayDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return dateFormatter.format(date);
}

export function toDateInputValue(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

export function parseDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function sanitizeAmountDigits(text) {
  return String(text || "").replace(/\D/g, "");
}

export function parseAmount(value) {
  const digits = sanitizeAmountDigits(value);
  return digits ? Number(digits) : 0;
}

export function formatRupiahInputByDigits(digits) {
  if (!digits) return "Rp ";
  return `Rp ${Number(digits).toLocaleString("id-ID")}`;
}

export function normalizeRupiahInputElement(inputElement) {
  const previousValue = inputElement.value;
  const previousCaret = inputElement.selectionStart ?? previousValue.length;
  const digitsBeforeCaret = countDigits(previousValue.slice(0, previousCaret));

  const digits = sanitizeAmountDigits(previousValue);
  const formatted = formatRupiahInputByDigits(digits);
  inputElement.value = formatted;
  inputElement.dataset.raw = digits;

  const nextCaret = findCaretPositionByDigitCount(formatted, digitsBeforeCaret);
  requestAnimationFrame(() => {
    inputElement.setSelectionRange(nextCaret, nextCaret);
  });

  return digits ? Number(digits) : 0;
}

export function handleAmountKeydown(event) {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(event.key)) return;
  if (event.ctrlKey || event.metaKey) return;
  if (/^\d$/.test(event.key)) return;

  event.preventDefault();
}

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function highlightMatch(text, keyword) {
  const safeText = escapeHtml(text);
  const safeKeyword = escapeHtml(keyword).trim();

  if (!safeKeyword) return safeText;

  const pattern = new RegExp(`(${safeKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return safeText.replace(pattern, "<mark>$1</mark>");
}
