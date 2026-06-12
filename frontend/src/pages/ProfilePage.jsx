import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useTheme } from "../lib/theme.jsx";

const cardCls =
  "rounded-2xl border border-ink/8 bg-card shadow-soft dark:border-white/10 dark:bg-nightcard dark:shadow-none";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.myReports().then(setReports).catch(() => {});
  }, []);

  const completed = reports.filter((r) => r.status === "completed").length;
  // простая «карма»: заявка = 10 очков, решённая = ещё 20
  const karma = reports.length * 10 + completed * 20;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-lg space-y-4 px-4 pb-8 pt-6">

        {/* Avatar + name */}
        <div className={`${cardCls} flex items-center gap-4 p-5`}>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber font-display text-2xl font-extrabold text-white">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-xl font-extrabold text-ink dark:text-white">
              {user?.username}
            </div>
            <div className="truncate text-sm text-ink/40 dark:text-white/40">{user?.email}</div>
            <div className="num mt-1 inline-flex items-center gap-1 rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-bold text-amber">
              ⭐ {karma} очков
            </div>
          </div>
        </div>

        {/* Contribution */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`${cardCls} p-4`}>
            <div className="num text-2xl font-bold text-ink dark:text-white">{reports.length}</div>
            <div className="mt-0.5 text-xs leading-tight text-ink/50 dark:text-white/50">
              заявок отправлено
            </div>
          </div>
          <div className={`${cardCls} p-4`}>
            <div className="num text-2xl font-bold text-good">{completed}</div>
            <div className="mt-0.5 text-xs leading-tight text-ink/50 dark:text-white/50">
              проблем решено городом
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className={cardCls}>
          <div className="num px-5 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-ink/40 dark:text-white/35">
            Настройки
          </div>

          {/* Theme switcher */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-lg">{theme === "dark" ? "🌙" : "☀️"}</span>
              <span className="text-sm font-semibold text-ink dark:text-white">Тема оформления</span>
            </div>
            <div className="flex gap-1 rounded-xl bg-ink/5 p-1 dark:bg-white/10">
              {[["light", "Светлая"], ["dark", "Тёмная"]].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setTheme(v)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    theme === v
                      ? "bg-card text-ink shadow-soft dark:bg-white/20 dark:text-white"
                      : "text-ink/50 dark:text-white/50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-5 h-px bg-ink/5 dark:bg-white/10" />

          {/* My reports link */}
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-5 py-3.5 transition hover:bg-ink/3 dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📋</span>
              <span className="text-sm font-semibold text-ink dark:text-white">Мои заявки</span>
            </div>
            <span className="text-ink/30 dark:text-white/30">→</span>
          </Link>

          <div className="mx-5 h-px bg-ink/5 dark:bg-white/10" />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-poor/5"
          >
            <span className="text-lg">🚪</span>
            <span className="text-sm font-semibold text-poor">Выйти из аккаунта</span>
          </button>
        </div>

        <div className="num pt-2 text-center text-[10px] text-ink/25 dark:text-white/25">
          CityEye · Алматы · пилотная версия
        </div>
      </div>
    </div>
  );
}
