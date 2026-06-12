import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "../lib/theme.jsx";

const STYLES = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

/**
 * Выбор точки: карта двигается, пин зафиксирован по центру (как в 2ГИС).
 * position = [lat, lng]
 */
export default function LocationPicker({ position, onPick }) {
  const containerRef = useRef(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const { theme } = useTheme();

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES[theme] || STYLES.light,
      center: [position[1], position[0]],
      zoom: 14.5,
      attributionControl: false,
    });
    map.on("moveend", () => {
      const c = map.getCenter();
      onPickRef.current?.([c.lat, c.lng]);
    });
    return () => map.remove();
    // позиция намеренно не в deps — после маунта карта сама источник правды
  }, [theme]);

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-xl">
      <div ref={containerRef} className="h-full w-full" />
      {/* Центральный пин */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
          <path
            d="M17 1.5C9 1.5 2.5 8 2.5 16c0 10.5 14.5 24.5 14.5 24.5S31.5 26.5 31.5 16C31.5 8 25 1.5 17 1.5z"
            fill="#F4A024" stroke="#fff" strokeWidth="2.5"
          />
          <circle cx="17" cy="15.5" r="5" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}
