const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

export function getToken() {
  return localStorage.getItem("cityeye_token");
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

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
    return fetch(`${BASE}/reports`, {
      method: "POST",
      body: fd,
      headers: authHeaders(),
    }).then(handle);
  },

  myReports: () =>
    fetch(`${BASE}/my-reports`, { headers: authHeaders() }).then(handle),

  updateStatus: (id, status) =>
    fetch(`${BASE}/problems/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status }),
    }).then(handle),

  resolve: (id) =>
    fetch(`${BASE}/problems/${id}/resolve`, {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),

  register: (body) =>
    fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),

  login: (body) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),
};

export const TYPE_LABELS = {
  pothole: "Яма", garbage: "Мусор", streetlight: "Фонарь",
  graffiti: "Граффити", sign: "Знак", other: "Другое",
};

export const SEVERITY_LABELS = { low: "Низкая", medium: "Средняя", high: "Высокая" };

export const STATUS_META = {
  open:       { label: "Принята",    color: "#F4A024", step: 0 },
  pending:    { label: "Принята",    color: "#F4A024", step: 0 },
  in_process: { label: "В работе",   color: "#4A90D9", step: 1 },
  completed:  { label: "Завершена",  color: "#3FA07E", step: 2 },
  rejected:   { label: "Отклонена", color: "#E1543B", step: -1 },
};

export const ALMATY_CENTER = [43.238, 76.889];
