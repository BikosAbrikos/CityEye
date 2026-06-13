import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  api, TYPE_LABELS, TYPE_ICONS, SEVERITY_LABELS, STATUS_META,
} from "../lib/api.js";
import { SEVERITY_COLOR } from "../lib/colors.js";
import { useAuth } from "../lib/auth.jsx";

const STATUS_ACTIONS = [
  { status: "in_process", label: "Взять в работу", bg: "#4A90D9" },
  { status: "completed",  label: "Завершить",      bg: "#3FA07E" },
  { status: "rejected",   label: "Отклонить",      bg: "#E1543B" },
];

/* ── Тред сообщений ── */
function Chat({ problem, messages, onSend, sending }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const anonymous = !problem.reporter_email && !problem.user_id;

  async function submit(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    await onSend(body);
    setText("");
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white shadow-soft">
      <div className="border-b border-ink/8 px-4 py-3">
        <div className="font-display font-extrabold text-[#0E1B2C]">Диалог с гражданином</div>
        {problem.reporter_email && (
          <div className="num mt-0.5 text-[11px] text-ink/40">{problem.reporter_email}</div>
        )}
      </div>

      <div className="flex max-h-80 min-h-[8rem] flex-col gap-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="my-auto text-center text-sm text-ink/30">
            Сообщений пока нет. Задайте вопрос гражданину.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender === "akimat";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? "rounded-br-sm bg-[#4A90D9] text-white"
                    : "rounded-bl-sm bg-ink/6 text-ink"
                }`}
              >
                <div className="num mb-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-60">
                  {mine ? "Акимат" : "Гражданин"}
                </div>
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {anonymous ? (
        <div className="border-t border-ink/8 px-4 py-3 text-center text-xs text-ink/35">
          Заявка анонимна — диалог недоступен.
        </div>
      ) : (
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-ink/8 px-3 py-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написать гражданину…"
            className="min-w-0 flex-1 rounded-xl bg-ink/5 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink/30 focus:bg-ink/8"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="shrink-0 rounded-xl bg-[#0E1B2C] px-4 py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-40"
          >
            {sending ? "…" : "Отправить"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ── Детальная страница заявки ── */
function Detail() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [problem, setProblem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [sending, setSending] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([api.getProblem(id), api.getMessages(id)])
      .then(([p, m]) => {
        if (!alive) return;
        setProblem(p);
        setMessages(m);
      })
      .catch(() => alive && setError("Не удалось загрузить заявку."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  async function changeStatus(status) {
    setBusy(status);
    try {
      const updated = await api.updateStatus(problem.id, status);
      setProblem((p) => ({ ...p, status: updated.status }));
    } finally {
      setBusy(null);
    }
  }

  async function onSend(body) {
    setSending(true);
    try {
      const msg = await api.sendMessage(problem.id, body);
      setMessages((ms) => [...ms, msg]);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F2F4F7]">
        <div className="num animate-pulse text-sm text-ink/40">Загрузка…</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#F2F4F7]">
        <div className="text-sm text-ink/50">{error || "Заявка не найдена"}</div>
        <Link to="/akimat" className="rounded-xl bg-[#0E1B2C] px-4 py-2 text-sm font-bold text-white">
          ← К очереди
        </Link>
      </div>
    );
  }

  const meta = STATUS_META[problem.status] || STATUS_META.pending;
  const sevColor = SEVERITY_COLOR[problem.severity];

  return (
    <div className="min-h-dvh bg-[#F2F4F7]">
      {/* Header */}
      <header className="bg-[#0E1B2C] px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/akimat" className="flex items-center gap-2 text-white/80 transition hover:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">←</span>
            <span className="text-sm font-semibold">К очереди заявок</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="num hidden text-xs text-white/50 sm:block">{user.email}</span>
            <button
              onClick={logout}
              className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-6 md:grid-cols-2 md:px-8">
        {/* Левая колонка: фото */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
            {problem.photo_url ? (
              <button
                type="button"
                onClick={() => setLightbox(true)}
                className="block w-full cursor-zoom-in"
                title="Открыть в полном размере"
              >
                <img src={problem.photo_url} alt="" className="max-h-[28rem] w-full object-cover" />
              </button>
            ) : (
              <div className="flex h-64 items-center justify-center text-6xl">
                {TYPE_ICONS[problem.type] || "📌"}
              </div>
            )}
          </div>

          {/* Управление статусом */}
          <div className="rounded-2xl bg-white p-4 shadow-soft">
            <div className="num mb-3 text-[10px] font-semibold uppercase tracking-widest text-ink/40">
              Управление заявкой
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_ACTIONS.filter((a) => a.status !== problem.status).map((a) => (
                <button
                  key={a.status}
                  onClick={() => changeStatus(a.status)}
                  disabled={!!busy}
                  className="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
                  style={{ background: busy === a.status ? "#999" : a.bg }}
                >
                  {busy === a.status ? "…" : a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Правая колонка: инфо + чат */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/5 text-2xl">
                {TYPE_ICONS[problem.type] || "📌"}
              </span>
              <h1 className="font-display text-xl font-extrabold text-[#0E1B2C]">
                {TYPE_LABELS[problem.type] || problem.type}
              </h1>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span
                className="num inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: `${sevColor}18`, color: sevColor }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: sevColor }} />
                {SEVERITY_LABELS[problem.severity]}
              </span>
              <span
                className="num rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: `${meta.color}18`, color: meta.color }}
              >
                {meta.label}
              </span>
              {problem.duplicate_count > 0 && (
                <span className="num rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-semibold text-amber">
                  +{problem.duplicate_count} похожих
                </span>
              )}
            </div>

            <div className="num mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink/40">
              Описание
            </div>
            <p className="mb-4 text-sm leading-relaxed text-ink/70">
              {problem.description || "— без описания —"}
            </p>

            <div className="grid grid-cols-2 gap-3 border-t border-ink/8 pt-3 text-sm">
              <div>
                <div className="num text-[10px] uppercase tracking-wide text-ink/35">Координаты</div>
                <div className="num text-ink/70">
                  {problem.lat.toFixed(4)}, {problem.lng.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="num text-[10px] uppercase tracking-wide text-ink/35">Дата</div>
                <div className="num text-ink/70">
                  {new Date(problem.created_at).toLocaleDateString("ru-RU", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          <Chat problem={problem} messages={messages} onSend={onSend} sending={sending} />
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && problem.photo_url && (
        <div
          onClick={() => setLightbox(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-4"
        >
          <img src={problem.photo_url} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function AkimatProblemPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0E1B2C]">
        <div className="num animate-pulse text-sm text-white/40">Загрузка…</div>
      </div>
    );
  }

  if (!user?.is_admin) return <Navigate to="/akimat" replace />;
  return <Detail />;
}
