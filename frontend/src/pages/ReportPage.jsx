import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LocationPicker from "../components/LocationPicker.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Textarea } from "../components/ui/Field.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import {
  ArrowLeftIcon, ArrowRightIcon, CameraIcon, SparklesIcon,
  RotateIcon, MapPinIcon, CheckIcon, TypeIcon,
} from "../lib/icons.jsx";
import { api, ALMATY_CENTER, TYPE_LABELS, SEVERITY_LABELS } from "../lib/api.js";
import { SEVERITY_COLOR } from "../lib/colors.js";

const TYPES = ["pothole", "garbage", "streetlight", "graffiti", "sign", "other"];
const SEVS = ["low", "medium", "high"];
const CONFIDENCE = { high: 94, medium: 83, low: 71 };

/** Строка review-панели: лейбл слева, значение справа, инлайн-редактирование. */
function Row({ label, editing, onEdit, children, edit }) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-ink-3 dark:text-night-ink-3">{label}</span>
        {!editing && onEdit && (
          <button onClick={onEdit} className="text-[13px] font-semibold text-brand-ink dark:text-brand">
            Изменить
          </button>
        )}
      </div>
      <div className="mt-2">{editing ? edit : children}</div>
    </div>
  );
}

export default function ReportPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [preDescription, setPreDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeTime, setAnalyzeTime] = useState(null);
  const [card, setCard] = useState(null);
  const [editing, setEditing] = useState(null);
  const [pos, setPos] = useState(ALMATY_CENTER);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null); setError(null); setCard(null); setAnalyzeTime(null);
    navigator.geolocation?.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => {}
    );
  }

  async function onAnalyze() {
    if (!file) return;
    setError(null); setAnalyzing(true);
    const t0 = Date.now();
    try {
      const data = await api.analyze(file, preDescription);
      // ИИ-фильтр спама: фото не по тематике → не даём отправить, уводим на карту
      if (data.relevant === false) {
        navigate("/", {
          state: {
            rejected:
              data.reason ||
              "Это фото не похоже на городскую проблему — заявка не отправлена.",
          },
        });
        return;
      }
      setCard({ ...data, description: preDescription.trim() || data.description });
      setAnalyzeTime(((Date.now() - t0) / 1000).toFixed(1));
    } catch {
      setError("ИИ не смог распознать фото — заполните вручную.");
      setCard({ type: "other", severity: "medium", description: preDescription });
    } finally {
      setAnalyzing(false);
    }
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
    setPreDescription("");
  }

  const step = !preview ? 0 : !card ? 1 : 2;
  const stepText = ["Загрузите фото проблемы", "Опишите и запустите ИИ", "Проверьте и отправьте"][step];

  return (
    <div className="h-full overflow-y-auto bg-canvas dark:bg-night">
      <div className="mx-auto max-w-lg px-4 pb-10">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 pt-5">
          <Link
            to="/"
            aria-label="Назад к карте"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-card text-ink shadow-card transition-colors hover:bg-canvas-2 dark:border-night-line dark:bg-nightcard dark:text-white"
          >
            <ArrowLeftIcon size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold leading-tight text-ink dark:text-white">
              Новая заявка
            </h1>
            <div className="text-[13px] text-ink-2 dark:text-night-ink-2">{stepText}</div>
          </div>
        </div>

        {/* Step progress */}
        {!result && (
          <div className="mb-4 flex gap-1.5">
            {[0, 1].map((i) => (
              <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08] dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out-expo"
                  style={{ width: step > i ? "100%" : step === i ? "45%" : "0%" }}
                />
              </div>
            ))}
          </div>
        )}

        {!result ? (
          <div className="space-y-3">
            {/* Photo */}
            <label className="relative block cursor-pointer overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-shadow hover:shadow-card-hover dark:border-night-line dark:bg-nightcard">
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              {preview ? (
                <>
                  <img src={preview} alt="Фото проблемы" className="max-h-72 w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0">
                    <div className="scan-tl" /><div className="scan-tr" /><div className="scan-bl" /><div className="scan-br" />
                    {analyzing && <div className="scan-line" />}
                    {card && !analyzing && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1 text-[12px] font-bold text-white shadow-sm">
                        <SparklesIcon size={14} strokeWidth={2} />
                        {TYPE_LABELS[card.type]} · {CONFIDENCE[card.severity]}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-black/60 px-3.5 py-2.5">
                    <span className="num flex items-center gap-2 text-[12px] text-white/85">
                      {analyzing ? (
                        <><Spinner size={13} className="text-brand" /> ИИ анализирует…</>
                      ) : analyzeTime ? (
                        <><CheckIcon size={14} className="text-good" /> Распознано за {analyzeTime}&nbsp;с</>
                      ) : (
                        "Готово к анализу"
                      )}
                    </span>
                    <span className="num flex items-center gap-1 text-[12px] text-white/65">
                      <RotateIcon size={13} /> Переснять
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2.5 py-16">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/[0.12] text-brand">
                    <CameraIcon size={28} strokeWidth={1.9} />
                  </span>
                  <span className="font-display font-bold text-ink dark:text-white">
                    Нажмите, чтобы выбрать фото
                  </span>
                  <span className="text-[13px] text-ink-2 dark:text-night-ink-2">
                    JPG или PNG · ИИ определит тип проблемы
                  </span>
                </div>
              )}
            </label>

            {/* Describe + analyze */}
            {preview && !card && (
              <>
                <div className="rounded-2xl border border-line bg-card p-4 shadow-card dark:border-night-line dark:bg-nightcard">
                  <div className="mb-2 text-[13px] font-semibold text-ink-2 dark:text-night-ink-2">
                    Описание <span className="font-normal text-ink-3 dark:text-night-ink-3">(необязательно)</span>
                  </div>
                  <Textarea
                    rows={3}
                    placeholder="Что случилось? Чем точнее опишете, тем точнее ИИ оценит важность."
                    value={preDescription}
                    onChange={(e) => setPreDescription(e.target.value)}
                  />
                </div>
                {error && <ErrorNote>{error}</ErrorNote>}
                <Button
                  size="lg" fullWidth loading={analyzing} onClick={onAnalyze}
                  rightIcon={!analyzing && <SparklesIcon size={20} strokeWidth={2} />}
                >
                  {analyzing ? "ИИ анализирует…" : "Анализировать"}
                </Button>
              </>
            )}

            {/* Review */}
            {card && !analyzing && (
              <>
                <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card shadow-card dark:divide-night-line dark:border-night-line dark:bg-nightcard">
                  <Row
                    label="Тип проблемы"
                    editing={editing === "type"}
                    onEdit={() => setEditing("type")}
                    edit={
                      <div className="flex flex-wrap gap-2">
                        {TYPES.map((t) => (
                          <button
                            key={t}
                            onClick={() => { setCard({ ...card, type: t }); setEditing(null); }}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                              card.type === t
                                ? "bg-brand text-white"
                                : "bg-ink/[0.05] text-ink-2 hover:bg-ink/[0.09] dark:bg-white/10 dark:text-night-ink-2 dark:hover:bg-white/15"
                            }`}
                          >
                            <TypeIcon type={t} size={16} /> {TYPE_LABELS[t]}
                          </button>
                        ))}
                      </div>
                    }
                  >
                    <div className="flex items-center gap-3 text-ink dark:text-white">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-canvas-2 text-ink-2 dark:bg-white/10 dark:text-night-ink-2">
                        <TypeIcon type={card.type} size={20} />
                      </span>
                      <span className="font-semibold">{TYPE_LABELS[card.type]}</span>
                    </div>
                  </Row>

                  <Row
                    label="Важность · оценка ИИ"
                    editing={editing === "severity"}
                    onEdit={() => setEditing("severity")}
                    edit={
                      <div className="flex gap-2">
                        {SEVS.map((s) => {
                          const on = card.severity === s;
                          return (
                            <button
                              key={s}
                              onClick={() => { setCard({ ...card, severity: s }); setEditing(null); }}
                              className={`flex-1 rounded-xl py-2 text-[13px] font-semibold transition-colors ${
                                on
                                  ? "text-white"
                                  : "bg-ink/[0.05] text-ink-2 hover:bg-ink/[0.09] dark:bg-white/10 dark:text-night-ink-2 dark:hover:bg-white/15"
                              }`}
                              style={on ? { background: SEVERITY_COLOR[s] } : undefined}
                            >
                              {SEVERITY_LABELS[s]}
                            </button>
                          );
                        })}
                      </div>
                    }
                  >
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold"
                      style={{ background: `${SEVERITY_COLOR[card.severity]}1A`, color: SEVERITY_COLOR[card.severity] }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: SEVERITY_COLOR[card.severity] }} />
                      {SEVERITY_LABELS[card.severity]}
                    </span>
                  </Row>

                  <Row
                    label="Локация"
                    editing={editing === "location"}
                    onEdit={() => setEditing("location")}
                    edit={
                      <div className="space-y-2">
                        <LocationPicker position={pos} onPick={setPos} />
                        <Button size="sm" fullWidth onClick={() => setEditing(null)}>Подтвердить точку</Button>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-3 text-ink dark:text-white">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-canvas-2 text-ink-2 dark:bg-white/10 dark:text-night-ink-2">
                        <MapPinIcon size={20} />
                      </span>
                      <div>
                        <div className="font-semibold">Алматы, Казахстан</div>
                        <div className="num text-xs text-ink-3 dark:text-night-ink-3">
                          {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </Row>

                  <Row label="Описание">
                    <Textarea
                      rows={2}
                      placeholder="Уточните проблему…"
                      value={card.description || ""}
                      onChange={(e) => setCard({ ...card, description: e.target.value })}
                    />
                  </Row>
                </div>

                {error && <ErrorNote>{error}</ErrorNote>}
                <Button
                  size="lg" fullWidth loading={submitting} onClick={onSubmit}
                  rightIcon={!submitting && <ArrowRightIcon size={20} strokeWidth={2} />}
                >
                  {submitting ? "Отправка…" : "Отправить заявку"}
                </Button>
              </>
            )}
          </div>
        ) : (
          <Result result={result} onReset={reset} />
        )}
      </div>
    </div>
  );
}

function ErrorNote({ children }) {
  return (
    <div className="rounded-xl bg-poor/[0.12] px-4 py-3 text-sm font-medium text-poor">{children}</div>
  );
}

function Result({ result, onReset }) {
  return (
    <div className="animate-fade-up space-y-4">
      {result.merged ? (
        <div className="rounded-2xl border border-brand/30 bg-brand/[0.1] p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand font-display text-lg font-extrabold text-white">
              {result.similar_count}
            </span>
            <div>
              <div className="font-display font-extrabold text-ink dark:text-white">
                Рядом найдено {result.similar_count} похожих заявок
              </div>
              <p className="mt-0.5 text-[13px] text-ink-2 dark:text-night-ink-2">
                ИИ объединит их в одну проблему, чтобы не было дублей.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-good/30 bg-good/[0.1] p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-good text-white">
              <CheckIcon size={24} strokeWidth={2.4} />
            </span>
            <div>
              <div className="font-display text-lg font-extrabold text-ink dark:text-white">Заявка принята</div>
              <p className="mt-0.5 text-[13px] text-ink-2 dark:text-night-ink-2">
                Проблема добавлена на карту и учтена в индексе района.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onReset}>Сообщить ещё</Button>
        <Button to="/dashboard" rightIcon={<ArrowRightIcon size={18} strokeWidth={2} />}>Мои заявки</Button>
      </div>
    </div>
  );
}
