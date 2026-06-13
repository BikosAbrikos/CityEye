/**
 * Фирменный знак CityEye — пин-«глаз»: капля геолокации, зрачок = точка на карте.
 * mono — для тёмного портала акимата (знак на белом, без amber-тайла).
 */
export function LogoMark({ size = 36, className = "" }) {
  return (
    <span
      className={`grid place-items-center rounded-[12px] bg-brand ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 22s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12Z"
          stroke="#fff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="3.4" fill="#fff" />
        <circle cx="12" cy="10" r="1.4" fill="#F4A024" />
      </svg>
    </span>
  );
}

export function Logo({ sub = "Алматы · пилот", size = 36, light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <div className="leading-none">
        <div
          className={`font-display text-lg font-extrabold ${
            light ? "text-white" : "text-ink dark:text-white"
          }`}
        >
          CityEye
        </div>
        {sub && (
          <div
            className={`num mt-1 text-[10px] ${
              light ? "text-white/45" : "text-ink-3 dark:text-night-ink-3"
            }`}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
