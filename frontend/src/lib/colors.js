export const BUCKET_COLOR = {
  good: "#3FA07E",
  mid: "#F4A024",
  poor: "#E1543B",
};

export const SEVERITY_COLOR = {
  low: "#3FA07E",
  medium: "#F4A024",
  high: "#E1543B",
};

export function bucketOf(score) {
  if (score >= 70) return "good";
  if (score >= 40) return "mid";
  return "poor";
}
