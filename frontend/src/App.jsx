import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth.jsx";
import { MapIcon, ListIcon, UserIcon } from "./lib/icons.jsx";
import { Logo } from "./components/ui/Logo.jsx";

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
        `group relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors duration-200 ${
          isActive ? "text-brand" : "text-ink-3 dark:text-night-ink-3"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute top-0 h-[3px] w-8 rounded-full bg-brand transition-all duration-300 ease-out-quart ${
              isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`}
          />
          <span className="transition-transform duration-200 ease-out-quart group-active:scale-90">
            <Icon size={23} strokeWidth={isActive ? 2.1 : 1.75} />
          </span>
          <span className="text-[10px] font-semibold tracking-tight">{label}</span>
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
        `rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
          isActive
            ? "bg-ink text-white dark:bg-white dark:text-ink"
            : "text-ink-2 hover:bg-ink/[0.06] dark:text-night-ink-2 dark:hover:bg-white/10"
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
  const onMap = location.pathname === "/";

  return (
    <div className="flex h-dvh flex-col bg-canvas dark:bg-night">
      {/* Desktop top nav */}
      <header className="z-nav hidden shrink-0 items-center justify-between border-b border-line bg-card/90 px-6 py-3 backdrop-blur-md md:flex dark:border-night-line dark:bg-nightcard/90">
        <Logo />
        <nav className="flex items-center gap-1 rounded-full bg-canvas p-1 dark:bg-night-2">
          {TABS.map((t) => (
            <DesktopTab key={t.to} to={t.to} label={t.label} />
          ))}
        </nav>
        <NavLink
          to={user ? "/profile" : "/auth"}
          className="flex items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-4 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-canvas-2 dark:border-night-line dark:bg-nightcard dark:text-white dark:hover:bg-night-2"
        >
          {user ? (
            <>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                {user.username?.[0]?.toUpperCase()}
              </span>
              {user.username}
            </>
          ) : (
            <span className="px-2">Войти</span>
          )}
        </NavLink>
      </header>

      {/* Page content */}
      <main className="relative min-h-0 flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className={`z-nav flex shrink-0 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden dark:border-night-line dark:bg-nightcard/95 ${
          onMap ? "shadow-[0_-6px_24px_-8px_rgba(21,24,28,0.18)]" : ""
        }`}
      >
        {TABS.map((t) => (
          <MobileTab key={t.to} {...t} />
        ))}
      </nav>
    </div>
  );
}
