/**
 * Сегмент-переключатель с скользящим индикатором (transform, не layout).
 * Используется для фильтров очереди/заявок. tone: 'default' | 'navy'.
 */
export function Segmented({ options, value, onChange, tone = "default", className = "" }) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const navy = tone === "navy";

  return (
    <div
      role="tablist"
      className={`relative inline-flex rounded-xl p-1 ${
        navy ? "bg-navy-2/60" : "bg-ink/[0.05] dark:bg-white/[0.06]"
      } ${className}`}
    >
      {/* Скользящий thumb */}
      <span
        aria-hidden
        className={`absolute top-1 bottom-1 left-1 rounded-lg transition-transform duration-300 ease-out-quart ${
          navy ? "bg-steel shadow-sm" : "bg-card shadow-card dark:bg-white/15"
        }`}
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${idx * 100}%)`,
        }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`relative z-floating flex-1 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 ${
              navy
                ? active
                  ? "text-white"
                  : "text-white/55 hover:text-white/80"
                : active
                ? "text-ink dark:text-white"
                : "text-ink-3 hover:text-ink-2 dark:text-night-ink-3 dark:hover:text-night-ink-2"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
