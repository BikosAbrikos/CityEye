import { useState } from "react";
import { Link } from "react-router-dom";
import LocationPicker from "../components/LocationPicker.jsx";
import { SeverityBadge } from "../components/Badges.jsx";
import {
  api,
  ALMATY_CENTER,
  TYPE_LABELS,
  SEVERITY_LABELS,
} from "../lib/api.js";

const TYPES = ["pothole", "garbage", "streetlight", "graffiti", "sign", "other"];
const SEVS = ["low", "medium", "high"];

export default function ReportPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [card, setCard] = useState(null); // {type, severity, description}
  const [pos, setPos] = useState(ALMATY_CENTER);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setAnalyzing(true);
    try {
      const data = await api.analyze(f);
      setCard(data);
    } catch (err) {
      setError("Не удалось распознать фото. Заполните карточку вручную.");
      setCard({ type: "other", severity: "medium", description: "" });
    } finally {
      setAnalyzing(false);
    }
    // Попробуем геолокацию браузера
    navigator.geolocation?.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => {}
    );
  }

  async function onSubmit() {
    if (!card) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.createReport({
        file,
        lat: pos[0],
        lng: pos[1],
        type: card.type,
        severity: card.severity,
        description: card.description,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setCard(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 overflow-y-auto p-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">
          Сообщить о проблеме
        </h1>
        <p className="text-sm text-ink/60">
          Загрузите фото — ИИ определит тип и серьёзность.
        </p>
      </div>

      {!result && (
        <>
          {/* Загрузка фото */}
          <label className="block cursor-pointer rounded-xl2 border-2 border-dashed border-ink/15 bg-card p-6 text-center shadow-soft transition hover:border-amber">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
            {preview ? (
              <img
                src={preview}
                alt=""
                className="mx-auto max-h-56 rounded-xl2 object-contain"
              />
            ) : (
              <div className="text-ink/50">
                <div className="font-display text-lg font-bold text-ink">
                  Нажмите, чтобы выбрать фото
                </div>
                <div className="text-sm">JPG / PNG</div>
              </div>
            )}
          </label>

          {analyzing && (
            <div className="num animate-pulse rounded-xl2 bg-amber/10 px-4 py-3 text-sm font-semibold text-amber">
              ИИ анализирует фото…
            </div>
          )}

          {/* Авто-карточка */}
          {card && !analyzing && (
            <div className="space-y-4 rounded-xl2 border border-ink/5 bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">
                  Распознано ИИ
                </span>
                <SeverityBadge severity={card.severity} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Тип">
                  <select
                    className="num w-full rounded-lg border border-ink/15 bg-canvas px-3 py-2"
                    value={card.type}
                    onChange={(e) =>
                      setCard({ ...card, type: e.target.value })
                    }
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Серьёзность">
                  <select
                    className="num w-full rounded-lg border border-ink/15 bg-canvas px-3 py-2"
                    value={card.severity}
                    onChange={(e) =>
                      setCard({ ...card, severity: e.target.value })
                    }
                  >
                    {SEVS.map((s) => (
                      <option key={s} value={s}>
                        {SEVERITY_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Описание">
                <textarea
                  className="w-full rounded-lg border border-ink/15 bg-canvas px-3 py-2"
                  rows={2}
                  value={card.description}
                  onChange={(e) =>
                    setCard({ ...card, description: e.target.value })
                  }
                />
              </Field>

              <Field label="Где это? (двигайте маркер)">
                <LocationPicker position={pos} onPick={setPos} />
                <div className="num mt-1 text-xs text-ink/40">
                  {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
                </div>
              </Field>

              <button
                onClick={onSubmit}
                disabled={submitting}
                className="w-full rounded-xl2 bg-ink py-3 font-display font-bold text-canvas transition hover:bg-ink/90 disabled:opacity-50"
              >
                {submitting ? "Отправка…" : "Отправить заявку"}
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl2 bg-poor/10 px-4 py-3 text-sm text-poor">
              {error}
            </div>
          )}
        </>
      )}

      {/* Результат */}
      {result && (
        <div className="space-y-4 rounded-xl2 border border-ink/5 bg-card p-5 shadow-soft">
          {result.merged ? (
            <>
              <div className="font-display text-xl font-extrabold text-amber">
                Рядом уже есть похожая проблема
              </div>
              <p className="text-sm text-ink/70">
                Мы объединили вашу заявку с существующей — всего{" "}
                <span className="num font-bold">{result.similar_count}</span>{" "}
                похожих. Это помогает не плодить дубликаты и точнее считать
                индекс района.
              </p>
            </>
          ) : (
            <>
              <div className="font-display text-xl font-extrabold text-good">
                Заявка принята
              </div>
              <p className="text-sm text-ink/70">
                Проблема добавлена на карту и учтена в индексе района.
              </p>
            </>
          )}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 rounded-xl2 border border-ink/15 py-2.5 font-semibold"
            >
              Сообщить ещё
            </button>
            <Link
              to="/"
              className="flex-1 rounded-xl2 bg-ink py-2.5 text-center font-semibold text-canvas"
            >
              На карту
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink/50">
        {label}
      </span>
      {children}
    </label>
  );
}
