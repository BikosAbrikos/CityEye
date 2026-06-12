import { SEVERITY_COLOR } from "../lib/colors.js";

function Stat({ label, value, color }) {
  return (
    <div className="flex-1 rounded-xl2 border border-ink/5 bg-card px-4 py-3 shadow-soft">
      <div
        className="num text-2xl font-bold"
        style={{ color: color || "#15181C" }}
      >
        {value}
      </div>
      <div className="text-xs text-ink/50">{label}</div>
    </div>
  );
}

export default function StatsBar({ stats }) {
  if (!stats) return null;
  return (
    <div className="flex gap-3">
      <Stat label="Открытых проблем" value={stats.total_open} />
      <Stat
        label="Высокая серьёзность"
        value={stats.by_severity.high}
        color={SEVERITY_COLOR.high}
      />
      <Stat
        label="Объединено заявок"
        value={stats.merged_reports}
        color="#F4A024"
      />
    </div>
  );
}
