/**
 * Format "2025-01-15" → "Wed, 15 Jan 2025"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Get today's date as "YYYY-MM-DD"
 */
export const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Get next N days as array of "YYYY-MM-DD" strings
 * Used for date picker in scheduler
 */
export const getNextNDays = (n = 14) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};

/**
 * Format "09:15" → "9:15 AM"
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

/**
 * Get day name from "YYYY-MM-DD"
 * "2025-01-15" → "Wednesday"
 */
export const getDayName = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
  });
};
