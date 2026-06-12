import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-card px-4 py-3 text-ink outline-none transition placeholder:text-ink/30 focus:border-amber dark:border-white/10 dark:bg-nightcard dark:text-white dark:placeholder:text-white/30";

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
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-amber">
              <span className="font-display text-xl font-extrabold text-white">C</span>
            </div>
            <span className="font-display text-2xl font-extrabold text-ink dark:text-white">
              CityEye
            </span>
          </div>
          <div className="num text-xs text-ink/40 dark:text-white/40">
            Вместе сделаем Алматы лучше
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-ink/5 p-1 dark:bg-white/10">
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                tab === t
                  ? "bg-card text-ink shadow-soft dark:bg-white dark:text-ink"
                  : "text-ink/50 hover:text-ink/80 dark:text-white/50 dark:hover:text-white/80"
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
                className={inputCls}
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email" required
              placeholder="you@example.com"
              value={form.email} onChange={set("email")}
              className={inputCls}
            />
          </Field>
          <Field label="Пароль">
            <input
              type="password" required minLength={6}
              placeholder="••••••"
              value={form.password} onChange={set("password")}
              className={inputCls}
            />
          </Field>

          {error && (
            <div className="rounded-xl bg-poor/15 px-4 py-2.5 text-sm text-poor">
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

        {tab === "register" && (
          <p className="text-center text-xs leading-relaxed text-ink/35 dark:text-white/35">
            Аккаунт нужен, чтобы отслеживать статус ваших заявок
            и получать очки за вклад в город.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="num mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink/40 dark:text-white/35">
        {label}
      </span>
      {children}
    </label>
  );
}
