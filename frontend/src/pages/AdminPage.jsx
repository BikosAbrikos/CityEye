import { useEffect, useState } from "react";
import { SeverityBadge } from "../components/Badges.jsx";
import { api, TYPE_LABELS } from "../lib/api.js";

const SEV_ORDER = { high: 0, medium: 1, low: 2 };

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
    <div className="mx-auto max-w-3xl space-y-4 overflow-y-auto p-6">
      <h1 className="font-display text-2xl font-extrabold">
        Очередь по приоритету
      </h1>
      <div className="space-y-2">
        {problems.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl2 border border-ink/5 bg-card px-4 py-3 shadow-soft"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold">
                  {TYPE_LABELS[p.type] || p.type}
                </span>
                <SeverityBadge severity={p.severity} />
                {p.duplicate_count > 0 && (
                  <span className="num rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink/60">
                    +{p.duplicate_count}
                  </span>
                )}
              </div>
              <div className="truncate text-sm text-ink/60">
                {p.description}
              </div>
            </div>
            <button
              onClick={() => resolve(p.id)}
              disabled={busy === p.id}
              className="shrink-0 rounded-xl2 bg-good px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy === p.id ? "…" : "Решено"}
            </button>
          </div>
        ))}
        {problems.length === 0 && (
          <div className="rounded-xl2 bg-card p-6 text-center text-ink/40">
            Открытых проблем нет
          </div>
        )}
      </div>
    </div>
  );
}
