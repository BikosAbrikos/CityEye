import { useEffect, useState } from "react";
import { api, TYPE_LABELS } from "../lib/api.js";
import { SEVERITY_COLOR } from "../lib/colors.js";
import { SEVERITY_LABELS } from "../lib/api.js";

const SEV_ORDER = { high: 0, medium: 1, low: 2 };

function SevBadge({ severity }) {
  const color = SEVERITY_COLOR[severity];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{ background: `${color}20`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

export default function AdminPage() {
  const [problems, setProblems] = useState([]);
  const [busy, setBusy] = useState(null);

  function load() {
    api
      .problems({ status: "open" })
      .then((p) =>
        p.sort(
          (a, b) =>
            SEV_ORDER[a.severity] - SEV_ORDER[b.severity] ||
            b.duplicate_count - a.duplicate_count
        )
      )
      .then(setProblems)
      .catch(() => {});
  }

  useEffect(load, []);

  async function resolve(id) {
    setBusy(id);
    try {
      await api.resolve(id);
      setProblems((ps) => ps.filter((p) => p.id !== id));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
        <div>
          <div className="num text-[10px] font-semibold uppercase tracking-widest text-ink/40">
            Управление · Алматы
          </div>
          <h1 className="font-display text-2xl font-extrabold mt-0.5">
            Очередь по приоритету
          </h1>
        </div>

        <div className="space-y-2">
          {problems.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-card px-4 py-3 shadow-soft"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-display font-bold">
                    {TYPE_LABELS[p.type] || p.type}
                  </span>
                  <SevBadge severity={p.severity} />
                  {p.duplicate_count > 0 && (
                    <span className="num rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-semibold text-amber">
                      +{p.duplicate_count}
                    </span>
                  )}
                </div>
                <div className="truncate text-sm text-ink/50">{p.description}</div>
              </div>
              <button
                onClick={() => resolve(p.id)}
                disabled={busy === p.id}
                className="shrink-0 rounded-xl bg-good px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {busy === p.id ? "…" : "Решено"}
              </button>
            </div>
          ))}
          {problems.length === 0 && (
            <div className="rounded-2xl bg-card p-8 text-center text-ink/30 border border-ink/8">
              Открытых проблем нет
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
