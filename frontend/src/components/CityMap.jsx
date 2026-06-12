import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Tooltip,
  Popup,
} from "react-leaflet";
import { BUCKET_COLOR, SEVERITY_COLOR } from "../lib/colors.js";
import { ALMATY_CENTER, TYPE_LABELS, SEVERITY_LABELS } from "../lib/api.js";
import { SeverityBadge } from "./Badges.jsx";

// GeoJSON-кольцо [lng,lat] -> leaflet [lat,lng]
function ringToLatLng(ring) {
  return ring.map(([lng, lat]) => [lat, lng]);
}

export default function CityMap({ districts, problems, onSelectDistrict }) {
  return (
    <MapContainer
      center={ALMATY_CENTER}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {districts.map((d) => {
        const color = BUCKET_COLOR[d.bucket];
        return (
          <Polygon
            key={`d-${d.id}`}
            positions={ringToLatLng(d.geometry[0])}
            pathOptions={{
              color,
              weight: 1.5,
              fillColor: color,
              fillOpacity: 0.32,
            }}
            eventHandlers={{
              click: () => onSelectDistrict && onSelectDistrict(d),
            }}
          >
            <Tooltip direction="center" permanent className="district-label">
              <div className="text-center">
                <div className="text-[11px] font-semibold text-ink">
                  {d.name}
                </div>
                <div
                  className="num text-base font-bold"
                  style={{ color }}
                >
                  {d.index_score.toFixed(0)}
                </div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}

      {problems.map((p) => (
        <CircleMarker
          key={`p-${p.id}`}
          center={[p.lat, p.lng]}
          radius={6 + (p.duplicate_count || 0) * 2}
          pathOptions={{
            color: "#fff",
            weight: 1.5,
            fillColor: SEVERITY_COLOR[p.severity],
            fillOpacity: 0.95,
          }}
        >
          <Popup>
            <div className="space-y-1.5">
              <div className="font-display text-sm font-bold">
                {TYPE_LABELS[p.type] || p.type}
              </div>
              <div className="text-xs text-ink/70">{p.description}</div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={p.severity} />
                {p.duplicate_count > 0 && (
                  <span className="num rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink/60">
                    +{p.duplicate_count} похожих
                  </span>
                )}
              </div>
              {p.photo_url && (
                <img
                  src={p.photo_url}
                  alt=""
                  className="mt-1 h-24 w-full rounded-lg object-cover"
                />
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
