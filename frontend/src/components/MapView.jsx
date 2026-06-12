import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BUCKET_COLOR, SEVERITY_COLOR } from "../lib/colors.js";
import { ALMATY_CENTER } from "../lib/api.js";
import { useTheme } from "../lib/theme.jsx";

const STYLES = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

// Камера сохраняется между перемонтированиями (смена темы пересоздаёт карту)
const camera = { center: [ALMATY_CENTER[1], ALMATY_CENTER[0]], zoom: 11.4 };

function districtsToGeoJSON(districts) {
  return {
    type: "FeatureCollection",
    features: districts.map((d) => ({
      type: "Feature",
      id: d.id,
      properties: { color: BUCKET_COLOR[d.bucket] },
      geometry: { type: "Polygon", coordinates: d.geometry },
    })),
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

  // refs чтобы обработчики кликов видели свежие коллбэки без переподписки
  const cbRef = useRef({});
  cbRef.current = { onSelectDistrict, onSelectProblem, districts, problems };

  // Инициализация карты — пересоздаём при смене темы
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES[theme] || STYLES.light,
      center: camera.center,
      zoom: camera.zoom,
      attributionControl: { compact: true },
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );
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
        paint: { "fill-color": ["get", "color"], "fill-opacity": 0.14 },
      });
      map.addLayer({
        id: "district-line",
        type: "line",
        source: "districts",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 1.5,
          "line-opacity": 0.7,
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
        if (p) {
          cbRef.current.onSelectProblem?.(p);
          e.preventDefault();
        }
      });
      map.on("click", "district-fill", (e) => {
        if (e.defaultPrevented) return;
        const id = e.features?.[0]?.id;
        const d = cbRef.current.districts.find((x) => x.id === id);
        if (d) cbRef.current.onSelectDistrict?.(d);
      });
      map.on("mouseenter", "problem-dot", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "problem-dot", () => {
        map.getCanvas().style.cursor = "";
      });

      // данные могли прийти раньше, чем загрузился стиль
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
          properties: {
            pid: p.id,
            color: SEVERITY_COLOR[p.severity],
            dups: p.duplicate_count || 0,
          },
          geometry: { type: "Point", coordinates: [p.lng, p.lat] },
        })),
      });
    }

    // бейджи районов — HTML-маркеры
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = districts.map((d) => {
      const el = document.createElement("div");
      el.className = "dlabel";
      el.style.setProperty("--dc", BUCKET_COLOR[d.bucket]);
      el.innerHTML = `
        <div class="dlabel-score">${Math.round(d.index_score)}<span class="dlabel-max">/100</span></div>
        <div class="dlabel-name">${d.name}</div>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        cbRef.current.onSelectDistrict?.(d);
      });
      return new maplibregl.Marker({ element: el })
        .setLngLat([d.centroid_lng, d.centroid_lat])
        .addTo(map);
    });
  }

  // Обновление данных при изменении props
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    syncData(map, { districts, problems });
  }, [districts, problems]);

  // Перелёт к выбранному району
  useEffect(() => {
    const map = mapRef.current;
    if (map && flyTo) {
      map.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: Math.max(map.getZoom(), 12.3),
        duration: 900,
      });
    }
  }, [flyTo]);

  return <div ref={containerRef} className="h-full w-full" />;
}
