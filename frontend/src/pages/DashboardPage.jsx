import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, TYPE_LABELS, TYPE_ICONS, STATUS_META } from "../lib/api.js";

const STEPS = [
  { key: "pending",    label: "Принята" },
  { key: "in_process", label: "В работе" },
  { key: "completed",  label: "Завершена" },
];

function StatusProgress({ status }) {
  if (status === "rejected") {
    return (
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-poor" />
        <span className="num text-xs font-semibold text-poor">Отклонена</span>
      </div>
    );
  }
  const normalized = status === "open" ? "pending" : status;
  const currentStep = STEPS.findIndex((s) => s.key === normalized);

  return (
    <div className="mt-3 flex items-center">
      {STEPS.map((s, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        const color = done
          ? (active && normalized === "completed" ? "#3FA07E" : active ? "#4A90D9" : "#3FA07E")
          : undefined;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  done ? "" : "border-ink/15 dark:border-white/15"
                }`}
                style={done ? { background: color, borderColor: color } : {}}
              >
                {done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`num mt-1 text-[9px] font-semibold ${
                done ? "text-ink/70 dark:text-white/70" : "text-ink/25 dark:text-white/25"
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 mb-4 h-0.5 w-8 transition-all ${
                  i < currentStep ? "bg-good" : "bg-ink/10 dark:bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProblemCard({ p }) {
  const meta = STATUS_META[p.status] || STATUS_META.pending;
  return (
    <div className="space-y-2 rounded-2xl border border-ink/8 bg-card p-4 shadow-soft dark:border-white/10 dark:bg-nightcard dark:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-xl dark:bg-white/10">
            {TYPE_ICONS[p.type] || "📌"}
          </div>
          <div>
            <div className="font-display font-bold text-ink dark:text-white">
              {TYPE_LABELS[p.type] || p.type}
            </div>
            {p.description && (
              <div className="mt-0.5 line-clamp-2 text-sm text-ink/50 dark:text-white/50">
                {p.description}
              </div>
            )}
          </div>
        </div>
        <span
          className="num shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ background: `${meta.color}20`, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>
      <StatusProgress status={p.status} />
      <div className="num pt-1 text-[10px] text-ink/30 dark:text-white/25">
        {new Date(p.created_at).toLocaleDateString("ru-RU", {
          day: "numeric", month: "long", year: "numeric",
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.myReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    pending:    reports.filter((r) => r.status === "pending" || r.status === "open").length,
    in_process: reports.filter((r) => r.status === "in_process").length,
    completed:  reports.filter((r) => r.status === "completed").length,
    rejected:   reports.filter((r) => r.status === "rejected").length,
  };

  const FILTERS = [
    ["all", "Все"],
    ["active", "Активные"],
    ["completed", "Завершённые"],
  ];
  const visible = reports.filter((r) => {
    if (filter === "active") return ["open", "pending", "in_process"].includes(r.status);
    if (filter === "completed") return r.status === "completed";
    return true;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-lg space-y-5 px-4 pb-8 pt-5 md:max-w-2xl">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="num text-[10px] font-semibold uppercase tracking-widest text-ink/40 dark:text-white/35">
              Мои обращения
            </div>
            <h1 className="mt-0.5 font-display text-xl font-extrabold text-ink dark:text-white">
              Заявки
            </h1>
          </div>
          <Link
            to="/report"
            className="rounded-full bg-amber px-4 py-2 text-sm font-bold text-white shadow-fab transition active:scale-95"
          >
            + Новая
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Принято",  value: counts.pending,    color: "#F4A024" },
            { label: "В работе", value: counts.in_process, color: "#4A90D9" },
            { label: "Готово",   value: counts.completed,  color: "#3FA07E" },
            { label: "Откл.",    value: counts.rejected,   color: "#E1543B" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-ink/8 bg-card p-3 text-center shadow-soft dark:border-white/10 dark:bg-nightcard dark:shadow-none"
            >
              <div className="num text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="num mt-0.5 text-[10px] text-ink/40 dark:text-white/40">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-1 rounded-xl bg-ink/5 p-1 dark:bg-white/5">
          {FILTERS.map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                filter === v
                  ? "bg-card text-ink shadow-soft dark:bg-white/15 dark:text-white"
                  : "text-ink/50 dark:text-white/50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="space-y-3">
          {loading && (
            <div className="num animate-pulse py-4 text-center text-sm text-ink/30 dark:text-white/30">
              Загрузка…
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div className="space-y-3 rounded-2xl border border-ink/8 bg-card p-8 text-center shadow-soft dark:border-white/10 dark:bg-nightcard dark:shadow-none">
              <div className="text-3xl">📸</div>
              <div className="text-sm text-ink/40 dark:text-white/40">Заявок пока нет</div>
              <Link
                to="/report"
                className="inline-block rounded-xl bg-amber px-4 py-2 text-sm font-semibold text-white"
              >
                Сообщить о проблеме
              </Link>
            </div>
          )}

          {visible.map((p) => (
            <ProblemCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
