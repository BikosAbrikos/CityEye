import { useState } from "react";
import { Link } from "react-router-dom";
import LocationPicker from "../components/LocationPicker.jsx";
import { api, ALMATY_CENTER, TYPE_LABELS, TYPE_ICONS, SEVERITY_LABELS } from "../lib/api.js";
import { SEVERITY_COLOR } from "../lib/colors.js";

const TYPES = ["pothole", "garbage", "streetlight", "graffiti", "sign", "other"];
const SEVS = ["low", "medium", "high"];
const CONFIDENCE = { high: 94, medium: 83, low: 71 };

const cardCls =
  "rounded-2xl bg-card border border-ink/8 shadow-soft px-4 py-3 dark:bg-nightcard dark:border-white/10 dark:shadow-none";
const labelCls =
  "num text-[10px] font-semibold uppercase tracking-widest text-ink/40 dark:text-white/35 mb-2";

export default function ReportPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeTime, setAnalyzeTime] = useState(null);
  const [card, setCard] = useState(null);
  const [editing, setEditing] = useState(null); // "type" | "severity" | "location" | null
  const [pos, setPos] = useState(ALMATY_CENTER);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null); setError(null); setCard(null); setAnalyzeTime(null);
    setAnalyzing(true);
    const t0 = Date.now();
    try {
      const data = await api.analyze(f);
      setCard(data);
      setAnalyzeTime(((Date.now() - t0) / 1000).toFixed(1));
    } catch {
      setError("ИИ не смог распознать фото — заполните вручную.");
      setCard({ type: "other", severity: "medium", description: "" });
    } finally {
      setAnalyzing(false);
    }
    navigator.geolocation?.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => {}
    );
  }

  async function onSubmit() {
    if (!card) return;
    setSubmitting(true); setError(null);
    try {
      const res = await api.createReport({
        file, lat: pos[0], lng: pos[1],
        type: card.type, severity: card.severity, description: card.description,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setFile(null); setPreview(null); setCard(null);
    setResult(null); setError(null); setAnalyzeTime(null);
  }

  const step = !preview ? 0 : !card ? 1 : 2;

  return (
    <div className="min-h-full overflow-y-auto bg-canvas dark:bg-night">
      <div className="mx-auto max-w-lg pb-8">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-5">
          <Link
            to="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-ink shadow-soft dark:bg-nightcard dark:text-white"
          >
            ←
          </Link>
          <div>
            <div className="num text-[10px] font-semibold uppercase tracking-widest text-ink/40 dark:text-white/35">
              {step === 0 && "Шаг 1 из 2 · Загрузите фото"}
              {step === 1 && "Шаг 1 из 2 · Анализ ИИ…"}
              {step === 2 && "Шаг 2 из 2 · Проверьте данные"}
            </div>
            <h1 className="font-display text-xl font-extrabold text-ink dark:text-white">
              Новая заявка
            </h1>
          </div>
        </div>

        {!result ? (
          <div className="space-y-3 px-4">
            {/* ── Photo block ── */}
            <label className="relative block cursor-pointer overflow-hidden rounded-2xl border border-ink/8 bg-card shadow-soft dark:border-white/10 dark:bg-nightcard dark:shadow-none">
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              {preview ? (
                <>
                  <img src={preview} alt="" className="max-h-72 w-full object-cover" />
                  {/* Scan overlay */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="scan-tl" />
                    <div className="scan-tr" />
                    <div className="scan-bl" />
                    <div className="scan-br" />
                    {analyzing && <div className="scan-line" />}
                    {card && !analyzing && (
                      <div className="absolute left-3 top-3">
                        <span className="rounded bg-amber px-2 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white">
                          {TYPE_LABELS[card.type]} · {CONFIDENCE[card.severity]}%
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Footer */}
                  <div className="flex items-center justify-between bg-black/55 px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
                      <span className="num text-[11px] text-white/80">
                        {analyzing
                          ? "ИИ анализирует…"
                          : analyzeTime
                          ? `ИИ распознал объект за ${analyzeTime} с`
                          : "Готово"}
                      </span>
                    </div>
                    <span className="num cursor-pointer text-[11px] text-white/60">
                      ↺ Переснять
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-14">
                  <span className="text-4xl">📸</span>
                  <span className="font-display font-bold text-ink dark:text-white">
                    Нажмите, чтобы выбрать фото
                  </span>
                  <span className="text-sm text-ink/40 dark:text-white/40">
                    JPG / PNG — ИИ определит тип
                  </span>
                </div>
              )}
            </label>

            {/* ── Info cards (after analysis) ── */}
            {card && !analyzing && (
              <>
                {/* Type */}
                <div className={cardCls}>
                  <div className={labelCls}>Тип проблемы</div>
                  {editing === "type" ? (
                    <div className="flex flex-wrap gap-2 pb-1">
                      {TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setCard({ ...card, type: t }); setEditing(null); }}
                          className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                            card.type === t
                              ? "bg-amber text-white"
                              : "bg-ink/5 text-ink/70 hover:bg-ink/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
                          }`}
                        >
                          {TYPE_ICONS[t]} {TYPE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-ink dark:text-white">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/5 dark:bg-white/10">
                          {TYPE_ICONS[card.type]}
                        </div>
                        <span className="font-semibold">{TYPE_LABELS[card.type]}</span>
                      </div>
                      <button
                        onClick={() => setEditing("type")}
                        className="num text-xs font-semibold text-amber"
                      >
                        Изменить
                      </button>
                    </div>
                  )}
                </div>

                {/* Severity */}
                <div className={cardCls}>
                  <div className={labelCls}>Важность · Оценка ИИ</div>
                  {editing === "severity" ? (
                    <div className="flex gap-2 pb-1">
                      {SEVS.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setCard({ ...card, severity: s }); setEditing(null); }}
                          className={`flex-1 rounded-full py-1.5 text-sm font-semibold transition ${
                            card.severity === s
                              ? "text-white"
                              : "bg-ink/5 text-ink/60 hover:bg-ink/10 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20"
                          }`}
                          style={card.severity === s ? { background: SEVERITY_COLOR[s] } : {}}
                        >
                          {SEVERITY_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                        style={{
                          background: `${SEVERITY_COLOR[card.severity]}25`,
                          color: SEVERITY_COLOR[card.severity],
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: SEVERITY_COLOR[card.severity] }}
                        />
                        {SEVERITY_LABELS[card.severity]}
                      </span>
                      <button
                        onClick={() => setEditing("severity")}
                        className="num text-xs font-semibold text-amber"
                      >
                        Изменить
                      </button>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className={cardCls}>
                  <div className={labelCls}>Локация</div>
                  {editing === "location" ? (
                    <div className="space-y-2 pb-1">
                      <LocationPicker position={pos} onPick={setPos} />
                      <button
                        onClick={() => setEditing(null)}
                        className="w-full rounded-xl bg-amber py-2 text-sm font-semibold text-white"
                      >
                        Подтвердить
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 text-ink dark:text-white">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-ink/5 dark:bg-white/10">
                          📍
                        </div>
                        <div>
                          <div className="font-semibold">Алматы, Казахстан</div>
                          <div className="num mt-0.5 text-xs text-ink/40 dark:text-white/40">
                            {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditing("location")}
                        className="num shrink-0 text-xs font-semibold text-amber"
                      >
                        Изменить
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className={cardCls}>
                  <div className={labelCls}>Описание (необязательно)</div>
                  <textarea
                    rows={2}
                    placeholder="Уточните проблему…"
                    className="w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-ink/30 dark:text-white dark:placeholder:text-white/30"
                    value={card.description || ""}
                    onChange={(e) => setCard({ ...card, description: e.target.value })}
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-poor/15 px-4 py-3 text-sm text-poor">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-amber py-4 font-display text-base font-extrabold text-white transition active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? "Отправка…" : (
                    <>
                      Отправить заявку
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm">→</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          /* ── Result ── */
          <div className="space-y-4 px-4">
            {result.merged ? (
              <div className="space-y-3 rounded-2xl border border-amber/30 bg-amber/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber font-display text-lg font-extrabold text-white">
                    {result.similar_count}
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-ink dark:text-white">
                      Рядом найдено {result.similar_count} похожих заявок
                    </div>
                    <div className="mt-0.5 text-sm text-ink/60 dark:text-white/60">
                      ИИ объединит их в одну проблему, чтобы не было дублей.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-good/30 bg-good/10 p-5">
                <div className="font-display text-xl font-extrabold text-ink dark:text-white">
                  Заявка принята
                </div>
                <p className="mt-1 text-sm text-ink/60 dark:text-white/60">
                  Проблема добавлена на карту и учтена в индексе района.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={reset}
                className="rounded-2xl border border-ink/15 py-3.5 text-sm font-semibold text-ink dark:border-white/15 dark:text-white"
              >
                Сообщить ещё
              </button>
              <Link
                to="/dashboard"
                className="rounded-2xl bg-amber py-3.5 text-center font-display text-sm font-extrabold text-white"
              >
                Мои заявки →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
