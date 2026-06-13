// Тянет реальные границы районов Алматы из OSM/Nominatim, упрощает и
// сохраняет в src/lib/almaty-districts.js. Запуск разовый (не на CI):
//   node scripts/fetch-districts.mjs
import { writeFileSync } from "node:fs";

// seed-имя -> поисковый запрос Nominatim
const DISTRICTS = [
  ["Алмалинский", "Алмалинский район, Алматы"],
  ["Бостандыкский", "Бостандыкский район, Алматы"],
  ["Медеуский", "Медеуский район, Алматы"],
  ["Ауэзовский", "Ауэзовский район, Алматы"],
  ["Турксибский", "Турксибский район, Алматы"],
  ["Алатауский", "Алатауский район, Алматы"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r5 = (n) => Math.round(n * 1e5) / 1e5;

// Douglas–Peucker по координатам [lng,lat] (планарное приближение — ок для города)
function simplify(points, tol) {
  if (points.length <= 3) return points;
  const sqTol = tol * tol;
  const d2 = (p, a, b) => {
    let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
    if (dx || dy) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) { x = b[0]; y = b[1]; }
      else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = p[0] - x; dy = p[1] - y;
    return dx * dx + dy * dy;
  };
  const out = [];
  const rec = (first, last) => {
    let maxD = sqTol, idx = -1;
    for (let i = first + 1; i < last; i++) {
      const dd = d2(points[i], points[first], points[last]);
      if (dd > maxD) { idx = i; maxD = dd; }
    }
    if (idx > -1) { rec(first, idx); out.push(points[idx]); rec(idx, last); }
  };
  out.push(points[0]);
  rec(0, points.length - 1);
  out.push(points[points.length - 1]);
  return out.sort((a, b) => points.indexOf(a) - points.indexOf(b));
}

function simplifyRing(ring, tol) {
  const s = simplify(ring, tol).map(([lng, lat]) => [r5(lng), r5(lat)]);
  if (s.length < 4) return ring.map(([lng, lat]) => [r5(lng), r5(lat)]);
  // замкнуть
  const [f, l] = [s[0], s[s.length - 1]];
  if (f[0] !== l[0] || f[1] !== l[1]) s.push(f);
  return s;
}

// Берём только внешнее кольцо самого крупного полигона (городская часть)
function biggestOuter(geojson) {
  const ringArea = (r) => {
    let a = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++)
      a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
    return Math.abs(a / 2);
  };
  if (geojson.type === "Polygon") return geojson.coordinates[0];
  // MultiPolygon -> внешнее кольцо с макс. площадью
  let best = null, bestA = -1;
  for (const poly of geojson.coordinates) {
    const a = ringArea(poly[0]);
    if (a > bestA) { bestA = a; best = poly[0]; }
  }
  return best;
}

async function fetchDistrict(query) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=1&countrycodes=kz&q=" +
    encodeURIComponent(query);
  const res = await fetch(url, { headers: { "User-Agent": "CityEye/1.0 (hackathon demo)" } });
  const arr = await res.json();
  if (!arr.length) throw new Error("no result for " + query);
  return arr[0].geojson;
}

const TOL = 0.0003; // ≈30 м

const features = [];
for (const [name, query] of DISTRICTS) {
  const g = await fetchDistrict(query);
  const outer = biggestOuter(g);
  const ring = simplifyRing(outer, TOL);
  features.push({
    type: "Feature",
    properties: { name },
    geometry: { type: "Polygon", coordinates: [ring] },
  });
  console.error(`${name}: ${g.type} -> ${ring.length} pts`);
  await sleep(1200); // вежливо к Nominatim
}

const fc = { type: "FeatureCollection", features };
const out =
  "// Реальные границы районов Алматы (OSM/Nominatim, ODbL), упрощённые.\n" +
  "// Сгенерировано scripts/fetch-districts.mjs — не редактировать вручную.\n" +
  "export const ALMATY_DISTRICTS = " +
  JSON.stringify(fc) +
  ";\n";
writeFileSync(new URL("../src/lib/almaty-districts.js", import.meta.url), out);
console.error("written src/lib/almaty-districts.js, total pts:",
  features.reduce((s, f) => s + f.geometry.coordinates[0].length, 0));
