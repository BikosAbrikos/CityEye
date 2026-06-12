import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth.jsx";

function MapIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M8 3.5L3 5.5v13l5-2 6 2 5-2v-13l-5 2-6-2z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}
      />
      <path d="M8 3.5v13M14 5.5v13" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function ListIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="3.5" y="3.5" width="15" height="15" rx="3.5"
        stroke="currentColor" strokeWidth="1.6"
        fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}
      />
      <path d="M7.5 8.5h7M7.5 11.5h7M7.5 14.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle
        cx="11" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.6"
        fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}
      />
      <path d="M4 19c.8-3.2 3.6-5 7-5s6.2 1.8 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const TABS = [
  { to: "/", label: "Карта", Icon: MapIcon },
  { to: "/dashboard", label: "Заявки", Icon: ListIcon },
  { to: "/profile", label: "Профиль", Icon: UserIcon },
];

function MobileTab({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition ${
          isActive ? "text-amber" : "text-ink/40 dark:text-white/35"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon active={isActive} />
          <span className="text-[10px] font-semibold">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function DesktopTab({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-ink text-white dark:bg-white dark:text-ink"
            : "text-ink/60 hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  // На карте нижняя навигация плавает поверх, на остальных страницах — обычная
  const onMap = location.pathname === "/";

  return (
    <div className="flex h-dvh flex-col bg-canvas dark:bg-night">
      {/* Desktop top nav */}
      <header className="hidden md:flex items-center justify-between border-b border-ink/10 bg-card px-6 py-3 shrink-0 dark:border-white/10 dark:bg-nightcard">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-amber text-white">
            <span className="font-display text-lg font-extrabold">C</span>
          </div>
          <div>
            <div className="font-display text-lg font-extrabold leading-none text-ink dark:text-white">
              CityEye
            </div>
            <div className="num text-[10px] text-ink/40 dark:text-white/40">Алматы · пилот</div>
          </div>
        </div>
        <nav className="flex items-center gap-1 rounded-full bg-canvas p-1 dark:bg-night">
          {TABS.map((t) => (
            <DesktopTab key={t.to} to={t.to} label={t.label} />
          ))}
        </nav>
        <NavLink
          to={user ? "/profile" : "/auth"}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-85 transition dark:bg-white dark:text-ink"
        >
          {user ? (
            <>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-white">
                {user.username?.[0]?.toUpperCase()}
              </span>
              {user.username}
            </>
          ) : (
            "Войти"
          )}
        </NavLink>
      </header>

      {/* Page content */}
      <main className="relative min-h-0 flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className={`flex md:hidden shrink-0 border-t border-ink/10 bg-card dark:border-white/10 dark:bg-nightcard ${
          onMap ? "shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" : ""
        }`}
      >
        {TABS.map((t) => (
          <MobileTab key={t.to} {...t} />
        ))}
      </nav>
    </div>
  );
}
