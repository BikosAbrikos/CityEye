import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, TYPE_LABELS, STATUS_META } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const STEPS = [
  { key: "pending",    label: "Принята" },
  { key: "in_process", label: "В работе" },
  { key: "completed",  label: "Завершена" },
];

function StatusProgress({ status }) {
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="h-2 w-2 rounded-full bg-poor" />
        <span className="num text-xs text-poor font-semibold">Отклонена</span>
      </div>
    );
  }
  const currentStep = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="mt-3 flex items-center gap-0">
      {STEPS.map((s, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        const color = done
          ? (active && status === "completed" ? "#3FA07E" : active ? "#4A90D9" : "#3FA07E")
          : undefined;
        return (
          <div key={s.key} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all"
                style={done
                  ? { background: color, borderColor: color }
                  : { borderColor: "#ffffff20", background: "transparent" }
                }
              >
                {done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={`num mt-1 text-[9px] font-semibold ${done ? "text-white/70" : "text-white/25"}`}>
                {s.label}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className="mb-4 h-0.5 w-8 mx-1 transition-all"
                style={{ background: i < currentStep ? "#3FA07E" : "#ffffff15" }}
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
    <div className="rounded-2xl bg-white/8 border border-white/10 p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display font-bold text-white">{TYPE_LABELS[p.type] || p.type}</div>
          {p.description && (
            <div className="text-sm text-white/50 mt-0.5 line-clamp-2">{p.description}</div>
          )}
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 num text-[11px] font-bold"
          style={{ background: `${meta.color}20`, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>
      <StatusProgress status={p.status} />
      <div className="num text-[10px] text-white/25 pt-1">
        {new Date(p.created_at).toLocaleDateString("ru-RU", {
          day: "numeric", month: "long", year: "numeric",
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="h-full overflow-y-auto bg-ink">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-5 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="num text-[10px] font-semibold uppercase tracking-widest text-white/35">
              Личный кабинет
            </div>
            <h1 className="font-display text-xl font-extrabold text-white mt-0.5">
              {user?.username}
            </h1>
          </div>
          <button
            onClick={logout}
            className="num text-xs text-white/40 hover:text-white/70 transition pt-1"
          >
            Выйти
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Принято", value: counts.pending,    color: "#F4A024" },
            { label: "В работе", value: counts.in_process, color: "#4A90D9" },
            { label: "Готово",  value: counts.completed,  color: "#3FA07E" },
            { label: "Откл.",   value: counts.rejected,   color: "#E1543B" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/8 p-3 text-center">
              <div className="num text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="num text-[10px] text-white/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Reports list */}
        <div className="space-y-3">
          <div className="num text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Мои заявки ({reports.length})
          </div>

          {loading && (
            <div className="num text-sm text-white/30 animate-pulse py-4 text-center">
              Загрузка…
            </div>
          )}

          {!loading && reports.length === 0 && (
            <div className="rounded-2xl bg-white/5 border border-white/8 p-8 text-center space-y-3">
              <div className="text-3xl">📸</div>
              <div className="text-white/40 text-sm">Заявок пока нет</div>
              <Link
                to="/report"
                className="inline-block rounded-xl bg-amber px-4 py-2 text-sm font-semibold text-white"
              >
                Сообщить о проблеме
              </Link>
            </div>
          )}

          {reports.map((p) => (
            <ProblemCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
