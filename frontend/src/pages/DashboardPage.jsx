import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { StatusBadge } from "../components/ui/Badge.jsx";
import { Segmented } from "../components/ui/Segmented.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import {
  PlusIcon, CameraIcon, MessageIcon, SendIcon, CheckIcon, TypeIcon,
} from "../lib/icons.jsx";
import { api, TYPE_LABELS, STATUS_META } from "../lib/api.js";

const STEPS = [
  { key: "pending", label: "Принята", color: "#E0901A" },
  { key: "in_process", label: "В работе", color: "#3E82CF" },
  { key: "completed", label: "Завершена", color: "#2F9E73" },
];

function StatusProgress({ status }) {
  if (status === "rejected") {
    return (
      <div className="mt-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-poor" />
        <span className="num text-xs font-semibold text-poor">Отклонена</span>
      </div>
    );
  }
  const normalized = status === "open" ? "pending" : status;
  const currentStep = STEPS.findIndex((s) => s.key === normalized);

  return (
    <div className="mt-3 flex items-center">
      {STEPS.map((s, i) => {
        const done = i <= currentStep;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`grid h-6 w-6 place-items-center rounded-full border-2 text-white transition-all duration-300 ${
                  done ? "" : "border-ink/15 dark:border-white/15"
                }`}
                style={
                  done
                    ? { background: STEPS[currentStep].color, borderColor: STEPS[currentStep].color }
                    : {}
                }
              >
                {done && <CheckIcon size={12} strokeWidth={2.6} />}
              </div>
              <span
                className={`num mt-1 text-[9px] font-semibold ${
                  done ? "text-ink-2 dark:text-night-ink-2" : "text-ink-3/70 dark:text-night-ink-3/70"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 mb-4 h-0.5 w-8 rounded transition-all duration-500 ${
                  i < currentStep ? "bg-good" : "bg-ink/10 dark:bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CitizenChat({ problemId }) {
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getMessages(problemId).then(setMessages).catch(() => {}).finally(() => setLoaded(true));
  }, [problemId]);

  async function submit(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(problemId, body);
      setMessages((ms) => [...ms, msg]);
      setText("");
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-3 animate-fade-up space-y-2 rounded-xl bg-canvas-2 p-3 dark:bg-white/[0.05]">
      {!loaded && (
        <div className="py-2 text-center"><Spinner size={15} className="text-ink-3" /></div>
      )}
      {loaded && messages.length === 0 && (
        <div className="num py-2 text-center text-xs text-ink-3 dark:text-night-ink-3">
          Сообщений от акимата пока нет
        </div>
      )}
      {messages.map((m) => {
        const mine = m.sender === "citizen";
        return (
          <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                mine
                  ? "rounded-br-sm bg-brand text-white"
                  : "rounded-bl-sm bg-card text-ink shadow-card dark:bg-nightcard dark:text-white"
              }`}
            >
              <div className="num mb-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-60">
                {mine ? "Вы" : "Акимат"}
              </div>
              {m.body}
            </div>
          </div>
        );
      })}
      <form onSubmit={submit} className="flex items-center gap-2 pt-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ответить акимату…"
          className="min-w-0 flex-1 rounded-xl bg-card px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:ring-2 focus:ring-brand/30 dark:bg-nightcard dark:text-white dark:placeholder:text-night-ink-3"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Отправить"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white transition-transform duration-150 ease-out-quart active:scale-95 disabled:opacity-40"
        >
          {sending ? <Spinner size={14} /> : <SendIcon size={17} strokeWidth={2} />}
        </button>
      </form>
    </div>
  );
}

function ProblemCard({ p }) {
  const [open, setOpen] = useState(false);
  const canChat = p.user_id != null;

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-card dark:border-night-line dark:bg-nightcard">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas-2 text-ink-2 dark:bg-white/10 dark:text-night-ink-2">
            <TypeIcon type={p.type} size={22} />
          </span>
          <div>
            <div className="font-display font-bold text-ink dark:text-white">
              {TYPE_LABELS[p.type] || p.type}
            </div>
            {p.description && (
              <div className="mt-0.5 line-clamp-2 text-[13px] text-ink-2 dark:text-night-ink-2">
                {p.description}
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={p.status} className="shrink-0" />
      </div>
      <StatusProgress status={p.status} />
      <div className="mt-1 flex items-center justify-between border-t border-line pt-3 dark:border-night-line">
        <div className="num text-[11px] text-ink-3 dark:text-night-ink-3">
          {new Date(p.created_at).toLocaleDateString("ru-RU", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </div>
        {canChat && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent transition-colors hover:opacity-80"
          >
            <MessageIcon size={15} strokeWidth={2} />
            {open ? "Скрыть диалог" : "Диалог с акиматом"}
          </button>
        )}
      </div>
      {open && canChat && <CitizenChat problemId={p.id} />}
    </div>
  );
}

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "completed", label: "Завершённые" },
];

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.myReports().then(setReports).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const counts = {
    pending: reports.filter((r) => r.status === "pending" || r.status === "open").length,
    in_process: reports.filter((r) => r.status === "in_process").length,
    completed: reports.filter((r) => r.status === "completed").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  const visible = reports.filter((r) => {
    if (filter === "active") return ["open", "pending", "in_process"].includes(r.status);
    if (filter === "completed") return r.status === "completed";
    return true;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-lg space-y-5 px-4 pb-10 pt-6 md:max-w-2xl">
        {/* Header */}
        <div className="flex items-end justify-between">
          <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">Мои заявки</h1>
          <Button to="/report" size="sm" leftIcon={<PlusIcon size={18} strokeWidth={2.2} />}>Новая</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: "Принято", value: counts.pending, color: STATUS_META.pending.color },
            { label: "В работе", value: counts.in_process, color: STATUS_META.in_process.color },
            { label: "Готово", value: counts.completed, color: STATUS_META.completed.color },
            { label: "Отклон.", value: counts.rejected, color: STATUS_META.rejected.color },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-card p-3 text-center shadow-card dark:border-night-line dark:bg-nightcard"
            >
              <div className="num text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="mt-0.5 text-[10px] text-ink-3 dark:text-night-ink-3">{s.label}</div>
            </div>
          ))}
        </div>

        <Segmented options={FILTERS} value={filter} onChange={setFilter} className="flex w-full" />

        {/* List */}
        <div className="space-y-3">
          {loading && (
            <div className="py-8 text-center"><Spinner size={22} className="text-brand" /></div>
          )}

          {!loading && visible.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-card/60 p-10 text-center dark:border-night-line dark:bg-nightcard/60">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/[0.12] text-brand">
                <CameraIcon size={28} strokeWidth={1.8} />
              </span>
              <div>
                <div className="font-display font-bold text-ink dark:text-white">Здесь появятся ваши заявки</div>
                <p className="mt-1 text-[13px] text-ink-2 dark:text-night-ink-2">
                  Сфотографируйте проблему — она попадёт на карту города.
                </p>
              </div>
              <Button to="/report" size="sm" leftIcon={<CameraIcon size={17} strokeWidth={2} />}>
                Сообщить о проблеме
              </Button>
            </div>
          )}

          {visible.map((p) => (
            <ProblemCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
