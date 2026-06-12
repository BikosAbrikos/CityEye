import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

export default function AuthPage() {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = tab === "login"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({ username: form.username, email: form.email, password: form.password });
      login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.message.replace(/^\d+: /, "");
      try { setError(JSON.parse(msg).detail); } catch { setError(msg); }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-ink px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-amber">
              <span className="font-display text-xl font-extrabold text-white">C</span>
            </div>
            <span className="font-display text-2xl font-extrabold text-white">CityEye</span>
          </div>
          <div className="num text-xs text-white/40">Алматы · индекс качества</div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-white/8 p-1">
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                tab === t ? "bg-white text-ink" : "text-white/50 hover:text-white/80"
              }`}
            >
              {t === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          {tab === "register" && (
            <Field label="Имя пользователя">
              <input
                type="text" required minLength={3}
                placeholder="username"
                value={form.username} onChange={set("username")}
                className="w-full rounded-xl bg-white/8 border border-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber"
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email" required
              placeholder="you@example.com"
              value={form.email} onChange={set("email")}
              className="w-full rounded-xl bg-white/8 border border-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber"
            />
          </Field>
          <Field label="Пароль">
            <input
              type="password" required minLength={6}
              placeholder="••••••"
              value={form.password} onChange={set("password")}
              className="w-full rounded-xl bg-white/8 border border-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber"
            />
          </Field>

          {error && (
            <div className="rounded-xl bg-poor/20 px-4 py-2.5 text-sm text-poor">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-2xl bg-amber py-3.5 font-display font-extrabold text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "…" : tab === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="num mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-white/35">
        {label}
      </span>
      {children}
    </label>
  );
}
