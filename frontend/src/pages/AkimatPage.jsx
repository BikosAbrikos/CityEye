import { useEffect, useMemo, useState } from "react";
import { api, TYPE_LABELS, TYPE_ICONS, SEVERITY_LABELS, STATUS_META } from "../lib/api.js";
import { SEVERITY_COLOR } from "../lib/colors.js";
import { useAuth } from "../lib/auth.jsx";

const SEV_ORDER = { high: 0, medium: 1, low: 2 };

const STATUS_ACTIONS = [
  { status: "in_process", label: "Взять в работу", bg: "#4A90D9" },
  { status: "completed",  label: "Завершить",      bg: "#3FA07E" },
  { status: "rejected",   label: "Отклонить",      bg: "#E1543B" },
];

/* ── Вход для сотрудников ── */
function AkimatLogin() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await api.login(form);
      if (!res.user?.is_admin) {
        setError("У этого аккаунта нет доступа к кабинету акимата.");
        return;
      }
      login(res.token, res.user);
    } catch {
      setError("Неверный email или пароль.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0E1B2C] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
            🏛️
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white">
            Кабинет акимата
          </h1>
          <p className="num mt-1 text-xs text-white/40">
            CityEye · служебный портал · г. Алматы
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email" required placeholder="Служебный email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#4A90D9]"
          />
          <input
            type="password" required placeholder="Пароль"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#4A90D9]"
          />
          {error && (
            <div className="rounded-xl bg-poor/20 px-4 py-2.5 text-sm text-poor">{error}</div>
          )}
          <button
            type="submit" disabled={loading}
            className="w-full rounded-2xl bg-[#4A90D9] py-3.5 font-display font-extrabold text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "…" : "Войти в кабинет"}
          </button>
        </form>

        <p className="text-center text-xs text-white/25">
          Доступ только для уполномоченных сотрудников акимата.
        </p>
      </div>
    </div>
  );
}

/* ── Очередь заявок ── */
function Queue() {
  const { user, logout } = useAuth();
  const [problems, setProblems] = useState([]);
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    api.problems().then((all) =>
      setProblems(
        all.sort(
          (a, b) =>
            SEV_ORDER[a.severity] - SEV_ORDER[b.severity] ||
            b.duplicate_count - a.duplicate_count
        )
      )
    );
  }, []);

  const counts = useMemo(() => ({
    active: problems.filter((p) => ["open", "pending", "in_process"].includes(p.status)).length,
    high: problems.filter((p) => p.severity === "high" && p.status !== "completed" && p.status !== "rejected").length,
    completed: problems.filter((p) => p.status === "completed").length,
    merged: problems.reduce((s, p) => s + (p.duplicate_count || 0), 0),
  }), [problems]);

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
    <div className="min-h-dvh bg-[#F2F4F7]">
      {/* Header */}
      <header className="bg-[#0E1B2C] px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <div className="font-display text-lg font-extrabold leading-none text-white">
                Кабинет акимата
              </div>
              <div className="num mt-0.5 text-[10px] text-white/40">
                CityEye · г. Алматы
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="num hidden text-xs text-white/50 sm:block">{user.email}</span>
            <button
              onClick={logout}
              className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 md:px-8">
        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Активных заявок",  value: counts.active,    color: "#0E1B2C" },
            { label: "Высокая важность", value: counts.high,      color: "#E1543B" },
            { label: "Завершено",        value: counts.completed, color: "#3FA07E" },
            { label: "Объединено ИИ",    value: counts.merged,    color: "#F4A024" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-4 shadow-soft">
              <div className="num text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="mt-0.5 text-xs text-ink/50">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter + list */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">Очередь заявок</h2>
          <div className="flex gap-1 rounded-xl bg-ink/8 p-1">
            {[["active", "Активные"], ["all", "Все"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === v ? "bg-[#0E1B2C] text-white" : "text-ink/50"
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
              <div key={p.id} className="rounded-2xl bg-white p-4 shadow-soft">
                <div className="flex flex-wrap items-start gap-3">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-2xl">
                      {TYPE_ICONS[p.type] || "📌"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold">{TYPE_LABELS[p.type] || p.type}</span>
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
                    <div className="truncate text-sm text-ink/50">{p.description}</div>
                    <div className="num mt-1 text-[10px] text-ink/30">
                      {p.lat.toFixed(4)}, {p.lng.toFixed(4)} ·{" "}
                      {new Date(p.created_at).toLocaleDateString("ru-RU")}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
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
            <div className="rounded-2xl bg-white p-8 text-center text-ink/30 shadow-soft">
              Заявок нет
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AkimatPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0E1B2C]">
        <div className="num animate-pulse text-sm text-white/40">Загрузка…</div>
      </div>
    );
  }

  if (!user?.is_admin) return <AkimatLogin />;
  return <Queue />;
}
