import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BUCKET_COLOR, SEVERITY_COLOR, bucketOf } from "../lib/colors.js";
import { ALMATY_CENTER } from "../lib/api.js";
import { ALMATY_DISTRICTS } from "../lib/almaty-districts.js";
import { useTheme } from "../lib/theme.jsx";

const STYLES = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const camera = { center: [ALMATY_CENTER[1], ALMATY_CENTER[0]], zoom: 11.4 };

// Реальные границы (статика) + цвет/счёт из бэкенда, сшивка по имени района.
function districtsToGeoJSON(backend) {
  const byName = Object.fromEntries(backend.map((d) => [d.name, d]));
  return {
    type: "FeatureCollection",
    features: ALMATY_DISTRICTS.features.map((f) => {
      const d = byName[f.properties.name];
      const color = d ? BUCKET_COLOR[d.bucket || bucketOf(d.index_score)] : "#9aa1ab";
      return {
        type: "Feature",
        properties: { name: f.properties.name, color, did: d?.id ?? null },
        geometry: f.geometry,
      };
    }),
  };
}

export default function MapView({
  districts,
  problems,
  onSelectDistrict,
  onSelectProblem,
  flyTo,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const { theme } = useTheme();

  const cbRef = useRef({});
  cbRef.current = { onSelectDistrict, onSelectProblem, districts, problems };

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES[theme] || STYLES.light,
      center: camera.center,
      zoom: camera.zoom,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("moveend", () => {
      camera.center = map.getCenter().toArray();
      camera.zoom = map.getZoom();
    });

    map.on("load", () => {
      map.addSource("districts", {
        type: "geojson",
        data: districtsToGeoJSON(cbRef.current.districts),
      });
      map.addLayer({
        id: "district-fill",
        type: "fill",
        source: "districts",
        paint: { "fill-color": ["get", "color"], "fill-opacity": 0.13 },
      });
      map.addLayer({
        id: "district-line",
        type: "line",
        source: "districts",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
          "line-opacity": 0.85,
        },
      });

      map.addSource("problems", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "problem-glow",
        type: "circle",
        source: "problems",
        paint: {
          "circle-radius": ["+", 10, ["*", ["get", "dups"], 2]],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.25,
        },
      });
      map.addLayer({
        id: "problem-dot",
        type: "circle",
        source: "problems",
        paint: {
          "circle-radius": ["+", 5, ["*", ["get", "dups"], 1.2]],
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
      });

      map.on("click", "problem-dot", (e) => {
        const id = e.features?.[0]?.properties?.pid;
        const p = cbRef.current.problems.find((x) => x.id === id);
        if (p) { cbRef.current.onSelectProblem?.(p); e.preventDefault(); }
      });
      map.on("click", "district-fill", (e) => {
        if (e.defaultPrevented) return;
        const name = e.features?.[0]?.properties?.name;
        const d = cbRef.current.districts.find((x) => x.name === name);
        if (d) cbRef.current.onSelectDistrict?.(d);
      });
      map.on("mouseenter", "problem-dot", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "problem-dot", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "district-fill", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "district-fill", () => { map.getCanvas().style.cursor = ""; });

      syncData(map, cbRef.current);
    });

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [theme]);

  function syncData(map, { districts, problems }) {
    const dSrc = map.getSource("districts");
    if (dSrc) dSrc.setData(districtsToGeoJSON(districts));

    const pSrc = map.getSource("problems");
    if (pSrc) {
      pSrc.setData({
        type: "FeatureCollection",
        features: problems.map((p) => ({
          type: "Feature",
          properties: { pid: p.id, color: SEVERITY_COLOR[p.severity], dups: p.duplicate_count || 0 },
          geometry: { type: "Point", coordinates: [p.lng, p.lat] },
        })),
      });
    }

    // Бейджи районов — HTML-маркеры. Метка на центроиде из бэкенда (в черте города).
    // ВАЖНО: на корневом el маркера НЕТ transition — иначе позиция от MapLibre
    // анимируется и метка «тянется» за картой. Hover-scale живёт на .dlabel внутри.
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = districts.map((d) => {
      const root = document.createElement("div");
      root.style.cursor = "pointer";
      root.style.willChange = "transform";
      const inner = document.createElement("div");
      inner.className = "dlabel";
      inner.style.setProperty("--dc", BUCKET_COLOR[d.bucket || bucketOf(d.index_score)]);
      inner.innerHTML = `
        <div class="dlabel-score">${Math.round(d.index_score)}<span class="dlabel-max">/100</span></div>
        <div class="dlabel-name">${d.name}</div>`;
      root.appendChild(inner);
      root.addEventListener("click", (e) => {
        e.stopPropagation();
        cbRef.current.onSelectDistrict?.(d);
      });
      return new maplibregl.Marker({ element: root })
        .setLngLat([d.centroid_lng, d.centroid_lat])
        .addTo(map);
    });
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    syncData(map, { districts, problems });
  }, [districts, problems]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && flyTo) {
      map.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: Math.max(map.getZoom(), 12.3),
        duration: 800,
      });
    }
  }, [flyTo]);

  return <div ref={containerRef} className="h-full w-full" />;
}
