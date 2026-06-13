import { SEVERITY_COLOR } from "../../lib/colors.js";
import { SEVERITY_LABELS, STATUS_META } from "../../lib/api.js";

/**
 * Базовый бейдж-пилюля. Цвет данных задаётся через colorHex (мягкая заливка
 * + насыщенный текст), что держит контраст и отделяет данные от брендового amber.
 */
export function Badge({ colorHex, dot = false, mono = false, className = "", children }) {
  const style = colorHex
    ? { background: `${colorHex}1A`, color: colorHex }
    : undefined;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        mono ? "num" : ""
      } ${!colorHex ? "bg-ink/[0.06] text-ink-2 dark:bg-white/10 dark:text-night-ink-2" : ""} ${className}`}
      style={style}
    >
      {dot && colorHex && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: colorHex }} />
      )}
      {children}
    </span>
  );
}

export function SeverityBadge({ severity, className = "" }) {
  return (
    <Badge colorHex={SEVERITY_COLOR[severity]} dot className={className}>
      {SEVERITY_LABELS[severity] || severity}
    </Badge>
  );
}

export function StatusBadge({ status, className = "" }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <Badge colorHex={meta.color} mono className={className}>
      {meta.label}
    </Badge>
  );
}

export function DupBadge({ count, className = "" }) {
  if (!count) return null;
  return (
    <Badge mono className={className}>
      +{count} похожих
    </Badge>
  );
}
