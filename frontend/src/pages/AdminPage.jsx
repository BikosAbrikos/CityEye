import { useEffect, useState } from "react";
import { api, TYPE_LABELS, STATUS_META } from "../lib/api.js";
import { SEVERITY_COLOR } from "../lib/colors.js";
import { SEVERITY_LABELS } from "../lib/api.js";

const SEV_ORDER = { high: 0, medium: 1, low: 2 };

const STATUS_ACTIONS = [
  { status: "in_process", label: "В работе",  bg: "#4A90D9" },
  { status: "completed",  label: "Завершено", bg: "#3FA07E" },
  { status: "rejected",   label: "Отклонить", bg: "#E1543B" },
];

export default function AdminPage() {
  const [problems, setProblems] = useState([]);
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState("active"); // active | all

  function load() {
    api.problems().then((all) => {
      const sorted = all.sort(
        (a, b) =>
          SEV_ORDER[a.severity] - SEV_ORDER[b.severity] ||
          b.duplicate_count - a.duplicate_count
      );
      setProblems(sorted);
    });
  }

  useEffect(load, []);

  const visible = filter === "active"
    ? problems.filter((p) => ["open", "pending", "in_process"].includes(p.status))
    : problems;

  async function changeStatus(id, status) {
    setBusy(`${id}-${status}`);
    try {
      const updated = await api.updateStatus(id, status);
      setProblems((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="num text-[10px] font-semibold uppercase tracking-widest text-ink/40">
              Управление · Алматы
            </div>
            <h1 className="font-display text-2xl font-extrabold mt-0.5">
              Очередь заявок
            </h1>
          </div>
          {/* Filter toggle */}
          <div className="flex rounded-xl bg-ink/8 p-1 gap-1">
            {[["active", "Активные"], ["all", "Все"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === v ? "bg-ink text-canvas" : "text-ink/50"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {visible.map((p) => {
            const meta = STATUS_META[p.status] || STATUS_META.pending;
            const sevColor = SEVERITY_COLOR[p.severity];
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-ink/8 bg-card p-4 shadow-soft"
              >
                <div className="flex items-start gap-3 flex-wrap">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-display font-bold">
                        {TYPE_LABELS[p.type] || p.type}
                      </span>
                      <span
                        className="num inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                        style={{ background: `${sevColor}18`, color: sevColor }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: sevColor }} />
                        {SEVERITY_LABELS[p.severity]}
                      </span>
                      {p.duplicate_count > 0 && (
                        <span className="num rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-semibold text-amber">
                          +{p.duplicate_count} похожих
                        </span>
                      )}
                      <span
                        className="num rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ background: `${meta.color}18`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-sm text-ink/50 truncate">{p.description}</div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {STATUS_ACTIONS.filter((a) => a.status !== p.status).map((a) => (
                      <button
                        key={a.status}
                        onClick={() => changeStatus(p.id, a.status)}
                        disabled={!!busy}
                        className="rounded-xl px-3 py-1.5 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50"
                        style={{ background: busy === `${p.id}-${a.status}` ? "#999" : a.bg }}
                      >
                        {busy === `${p.id}-${a.status}` ? "…" : a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {visible.length === 0 && (
            <div className="rounded-2xl bg-card p-8 text-center text-ink/30 border border-ink/8">
              Заявок нет
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
