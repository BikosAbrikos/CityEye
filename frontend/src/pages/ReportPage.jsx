import { useState } from "react";
import { Link } from "react-router-dom";
import LocationPicker from "../components/LocationPicker.jsx";
import { api, ALMATY_CENTER, TYPE_LABELS, SEVERITY_LABELS } from "../lib/api.js";
import { SEVERITY_COLOR } from "../lib/colors.js";

const TYPES = ["pothole", "garbage", "streetlight", "graffiti", "sign", "other"];
const SEVS = ["low", "medium", "high"];
const CONFIDENCE = { high: 94, medium: 83, low: 71 };

function RoadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
      <rect x="6" y="1" width="6" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="9" y1="5" x2="9" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="9" y1="9.5" x2="9" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
      <path d="M9 2.5L16 14.5H2L9 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="9" y1="8" x2="9" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="9" cy="12.8" r="0.8" fill="currentColor"/>
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
      <path d="M9 1.5C6.52 1.5 4.5 3.52 4.5 6c0 3.6 4.5 10 4.5 10s4.5-6.4 4.5-10c0-2.48-2.02-4.5-4.5-4.5z"
        stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="9" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

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
    /* Dark background — full height scroll */
    <div className="min-h-full bg-ink overflow-y-auto">
      <div className="mx-auto max-w-lg pb-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-4 pt-5 pb-4">
          <div>
            <div className="num text-[10px] font-semibold uppercase tracking-widest text-white/35">
              {step === 0 && "Шаг 1 из 2 · Загрузите фото"}
              {step === 1 && "Шаг 1 из 2 · Анализ ИИ…"}
              {step === 2 && "Шаг 2 из 2 · Проверьте данные"}
            </div>
            <h1 className="font-display text-xl font-extrabold text-white mt-0.5">
              Новая заявка
            </h1>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span className="font-display text-sm font-bold text-white">CityEye</span>
          </div>
        </div>

        {!result ? (
          <div className="space-y-3 px-4">
            {/* ── Photo block ── */}
            <label className="relative block cursor-pointer overflow-hidden rounded-2xl bg-white/5 border border-white/10">
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              {preview ? (
                <>
                  <img src={preview} alt="" className="w-full object-cover max-h-72" />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="scan-tl" />
                    <div className="scan-tr" />
                    <div className="scan-bl" />
                    <div className="scan-br" />
                    {analyzing && <div className="scan-line" />}
                    {card && !analyzing && (
                      <div className="absolute top-3 left-3">
                        <span className="rounded bg-amber px-2 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-white">
                          {TYPE_LABELS[card.type]} · {CONFIDENCE[card.severity]}%
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Footer */}
                  <div className="flex items-center justify-between bg-black/50 px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
                      <span className="num text-[11px] text-white/70">
                        {analyzing
                          ? "ИИ анализирует…"
                          : analyzeTime
                          ? `ИИ распознал объект за ${analyzeTime} с`
                          : "Готово"}
                      </span>
                    </div>
                    <span className="num text-[11px] text-white/50 cursor-pointer">
                      ↺ Переснять
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-14">
                  <span className="text-4xl">📸</span>
                  <span className="font-display font-bold text-white">Нажмите, чтобы выбрать фото</span>
                  <span className="text-sm text-white/40">JPG / PNG — ИИ определит тип</span>
                </div>
              )}
            </label>

            {/* ── Info cards (after analysis) ── */}
            {card && !analyzing && (
              <>
                {/* Type */}
                <div className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                  <div className="num text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-2">
                    Тип проблемы
                  </div>
                  {editing === "type" ? (
                    <div className="flex flex-wrap gap-2 pb-1">
                      {TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setCard({ ...card, type: t }); setEditing(null); }}
                          className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                            card.type === t
                              ? "bg-amber text-white"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          {TYPE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-white">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                          <RoadIcon />
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
                <div className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                  <div className="num text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-2">
                    Важность · Оценка ИИ
                  </div>
                  {editing === "severity" ? (
                    <div className="flex gap-2 pb-1">
                      {SEVS.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setCard({ ...card, severity: s }); setEditing(null); }}
                          className={`flex-1 rounded-full py-1.5 text-sm font-semibold transition ${
                            card.severity === s
                              ? "text-white"
                              : "bg-white/10 text-white/60 hover:bg-white/20"
                          }`}
                          style={card.severity === s ? { background: SEVERITY_COLOR[s] } : {}}
                        >
                          {SEVERITY_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-white">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                          <WarnIcon />
                        </div>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                          style={{
                            background: `${SEVERITY_COLOR[card.severity]}25`,
                            color: SEVERITY_COLOR[card.severity],
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: SEVERITY_COLOR[card.severity] }} />
                          {SEVERITY_LABELS[card.severity]}
                        </span>
                      </div>
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
                <div className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                  <div className="num text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-2">
                    Локация
                  </div>
                  {editing === "location" ? (
                    <div className="space-y-2 pb-1">
                      <LocationPicker position={pos} onPick={setPos} />
                      <button
                        onClick={() => setEditing(null)}
                        className="w-full rounded-xl bg-amber py-2 font-semibold text-white text-sm"
                      >
                        Подтвердить
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 text-white">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 mt-0.5">
                          <PinIcon />
                        </div>
                        <div>
                          <div className="font-semibold">Алматы, Казахстан</div>
                          <div className="num text-xs text-white/40 mt-0.5">
                            {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditing("location")}
                        className="num text-xs font-semibold text-amber shrink-0"
                      >
                        Изменить
                      </button>
                    </div>
                  )}
                </div>

                {/* Description (if empty, show textarea) */}
                {!card.description && (
                  <div className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3">
                    <div className="num text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-2">
                      Описание (необязательно)
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Уточните проблему…"
                      className="w-full bg-transparent text-white placeholder-white/30 text-sm outline-none resize-none"
                      value={card.description}
                      onChange={(e) => setCard({ ...card, description: e.target.value })}
                    />
                  </div>
                )}

                {error && (
                  <div className="rounded-xl bg-poor/20 px-4 py-3 text-sm text-poor">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="w-full rounded-2xl bg-white py-4 font-display text-base font-extrabold text-ink transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? "Отправка…" : (
                    <>
                      Отправить заявку
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber text-white text-sm">→</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          /* ── Result ── */
          <div className="px-4 space-y-4">
            {result.merged ? (
              <div className="rounded-2xl bg-amber/15 border border-amber/30 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber font-display text-lg font-extrabold text-white">
                    {result.similar_count}
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-white">
                      Рядом найдено {result.similar_count} похожих заявок
                    </div>
                    <div className="text-sm text-white/60 mt-0.5">
                      ИИ объединит их в одну проблему, чтобы не было дублей.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-good/15 border border-good/30 p-5">
                <div className="font-display text-xl font-extrabold text-white">Заявка принята</div>
                <p className="text-sm text-white/60 mt-1">
                  Проблема добавлена на карту и учтена в индексе района.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={reset}
                className="rounded-2xl border border-white/15 py-3.5 font-semibold text-white text-sm"
              >
                Сообщить ещё
              </button>
              <Link
                to="/"
                className="rounded-2xl bg-white py-3.5 text-center font-display font-extrabold text-ink text-sm"
              >
                На карту →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
