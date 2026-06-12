import { useMemo } from "react";
import {
  MapContainer, TileLayer, Polygon, CircleMarker, Popup, Marker,
} from "react-leaflet";
import L from "leaflet";
import { BUCKET_COLOR, SEVERITY_COLOR } from "../lib/colors.js";
import { ALMATY_CENTER, TYPE_LABELS } from "../lib/api.js";
import { SeverityBadge } from "./Badges.jsx";

function ringToLatLng(ring) {
  return ring.map(([lng, lat]) => [lat, lng]);
}

function makeDistrictIcon(d) {
  const color = BUCKET_COLOR[d.bucket];
  return L.divIcon({
    className: "district-label-icon",
    html: `<div class="dlabel" style="--dc:${color}">
      <div class="dlabel-score">${Math.round(d.index_score)}<span class="dlabel-max">/100</span></div>
      <div class="dlabel-name">${d.name}</div>
    </div>`,
    iconSize: [88, 36],
    iconAnchor: [44, 18],
  });
}

export default function CityMap({ districts, problems, onSelectDistrict }) {
  const icons = useMemo(() => {
    const m = {};
    districts.forEach((d) => { m[d.id] = makeDistrictIcon(d); });
    return m;
  }, [districts]);

  return (
    <MapContainer
      center={ALMATY_CENTER}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom
      zoomControl={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* District polygons */}
      {districts.map((d) => (
        <Polygon
          key={`poly-${d.id}`}
          positions={ringToLatLng(d.geometry[0])}
          pathOptions={{
            color: BUCKET_COLOR[d.bucket],
            weight: 1.5,
            fillColor: BUCKET_COLOR[d.bucket],
            fillOpacity: 0.2,
          }}
          eventHandlers={{ click: () => onSelectDistrict?.(d) }}
        />
      ))}

      {/* District centroid labels */}
      {districts.map((d) => (
        <Marker
          key={`lbl-${d.id}`}
          position={[d.centroid_lat, d.centroid_lng]}
          icon={icons[d.id] || L.divIcon({ className: "" })}
          eventHandlers={{ click: () => onSelectDistrict?.(d) }}
        />
      ))}

      {/* Problem pins */}
      {problems.map((p) => (
        <CircleMarker
          key={`p-${p.id}`}
          center={[p.lat, p.lng]}
          radius={5 + (p.duplicate_count || 0) * 1.5}
          pathOptions={{
            color: "#fff",
            weight: 1.5,
            fillColor: SEVERITY_COLOR[p.severity],
            fillOpacity: 0.95,
          }}
        >
          <Popup>
            <div className="min-w-[160px] space-y-1.5">
              <div className="font-display text-sm font-bold">
                {TYPE_LABELS[p.type] || p.type}
              </div>
              <div className="text-xs text-ink/70">{p.description}</div>
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity={p.severity} />
                {p.duplicate_count > 0 && (
                  <span className="num rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink/50">
                    +{p.duplicate_count} похожих
                  </span>
                )}
              </div>
              {p.photo_url && (
                <img src={p.photo_url} alt="" className="mt-1 h-20 w-full rounded-lg object-cover" />
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
