import { BUCKET_COLOR } from "../lib/colors.js";

const LEGEND = [
  ["#3FA07E", "хорошо"],
  ["#F4A024", "средне"],
  ["#E1543B", "плохо"],
];

export default function DistrictPanel({ districts, stats, month, selectedId, onSelect }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="num text-[10px] font-semibold uppercase tracking-widest text-ink/40">
          Рейтинг районов · {month}
        </div>
        <div className="font-display text-xl font-extrabold mt-0.5">
          Индекс по районам
        </div>
        <div className="mt-2 flex gap-4">
          {LEGEND.map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: c }} />
              <span className="text-xs text-ink/50">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* District list */}
      <div className="space-y-2">
        {districts.map((d) => {
          const color = BUCKET_COLOR[d.bucket];
          return (
            <button
              key={d.id}
              onClick={() => onSelect?.(d)}
              className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                selectedId === d.id
                  ? "bg-amber/8 ring-1 ring-amber"
                  : "hover:bg-ink/4"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm">{d.name}</span>
                <span
                  className="num text-sm font-bold"
                  style={{ color }}
                >
                  {Math.round(d.index_score)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${d.index_score}%`, background: color }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl bg-ink/5 p-3">
            <div className="num text-xl font-bold">{stats.total_open}</div>
            <div className="mt-0.5 text-xs text-ink/50 leading-tight">
              открытых проблем в городе
            </div>
          </div>
          <div className="rounded-2xl bg-amber/10 p-3">
            <div className="num text-xl font-bold text-amber">
              {stats.merged_reports}
            </div>
            <div className="mt-0.5 text-xs text-ink/50 leading-tight">
              объединено ИИ-дедупом
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
