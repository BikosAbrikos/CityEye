const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  districts: () => fetch(`${BASE}/districts`).then(handle),
  problems: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/problems${q ? `?${q}` : ""}`).then(handle);
  },
  stats: () => fetch(`${BASE}/stats`).then(handle),

  analyze: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`${BASE}/analyze`, { method: "POST", body: fd }).then(handle);
  },

  createReport: ({ file, lat, lng, type, severity, description }) => {
    const fd = new FormData();
    if (file) fd.append("file", file);
    fd.append("lat", lat);
    fd.append("lng", lng);
    fd.append("type", type);
    fd.append("severity", severity);
    fd.append("description", description || "");
    return fetch(`${BASE}/reports`, { method: "POST", body: fd }).then(handle);
  },

  resolve: (id) =>
    fetch(`${BASE}/problems/${id}/resolve`, { method: "POST" }).then(handle),
};

export const TYPE_LABELS = {
  pothole: "Яма",
  garbage: "Мусор",
  streetlight: "Фонарь",
  graffiti: "Граффити",
  sign: "Знак",
  other: "Другое",
};

export const SEVERITY_LABELS = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
};

export const ALMATY_CENTER = [43.238, 76.889];
