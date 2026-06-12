import { NavLink, Outlet } from "react-router-dom";

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-ink text-canvas"
            : "text-ink/70 hover:bg-ink/5"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-ink/10 bg-card px-6 py-3 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl2 bg-amber text-card">
            <span className="font-display text-lg font-extrabold">C</span>
          </div>
          <div>
            <div className="font-display text-lg font-extrabold leading-none">
              CityEye
            </div>
            <div className="num text-[11px] text-ink/50">Алматы · пилот</div>
          </div>
        </div>
        <nav className="flex items-center gap-1 rounded-full bg-canvas p-1">
          <Tab to="/">Карта</Tab>
          <Tab to="/report">Сообщить</Tab>
          <Tab to="/admin">Админка</Tab>
        </nav>
      </header>
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
