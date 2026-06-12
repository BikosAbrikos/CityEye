import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "./lib/auth.jsx";

function DesktopTab({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-semibold transition ${
          isActive ? "bg-ink text-canvas" : "text-ink/60 hover:bg-ink/5"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function MobileTab({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition ${
          isActive ? "text-amber" : "text-ink/40"
        }`
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="text-[10px] font-semibold">{label}</span>
    </NavLink>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="flex h-dvh flex-col">
      {/* Desktop top nav */}
      <header className="hidden md:flex items-center justify-between border-b border-ink/10 bg-card px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-amber text-white">
            <span className="font-display text-lg font-extrabold">C</span>
          </div>
          <div>
            <div className="font-display text-lg font-extrabold leading-none">CityEye</div>
            <div className="num text-[10px] text-ink/40">Алматы · пилот</div>
          </div>
        </div>
        <nav className="flex items-center gap-1 rounded-full bg-canvas p-1">
          <DesktopTab to="/">Карта</DesktopTab>
          <DesktopTab to="/report">Сообщить</DesktopTab>
          {user?.is_admin && <DesktopTab to="/admin">Админка</DesktopTab>}
        </nav>
        {/* Auth button */}
        {user ? (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-ink/80 transition"
          >
            <span className="h-2 w-2 rounded-full bg-amber" />
            {user.username}
          </Link>
        ) : (
          <Link
            to="/auth"
            className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/5 transition"
          >
            Войти
          </Link>
        )}
      </header>

      {/* Page content */}
      <main className="relative min-h-0 flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="flex md:hidden shrink-0 border-t border-ink/10 bg-card">
        <MobileTab to="/" icon="🗺️" label="Карта" />
        <MobileTab to="/report" icon="📸" label="Сообщить" />
        <MobileTab to={user ? "/dashboard" : "/auth"} icon={user ? "👤" : "🔑"} label={user ? "Профиль" : "Войти"} />
        {user?.is_admin && <MobileTab to="/admin" icon="⚙️" label="Админ" />}
      </nav>
    </div>
  );
}
