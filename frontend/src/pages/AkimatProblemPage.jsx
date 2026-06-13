import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import {
  ArrowLeftIcon, LogOutIcon, XIcon, SendIcon, ZoomIcon, TypeIcon,
} from "../lib/icons.jsx";
import { api, TYPE_LABELS, SEVERITY_LABELS, STATUS_META } from "../lib/api.js";
import { SEVERITY_COLOR } from "../lib/colors.js";
import { useAuth } from "../lib/auth.jsx";

const STATUS_ACTIONS = [
  { status: "in_process", label: "Взять в работу", bg: "#3E82CF" },
  { status: "completed", label: "Завершить", bg: "#2F9E73" },
  { status: "rejected", label: "Отклонить", bg: "#DA4A36" },
];

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
    <div className="flex flex-col rounded-2xl border border-line bg-card shadow-card">
      <div className="border-b border-line px-4 py-3">
        <div className="font-display font-extrabold text-navy">Диалог с гражданином</div>
        {problem.reporter_email && (
          <div className="num mt-0.5 text-[11px] text-ink-3">{problem.reporter_email}</div>
        )}
      </div>

      <div className="thin-scroll flex max-h-80 min-h-[8rem] flex-col gap-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="my-auto text-center text-sm text-ink-3">
            Сообщений пока нет. Задайте вопрос гражданину.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender === "akimat";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                mine ? "rounded-br-sm bg-steel text-white" : "rounded-bl-sm bg-slate text-ink"
              }`}>
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
        <div className="border-t border-line px-4 py-3 text-center text-xs text-ink-3">
          Заявка анонимна — диалог недоступен.
        </div>
      ) : (
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-line px-3 py-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написать гражданину…"
            className="min-w-0 flex-1 rounded-xl bg-slate px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:ring-2 focus:ring-steel/30"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label="Отправить"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-white transition-transform duration-150 ease-out-quart active:scale-95 disabled:opacity-40"
          >
            {sending ? <Spinner size={15} /> : <SendIcon size={18} strokeWidth={2} />}
          </button>
        </form>
      )}
    </div>
  );
}

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
      .then(([p, m]) => { if (!alive) return; setProblem(p); setMessages(m); })
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
    return <div className="grid h-dvh place-items-center bg-slate"><Spinner size={24} className="text-navy" /></div>;
  }

  if (error || !problem) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 overflow-y-auto bg-slate">
        <div className="text-sm text-ink-2">{error || "Заявка не найдена"}</div>
        <Button to="/akimat" variant="navy" leftIcon={<ArrowLeftIcon size={18} />}>К очереди</Button>
      </div>
    );
  }

  const meta = STATUS_META[problem.status] || STATUS_META.pending;
  const sevColor = SEVERITY_COLOR[problem.severity];

  return (
    <div className="h-dvh overflow-y-auto bg-slate">
      <header className="bg-navy px-4 py-3.5 md:px-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.875rem)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/akimat" className="flex items-center gap-2 text-white/80 transition-colors hover:text-white">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10"><ArrowLeftIcon size={17} /></span>
            <span className="text-sm font-semibold">К очереди заявок</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="num hidden text-xs text-white/55 sm:block">{user.email}</span>
            <button onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-line px-3 py-1.5 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white">
              <LogOutIcon size={15} /> Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-6 md:grid-cols-2 md:px-8">
        {/* Left: photo + controls */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
            {problem.photo_url ? (
              <button type="button" onClick={() => setLightbox(true)}
                className="group relative block w-full cursor-zoom-in" title="Открыть в полном размере">
                <img src={problem.photo_url} alt="" className="max-h-[28rem] w-full object-cover" />
                <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                  <ZoomIcon size={18} />
                </span>
              </button>
            ) : (
              <div className="grid h-64 place-items-center text-ink-3"><TypeIcon type={problem.type} size={64} /></div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
            <div className="mb-3 text-[13px] font-semibold text-ink-3">Управление заявкой</div>
            <div className="flex flex-wrap gap-2">
              {STATUS_ACTIONS.filter((a) => a.status !== problem.status).map((a) => (
                <button key={a.status} onClick={() => changeStatus(a.status)} disabled={!!busy}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold text-white transition-transform duration-150 ease-out-quart active:scale-95 disabled:opacity-50"
                  style={{ background: busy === a.status ? "#9aa1ab" : a.bg }}>
                  {busy === a.status ? <Spinner size={15} /> : a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: info + chat */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate text-ink-2">
                <TypeIcon type={problem.type} size={24} />
              </span>
              <h1 className="font-display text-xl font-extrabold text-navy">
                {TYPE_LABELS[problem.type] || problem.type}
              </h1>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="num inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: `${sevColor}1A`, color: sevColor }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: sevColor }} />
                {SEVERITY_LABELS[problem.severity]}
              </span>
              <span className="num rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: `${meta.color}1A`, color: meta.color }}>
                {meta.label}
              </span>
              {problem.duplicate_count > 0 && (
                <span className="num rounded-full bg-brand/[0.14] px-2.5 py-1 text-[11px] font-semibold text-brand-ink">
                  +{problem.duplicate_count} похожих
                </span>
              )}
            </div>

            <div className="mb-1 text-[13px] font-semibold text-ink-3">Описание</div>
            <p className="mb-4 text-sm leading-relaxed text-ink-2">
              {problem.description || "— без описания —"}
            </p>

            <div className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
              <div>
                <div className="num text-[11px] text-ink-3">Координаты</div>
                <div className="num text-ink-2">{problem.lat.toFixed(4)}, {problem.lng.toFixed(4)}</div>
              </div>
              <div>
                <div className="num text-[11px] text-ink-3">Дата</div>
                <div className="num text-ink-2">
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
        <div onClick={() => setLightbox(false)}
          className="fixed inset-0 z-modal grid cursor-zoom-out place-items-center bg-black/85 p-4 animate-fade-in">
          <img src={problem.photo_url} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
          <button onClick={() => setLightbox(false)} aria-label="Закрыть"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25">
            <XIcon size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AkimatProblemPage() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="grid h-dvh place-items-center bg-navy"><Spinner size={26} className="text-white/60" /></div>;
  }
  if (!user?.is_admin) return <Navigate to="/akimat" replace />;
  return <Detail />;
}
