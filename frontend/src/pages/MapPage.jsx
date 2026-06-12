import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MapView from "../components/MapView.jsx";
import { SeverityBadge } from "../components/Badges.jsx";
import { api, TYPE_LABELS, TYPE_ICONS, STATUS_META } from "../lib/api.js";
import { BUCKET_COLOR } from "../lib/colors.js";

const LEGEND = [
  ["#3FA07E", "хорошо"],
  ["#F4A024", "средне"],
  ["#E1543B", "плохо"],
];

function ProblemCard({ p, onClose }) {
  const meta = STATUS_META[p.status] || STATUS_META.pending;
  return (
    <div className="pointer-events-auto rounded-2xl bg-card p-4 shadow-soft dark:bg-nightcard">
      <div className="flex items-start gap-3">
        {p.photo_url ? (
          <img
            src={p.photo_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-2xl dark:bg-white/10">
            {TYPE_ICONS[p.type] || "📌"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-bold text-ink dark:text-white">
              {TYPE_LABELS[p.type] || p.type}
            </span>
            <button
              onClick={onClose}
              className="text-ink/30 hover:text-ink/60 dark:text-white/30 dark:hover:text-white/60"
            >
              ✕
            </button>
          </div>
          {p.description && (
            <div className="mt-0.5 line-clamp-2 text-xs text-ink/50 dark:text-white/50">
              {p.description}
            </div>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <SeverityBadge severity={p.severity} />
            <span
              className="num rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: `${meta.color}1A`, color: meta.color }}
            >
              {meta.label}
            </span>
            {p.duplicate_count > 0 && (
              <span className="num rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink/50 dark:bg-white/10 dark:text-white/50">
                +{p.duplicate_count} похожих
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DistrictRow({ d, selected, onClick }) {
  const color = BUCKET_COLOR[d.bucket];
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
        selected
          ? "bg-amber/10 ring-1 ring-amber"
          : "hover:bg-ink/5 dark:hover:bg-white/5"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink dark:text-white">{d.name}</span>
        <span className="num text-sm font-bold" style={{ color }}>
          {Math.round(d.index_score)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${d.index_score}%`, background: color }}
        />
      </div>
    </button>
  );
}

export default function MapPage() {
  const [districts, setDistricts] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [problem, setProblem] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.districts(), api.problems({ status: "open" }), api.stats()])
      .then(([d, p, s]) => { setDistricts(d); setProblems(p); setStats(s); })
      .catch((e) => setError(e.message));
  }, []);

  const flyTo = useMemo(
    () => (selected ? { lat: selected.centroid_lat, lng: selected.centroid_lng } : null),
    [selected]
  );

  const sorted = useMemo(
    () => [...districts].sort((a, b) => b.index_score - a.index_score),
    [districts]
  );

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">
        <MapView
          districts={districts}
          problems={problems}
          flyTo={flyTo}
          onSelectDistrict={(d) => { setSelected(d); setProblem(null); }}
          onSelectProblem={(p) => { setProblem(p); }}
        />
      </div>

      {/* Floating header chip */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 md:left-4 md:top-4">
        <div className="pointer-events-auto rounded-2xl bg-card/95 px-4 py-2.5 shadow-soft backdrop-blur-sm dark:bg-nightcard/95">
          <div className="num text-[10px] font-semibold uppercase tracking-widest text-ink/40 dark:text-white/40">
            Алматы
          </div>
          <div className="font-display text-base font-extrabold leading-tight text-ink dark:text-white">
            Индекс качества
          </div>
          <div className="mt-1.5 flex gap-3">
            {LEGEND.map(([c, l]) => (
              <div key={l} className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                <span className="text-[10px] text-ink/50 dark:text-white/50">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-xl bg-poor px-4 py-2 text-sm text-white shadow-soft">
          {error}
        </div>
      )}

      {/* FAB — Сообщить о проблеме */}
      <Link
        to="/report"
        className="absolute bottom-[88px] right-4 z-20 flex items-center gap-2 rounded-full bg-amber px-5 py-3.5 font-display font-extrabold text-white shadow-fab transition active:scale-95 md:bottom-8 md:right-[380px]"
      >
        <span className="text-xl leading-none">📸</span>
        Сообщить
      </Link>

      {/* Problem card (tap on pin) */}
      {problem && (
        <div className="pointer-events-none absolute bottom-[88px] left-3 right-3 z-20 md:bottom-8 md:left-4 md:max-w-sm">
          <ProblemCard p={problem} onClose={() => setProblem(null)} />
        </div>
      )}

      {/* Bottom sheet (mobile) / sidebar (desktop) */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 flex flex-col rounded-t-3xl bg-card sheet-shadow transition-[max-height] duration-300 dark:bg-nightcard ${
          expanded ? "max-h-[62vh]" : "max-h-[72px]"
        } md:bottom-0 md:left-auto md:right-0 md:top-0 md:w-[340px] md:max-h-none md:rounded-none md:border-l md:border-ink/10 md:shadow-none md:dark:border-white/10`}
      >
        {/* Header — toggles expansion on mobile */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 px-4 pb-2 pt-2.5 text-left md:cursor-default md:pt-5"
        >
          <div className="mb-2 flex justify-center md:hidden">
            <div className="h-1 w-10 rounded-full bg-ink/15 dark:bg-white/15" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="num text-[10px] font-semibold uppercase tracking-widest text-ink/40 dark:text-white/40">
                Рейтинг районов
              </div>
              <div className="font-display text-lg font-extrabold text-ink dark:text-white">
                Индекс по районам
              </div>
            </div>
            <span className={`text-ink/30 transition md:hidden dark:text-white/30 ${expanded ? "rotate-180" : ""}`}>
              ▲
            </span>
          </div>
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-1.5 pt-1">
            {sorted.map((d) => (
              <DistrictRow
                key={d.id}
                d={d}
                selected={selected?.id === d.id}
                onClick={() => { setSelected(d); setExpanded(true); }}
              />
            ))}
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="rounded-2xl bg-ink/5 p-3 dark:bg-white/5">
                <div className="num text-xl font-bold text-ink dark:text-white">{stats.total_open}</div>
                <div className="mt-0.5 text-xs leading-tight text-ink/50 dark:text-white/50">
                  открытых проблем в городе
                </div>
              </div>
              <div className="rounded-2xl bg-amber/10 p-3">
                <div className="num text-xl font-bold text-amber">{stats.merged_reports}</div>
                <div className="mt-0.5 text-xs leading-tight text-ink/50 dark:text-white/50">
                  объединено ИИ-дедупом
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
