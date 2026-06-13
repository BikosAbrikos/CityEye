import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Segmented } from "../components/ui/Segmented.jsx";
import { StarIcon, SunIcon, MoonIcon, ListIcon, LogOutIcon, ChevronRightIcon } from "../lib/icons.jsx";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useTheme } from "../lib/theme.jsx";

const cardCls =
  "rounded-2xl border border-line bg-card shadow-card dark:border-night-line dark:bg-nightcard";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.myReports().then(setReports).catch(() => {});
  }, []);

  const completed = reports.filter((r) => r.status === "completed").length;
  const karma = reports.length * 10 + completed * 20;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-lg space-y-4 px-4 pb-10 pt-6">
        {/* Identity */}
        <div className={`${cardCls} flex items-center gap-4 p-5`}>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand font-display text-2xl font-extrabold text-white">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-xl font-extrabold text-ink dark:text-white">
              {user?.username}
            </div>
            <div className="truncate text-sm text-ink-2 dark:text-night-ink-2">{user?.email}</div>
            <span className="num mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand/[0.12] px-2 py-0.5 text-[11px] font-bold text-brand-ink dark:text-brand">
              <StarIcon size={12} strokeWidth={2.2} /> {karma} очков
            </span>
          </div>
        </div>

        {/* Contribution */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`${cardCls} p-4`}>
            <div className="num text-2xl font-bold text-ink dark:text-white">{reports.length}</div>
            <div className="mt-0.5 text-[13px] leading-tight text-ink-2 dark:text-night-ink-2">
              заявок отправлено
            </div>
          </div>
          <div className={`${cardCls} p-4`}>
            <div className="num text-2xl font-bold text-good">{completed}</div>
            <div className="mt-0.5 text-[13px] leading-tight text-ink-2 dark:text-night-ink-2">
              решено городом
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className={cardCls}>
          <div className="px-5 pb-1 pt-4 text-[13px] font-semibold text-ink-3 dark:text-night-ink-3">
            Настройки
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3 text-ink dark:text-white">
              <span className="text-ink-2 dark:text-night-ink-2">
                {theme === "dark" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
              </span>
              <span className="text-sm font-semibold">Тема оформления</span>
            </div>
            <Segmented
              options={[{ value: "light", label: "Светлая" }, { value: "dark", label: "Тёмная" }]}
              value={theme}
              onChange={setTheme}
            />
          </div>

          <div className="mx-5 h-px bg-line dark:bg-night-line" />

          <Link
            to="/dashboard"
            className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-ink/[0.03] dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-3 text-ink dark:text-white">
              <ListIcon size={20} className="text-ink-2 dark:text-night-ink-2" />
              <span className="text-sm font-semibold">Мои заявки</span>
            </div>
            <ChevronRightIcon size={18} className="text-ink-3 dark:text-night-ink-3" />
          </Link>

          <div className="mx-5 h-px bg-line dark:bg-night-line" />

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-poor/[0.06]"
          >
            <LogOutIcon size={20} className="text-poor" />
            <span className="text-sm font-semibold text-poor">Выйти из аккаунта</span>
          </button>
        </div>

        <div className="num pt-2 text-center text-[11px] text-ink-3 dark:text-night-ink-3">
          CityEye · Алматы · пилотная версия
        </div>
      </div>
    </div>
  );
}
