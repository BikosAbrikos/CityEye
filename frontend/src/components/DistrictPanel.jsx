import { IndexBadge } from "./Badges.jsx";

export default function DistrictPanel({ districts, selectedId, onSelect }) {
  return (
    <div className="space-y-2">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">
        Индекс по районам
      </h2>
      <div className="space-y-2">
        {districts.map((d) => (
          <button
            key={d.id}
            onClick={() => onSelect && onSelect(d)}
            className={`flex w-full items-center justify-between rounded-xl2 border bg-card px-4 py-3 text-left shadow-soft transition hover:border-amber/60 ${
              selectedId === d.id ? "border-amber" : "border-ink/5"
            }`}
          >
            <div>
              <div className="font-semibold">{d.name}</div>
              <div className="num text-xs text-ink/50">
                {d.open_problems} откр. проблем
              </div>
            </div>
            <IndexBadge score={d.index_score} />
          </button>
        ))}
      </div>
    </div>
  );
}
