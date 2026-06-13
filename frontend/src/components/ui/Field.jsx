/**
 * Поля ввода с единым словарём состояний: rest / hover / focus / disabled / invalid.
 * Кольцо фокуса видимое (a11y), плавный точечный transition.
 */

const FIELD =
  "w-full rounded-xl border bg-card px-3.5 text-ink transition-colors duration-150 " +
  "placeholder:text-ink-3 outline-none " +
  "border-line hover:border-ink/20 " +
  "focus:border-brand focus:ring-2 focus:ring-brand/30 " +
  "disabled:opacity-60 disabled:cursor-not-allowed " +
  "dark:bg-nightcard dark:text-white dark:border-night-line dark:placeholder:text-night-ink-3 dark:hover:border-white/25";

export function Input({ className = "", invalid, ...rest }) {
  return (
    <input
      className={`${FIELD} h-11 ${
        invalid ? "border-poor focus:border-poor focus:ring-poor/25" : ""
      } ${className}`}
      {...rest}
    />
  );
}

export function Textarea({ className = "", rows = 3, ...rest }) {
  return (
    <textarea
      rows={rows}
      className={`${FIELD} resize-none py-3 leading-relaxed ${className}`}
      {...rest}
    />
  );
}

export function Field({ label, hint, htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-semibold text-ink-2 dark:text-night-ink-2">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-3 dark:text-night-ink-3">{hint}</span>}
    </label>
  );
}
