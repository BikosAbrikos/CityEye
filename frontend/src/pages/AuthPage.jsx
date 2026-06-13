import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Field, Input } from "../components/ui/Field.jsx";
import { Segmented } from "../components/ui/Segmented.jsx";
import { LogoMark } from "../components/ui/Logo.jsx";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

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
        <div className="flex flex-col items-center text-center">
          <LogoMark size={52} />
          <div className="mt-3 font-display text-2xl font-extrabold text-ink dark:text-white">CityEye</div>
          <div className="mt-0.5 text-[13px] text-ink-2 dark:text-night-ink-2">
            Вместе сделаем Алматы лучше
          </div>
        </div>

        <Segmented
          options={[{ value: "login", label: "Войти" }, { value: "register", label: "Регистрация" }]}
          value={tab}
          onChange={(t) => { setTab(t); setError(null); }}
          className="flex w-full"
        />

        <form onSubmit={onSubmit} className="space-y-3.5">
          {tab === "register" && (
            <Field label="Имя пользователя" htmlFor="username">
              <Input id="username" type="text" required minLength={3} placeholder="username"
                value={form.username} onChange={set("username")} />
            </Field>
          )}
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" required placeholder="you@example.com"
              value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Пароль" htmlFor="password">
            <Input id="password" type="password" required minLength={6} placeholder="••••••"
              value={form.password} onChange={set("password")} invalid={!!error} />
          </Field>

          {error && (
            <div className="rounded-xl bg-poor/[0.12] px-4 py-2.5 text-sm font-medium text-poor">{error}</div>
          )}

          <Button type="submit" size="lg" fullWidth loading={loading}>
            {tab === "login" ? "Войти" : "Создать аккаунт"}
          </Button>
        </form>

        {tab === "register" && (
          <p className="text-center text-[13px] leading-relaxed text-ink-3 dark:text-night-ink-3">
            Аккаунт нужен, чтобы отслеживать статус ваших заявок и получать очки за вклад в город.
          </p>
        )}
      </div>
    </div>
  );
}
