import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MapView from "../components/MapView.jsx";
import { SeverityBadge, StatusBadge, DupBadge } from "../components/ui/Badge.jsx";
import { BottomSheet } from "../components/ui/BottomSheet.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { CameraIcon, XIcon, TypeIcon, ChevronUpIcon } from "../lib/icons.jsx";
import { useIsDesktop } from "../lib/useMediaQuery.js";
import { api, TYPE_LABELS } from "../lib/api.js";
import { BUCKET_COLOR, bucketOf } from "../lib/colors.js";

const LEGEND = [
  [BUCKET_COLOR.good, "хорошо"],
  [BUCKET_COLOR.mid, "средне"],
  [BUCKET_COLOR.poor, "плохо"],
];

function ProblemCard({ p, onClose }) {
  return (
    <div className="pointer-events-auto animate-scale-in rounded-2xl border border-line bg-card p-4 shadow-card-hover dark:border-night-line dark:bg-nightcard">
      <div className="flex items-start gap-3">
        {p.photo_url ? (
          <img src={p.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-canvas-2 text-ink-2 dark:bg-white/10 dark:text-night-ink-2">
            <TypeIcon type={p.type} size={26} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-bold text-ink dark:text-white">
              {TYPE_LABELS[p.type] || p.type}
            </span>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-ink-3 transition-colors hover:bg-ink/[0.06] hover:text-ink dark:text-night-ink-3 dark:hover:bg-white/10"
            >
              <XIcon size={16} />
            </button>
          </div>
          {p.description && (
            <div className="mt-0.5 line-clamp-2 text-[13px] text-ink-2 dark:text-night-ink-2">
              {p.description}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <SeverityBadge severity={p.severity} />
            <StatusBadge status={p.status} />
            <DupBadge count={p.duplicate_count} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DistrictRow({ d, selected, onClick }) {
  const color = BUCKET_COLOR[d.bucket || bucketOf(d.index_score)];
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
        selected
          ? "bg-brand/[0.1] ring-1 ring-brand/60"
          : "hover:bg-ink/[0.04] dark:hover:bg-white/[0.05]"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-ink dark:text-white">{d.name}</span>
        <span className="num shrink-0 text-sm font-bold" style={{ color }}>
          {Math.round(d.index_score)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.08] dark:bg-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out-expo"
          style={{ width: `${d.index_score}%`, background: color }}
        />
      </div>
    </button>
  );
}

/** Контент панели районов — общий для desktop-сайдбара и мобильного листа. */
function PanelBody({ districts, stats, selected, onSelect }) {
  return (
    <>
      <div className="space-y-1 pt-1">
        {districts.map((d) => (
          <DistrictRow
            key={d.id}
            d={d}
            selected={selected?.id === d.id}
            onClick={() => onSelect(d)}
          />
        ))}
      </div>

      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-canvas-2 p-3.5 dark:bg-white/[0.05]">
            <div className="num text-2xl font-bold text-ink dark:text-white">{stats.total_open}</div>
            <div className="mt-0.5 text-xs leading-tight text-ink-2 dark:text-night-ink-2">
              открытых проблем в городе
            </div>
          </div>
          <div className="rounded-2xl bg-brand/[0.1] p-3.5">
            <div className="num text-2xl font-bold text-brand-ink dark:text-brand">
              {stats.merged_reports}
            </div>
            <div className="mt-0.5 text-xs leading-tight text-ink-2 dark:text-night-ink-2">
              объединено ИИ-дедупом
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PanelHeading() {
  return (
    <div>
      <div className="font-display text-lg font-extrabold leading-tight text-ink dark:text-white">
        Состояние районов
      </div>
      <div className="text-[13px] text-ink-2 dark:text-night-ink-2">
        Индекс качества · 0–100
      </div>
    </div>
  );
}

export default function MapPage() {
  const [districts, setDistricts] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [problem, setProblem] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const ACTIVE = ["open", "pending", "in_process"];
    Promise.all([api.districts(), api.problems(), api.stats()])
      .then(([d, p, s]) => {
        setDistricts(d);
        setProblems(p.filter((x) => ACTIVE.includes(x.status)));
        setStats(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const flyTo = useMemo(
    () => (selected ? { lat: selected.centroid_lat, lng: selected.centroid_lng } : null),
    [selected]
  );

  const sorted = useMemo(
    () => [...districts].sort((a, b) => b.index_score - a.index_score),
    [districts]
  );

  const cityAvg = useMemo(
    () =>
      districts.length
        ? Math.round(districts.reduce((s, d) => s + d.index_score, 0) / districts.length)
        : null,
    [districts]
  );

  function selectDistrict(d) {
    setSelected(d);
    setProblem(null);
    setExpanded(true);
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-map">
        <MapView
          districts={districts}
          problems={problems}
          flyTo={flyTo}
          onSelectDistrict={(d) => { setSelected(d); setProblem(null); }}
          onSelectProblem={(p) => setProblem(p)}
        />
      </div>

      {/* Floating header chip */}
      <div className="pointer-events-none absolute left-3 top-safe z-floating md:left-4 md:top-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-line/80 bg-card/92 py-2 pl-3 pr-4 shadow-card backdrop-blur-md dark:border-night-line/80 dark:bg-nightcard/92">
          {cityAvg != null && (
            <div className="flex flex-col items-center rounded-xl px-2 py-1" style={{ background: `${BUCKET_COLOR[bucketOf(cityAvg)]}1A` }}>
              <span className="num text-xl font-extrabold leading-none" style={{ color: BUCKET_COLOR[bucketOf(cityAvg)] }}>
                {cityAvg}
              </span>
              <span className="num mt-0.5 text-[8px] text-ink-3 dark:text-night-ink-3">/100</span>
            </div>
          )}
          <div>
            <div className="font-display text-[15px] font-extrabold leading-tight text-ink dark:text-white">
              Индекс качества
            </div>
            <div className="text-[11px] text-ink-2 dark:text-night-ink-2">Алматы, в реальном времени</div>
            <div className="mt-1.5 flex gap-2.5">
              {LEGEND.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                  <span className="text-[10px] text-ink-2 dark:text-night-ink-2">{l}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-floating -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/90 px-4 py-2.5 text-sm text-ink-2 shadow-card backdrop-blur-md dark:bg-nightcard/90 dark:text-night-ink-2">
          <span className="flex items-center gap-2">
            <Spinner size={16} className="text-brand" /> Загружаем карту города…
          </span>
        </div>
      )}
      {error && (
        <div className="absolute left-1/2 top-20 z-floating -translate-x-1/2 rounded-xl bg-poor px-4 py-2 text-sm text-white shadow-card">
          {error}
        </div>
      )}

      {/* FAB — Сообщить */}
      <Link
        to="/report"
        className="absolute bottom-[104px] right-4 z-floating flex items-center gap-2 rounded-full bg-brand py-3.5 pl-4 pr-5 font-display font-extrabold text-white shadow-fab transition-transform duration-150 ease-out-quart hover:bg-brand-press active:scale-95 md:bottom-7 md:right-[400px]"
      >
        <CameraIcon size={21} strokeWidth={2} />
        Сообщить
      </Link>

      {/* Problem card */}
      {problem && (
        <div className="pointer-events-none absolute bottom-[104px] left-3 right-3 z-floating md:bottom-7 md:left-4 md:max-w-sm">
          <ProblemCard p={problem} onClose={() => setProblem(null)} />
        </div>
      )}

      {/* Desktop sidebar */}
      {isDesktop ? (
        <aside className="absolute inset-y-0 right-0 z-sheet flex w-[380px] flex-col border-l border-line bg-card dark:border-night-line dark:bg-nightcard">
          <div className="border-b border-line px-5 py-5 dark:border-night-line">
            <PanelHeading />
          </div>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <PanelBody districts={sorted} stats={stats} selected={selected} onSelect={selectDistrict} />
          </div>
        </aside>
      ) : (
        <BottomSheet
          expanded={expanded}
          onExpandedChange={setExpanded}
          handleLabel={
            <div className="flex items-center justify-between">
              <PanelHeading />
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-ink-3 transition-transform duration-300 ease-out-quart dark:text-night-ink-3 ${
                  expanded ? "rotate-180" : ""
                }`}
              >
                <ChevronUpIcon size={18} strokeWidth={2} />
              </span>
            </div>
          }
        >
          <PanelBody districts={sorted} stats={stats} selected={selected} onSelect={selectDistrict} />
        </BottomSheet>
      )}
    </div>
  );
}
