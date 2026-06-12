import { SEVERITY_COLOR, BUCKET_COLOR, bucketOf } from "../lib/colors.js";
import { SEVERITY_LABELS } from "../lib/api.js";

export function SeverityBadge({ severity }) {
  const color = SEVERITY_COLOR[severity] || "#999";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `${color}1A`, color }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      {SEVERITY_LABELS[severity] || severity}
    </span>
  );
}

export function IndexBadge({ score }) {
  const color = BUCKET_COLOR[bucketOf(score)];
  return (
    <span
      className="num inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold"
      style={{ background: `${color}1A`, color }}
    >
      {score.toFixed(0)}
    </span>
  );
}
