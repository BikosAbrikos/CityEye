// Единый источник правды для цветов данных (карта + UI читают отсюда).
// Tailwind-токены в tailwind.config.js зеркалят эти значения.

// Семафор индекса/нагрузки района
export const BUCKET_COLOR = {
  good: "#2F9E73",
  mid: "#E0901A",
  poor: "#DA4A36",
};

// Серьёзность проблемы (тот же семафор, отдельная семантика)
export const SEVERITY_COLOR = {
  low: "#2F9E73",
  medium: "#E0901A",
  high: "#DA4A36",
};

// Брендовый цвет действий — НЕ цвет данных. Держим отдельно от семафора.
export const BRAND = "#F4A024";

export function bucketOf(score) {
  if (score >= 70) return "good";
  if (score >= 40) return "mid";
  return "poor";
}
