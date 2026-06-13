import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button.jsx";
import { PlayIcon, VolumeIcon, VolumeMuteIcon, ArrowRightIcon, XIcon } from "../lib/icons.jsx";

/**
 * Онбординг-видео: показывается один раз при первом запуске (флаг в localStorage
 * ставит вызывающий компонент при onClose). iOS-дружелюбно: muted + playsInline
 * автозапуск, отдельная кнопка «звук» (жест юзера → звук разрешён), «Пропустить».
 */
export default function OnboardingVideo({ src, onClose }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [needsTap, setNeedsTap] = useState(false); // если автозапуск заблокирован
  const [ended, setEnded] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setNeedsTap(true));
  }, []);

  function dismiss() {
    setLeaving(true);
    setTimeout(onClose, 240); // дать отыграть fade-out
  }

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) v.play().catch(() => {}); // разблокируем со звуком по жесту
  }

  function manualPlay() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    v.play().then(() => setNeedsTap(false)).catch(() => {});
  }

  return (
    <div
      className={`fixed inset-0 z-modal grid place-items-center bg-black/92 p-4 backdrop-blur-sm ${
        leaving ? "animate-fade-in [animation-direction:reverse]" : "animate-fade-in"
      }`}
      style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)", paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
    >
      <div className="relative w-full max-w-[460px] md:max-w-2xl lg:max-w-4xl">
        {/* Подпись */}
        <div className="mb-3 text-center">
          <div className="font-display text-lg font-extrabold text-white">Добро пожаловать в CityEye</div>
          <div className="mt-0.5 text-[13px] text-white/55">Короткое видео — как это работает</div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
          <video
            ref={videoRef}
            src={src}
            className="max-h-[60dvh] w-full bg-black object-contain md:max-h-[72dvh]"
            autoPlay
            muted
            playsInline
            controls={false}
            onEnded={() => setEnded(true)}
          />

          {/* Тап для запуска (если автозапуск заблокирован) */}
          {needsTap && (
            <button
              onClick={manualPlay}
              aria-label="Запустить видео"
              className="absolute inset-0 grid place-items-center bg-black/40 transition-colors hover:bg-black/30"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-white shadow-fab transition-transform duration-150 ease-out-quart active:scale-95">
                <PlayIcon size={30} />
              </span>
            </button>
          )}

          {/* Звук */}
          {!needsTap && !ended && (
            <button
              onClick={toggleSound}
              aria-label={muted ? "Включить звук" : "Выключить звук"}
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              {muted ? <VolumeMuteIcon size={16} /> : <VolumeIcon size={16} />}
              {muted ? "Звук" : "Без звука"}
            </button>
          )}
        </div>

        {/* Действия */}
        <div className="mt-4">
          {ended ? (
            <Button size="lg" fullWidth onClick={dismiss} rightIcon={<ArrowRightIcon size={20} strokeWidth={2} />}>
              Начать
            </Button>
          ) : (
            <button
              onClick={dismiss}
              className="mx-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white/65 transition-colors hover:text-white"
            >
              <XIcon size={15} /> Пропустить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
