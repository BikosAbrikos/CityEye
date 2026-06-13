import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Segmented } from "../components/ui/Segmented.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { LogoMark } from "../components/ui/Logo.jsx";
import {
  LogOutIcon, ChevronRightIcon, InboxIcon, AlertIcon, CheckIcon,
  SparklesIcon, TypeIcon,
} from "../lib/icons.jsx";
import { api, TYPE_LABELS, SEVERITY_LABELS, STATUS_META } from "../lib/api.js";
import { SEVERITY_COLOR } from "../lib/colors.js";
import { useAuth } from "../lib/auth.jsx";

const SEV_ORDER = { high: 0, medium: 1, low: 2 };

const STATUS_ACTIONS = [
  { status: "in_process", label: "В работу", variant: "steel" },
  { status: "completed", label: "Завершить", variant: "good" },
  { status: "rejected", label: "Отклонить", variant: "poor" },
];
const ACTION_BG = { steel: "#3E82CF", good: "#2F9E73", poor: "#DA4A36" };

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

  const fieldCls =
    "w-full rounded-xl border border-navy-line bg-navy-2/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/35 focus:border-steel focus:ring-2 focus:ring-steel/30";

  return (
    <div className="flex h-dvh items-center justify-center overflow-y-auto bg-navy px-4">
      <div className="w-full max-w-sm space-y-7">
        <div className="flex flex-col items-center text-center">
          <LogoMark size={56} />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-white">Кабинет акимата</h1>
          <p className="num mt-1 text-xs text-white/45">CityEye · служебный портал · г. Алматы</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input type="email" required placeholder="Служебный email" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={fieldCls} />
          <input type="password" required placeholder="Пароль" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={fieldCls} />
          {error && (
            <div className="rounded-xl bg-poor/20 px-4 py-2.5 text-sm font-medium text-poor">{error}</div>
          )}
          <Button type="submit" variant="steel" size="lg" fullWidth loading={loading}>
            Войти в кабинет
          </Button>
        </form>

        <p className="text-center text-xs text-white/30">
          Доступ только для уполномоченных сотрудников акимата.
        </p>
      </div>
    </div>
  );
}

function Kpi({ icon, value, label, color }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className="num text-[26px] font-bold leading-none" style={{ color }}>{value}</div>
        <span style={{ color }} className="opacity-80">{icon}</span>
      </div>
      <div className="mt-2 text-[13px] text-ink-2">{label}</div>
    </div>
  );
}

function QueueRow({ p, busy, onAction }) {
  const sevColor = SEVERITY_COLOR[p.severity];
  const meta = STATUS_META[p.status] || STATUS_META.pending;
  return (
    <Link
      to={`/akimat/problem/${p.id}`}
      className="group block rounded-2xl border border-line bg-card p-3.5 shadow-card transition-shadow duration-150 hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3.5">
        {p.photo_url ? (
          <img src={p.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-slate text-ink-2">
            <TypeIcon type={p.type} size={26} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-ink">{TYPE_LABELS[p.type] || p.type}</span>
            <span className="num inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ background: `${sevColor}1A`, color: sevColor }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: sevColor }} />
              {SEVERITY_LABELS[p.severity]}
            </span>
            {p.duplicate_count > 0 && (
              <span className="num rounded-full bg-brand/[0.14] px-2 py-0.5 text-[11px] font-semibold text-brand-ink">
                +{p.duplicate_count} похожих
              </span>
            )}
            <span className="num rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: `${meta.color}1A`, color: meta.color }}>
              {meta.label}
            </span>
          </div>
          {p.description && <div className="mt-1 truncate text-[13px] text-ink-2">{p.description}</div>}
          <div className="num mt-1 text-[11px] text-ink-3">
            {p.lat.toFixed(4)}, {p.lng.toFixed(4)} · {new Date(p.created_at).toLocaleDateString("ru-RU")}
          </div>
        </div>

        <ChevronRightIcon size={18} className="mt-1 shrink-0 text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
        {STATUS_ACTIONS.filter((a) => a.status !== p.status).map((a) => {
          const isBusy = busy === `${p.id}-${a.status}`;
          return (
            <button
              key={a.status}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(p.id, a.status); }}
              disabled={!!busy}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13px] font-bold text-white transition-transform duration-150 ease-out-quart active:scale-95 disabled:opacity-50"
              style={{ background: isBusy ? "#9aa1ab" : ACTION_BG[a.variant] }}
            >
              {isBusy ? <Spinner size={13} /> : a.label}
            </button>
          );
        })}
      </div>
    </Link>
  );
}

/* ── Очередь ── */
function Queue() {
  const { user, logout } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    api.problems()
      .then((all) =>
        setProblems(
          all.sort(
            (a, b) =>
              SEV_ORDER[a.severity] - SEV_ORDER[b.severity] ||
              b.duplicate_count - a.duplicate_count
          )
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    active: problems.filter((p) => ["open", "pending", "in_process"].includes(p.status)).length,
    high: problems.filter((p) => p.severity === "high" && p.status !== "completed" && p.status !== "rejected").length,
    completed: problems.filter((p) => p.status === "completed").length,
    merged: problems.reduce((s, p) => s + (p.duplicate_count || 0), 0),
  }), [problems]);

  const visible =
    filter === "new"
      ? problems.filter((p) => ["open", "pending"].includes(p.status))
      : filter === "active"
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
    <div className="h-dvh overflow-y-auto bg-slate">
      {/* Top bar */}
      <header className="sticky top-0 z-nav bg-navy px-4 py-3.5 md:px-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.875rem)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div className="leading-none">
              <div className="font-display text-base font-extrabold text-white">Кабинет акимата</div>
              <div className="num mt-1 text-[10px] text-white/45">CityEye · г. Алматы</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="num hidden text-xs text-white/55 sm:block">{user.email}</span>
            <button onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-line px-3 py-1.5 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white">
              <LogOutIcon size={15} /> Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-8">
        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi icon={<InboxIcon size={20} />} value={counts.active} label="Активных заявок" color="#0E1B2C" />
          <Kpi icon={<AlertIcon size={20} />} value={counts.high} label="Высокая важность" color="#DA4A36" />
          <Kpi icon={<CheckIcon size={20} />} value={counts.completed} label="Завершено" color="#2F9E73" />
          <Kpi icon={<SparklesIcon size={20} />} value={counts.merged} label="Объединено ИИ" color="#E0901A" />
        </div>

        {/* Filter + list */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold text-ink">Очередь заявок</h2>
          <Segmented
            tone="navy"
            options={[{ value: "new", label: "Новые" }, { value: "active", label: "Активные" }, { value: "all", label: "Все" }]}
            value={filter}
            onChange={setFilter}
          />
        </div>

        {loading ? (
          <div className="py-16 text-center"><Spinner size={24} className="text-navy" /></div>
        ) : (
          <div className="grid gap-2.5 md:grid-cols-2">
            {visible.map((p) => (
              <QueueRow key={p.id} p={p} busy={busy} onAction={changeStatus} />
            ))}
            {visible.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-line bg-card/60 p-12 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate text-ink-3">
                  <InboxIcon size={24} />
                </span>
                <div className="mt-3 text-sm text-ink-2">В этой вкладке заявок нет</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AkimatPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid h-dvh place-items-center bg-navy">
        <Spinner size={26} className="text-white/60" />
      </div>
    );
  }

  if (!user?.is_admin) return <AkimatLogin />;
  return <Queue />;
}
