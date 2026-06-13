import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "./Spinner.jsx";

/**
 * Единая кнопка проекта. Полный словарь состояний:
 * default / hover / focus-visible / active / disabled / loading.
 * Press-feedback (scale 0.97) и точечные transition по Emil.
 */

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2 font-semibold " +
  "transition-[transform,background-color,box-shadow,opacity,border-color] duration-150 ease-out-quart " +
  "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

const VARIANTS = {
  primary:
    "bg-brand text-white shadow-fab hover:bg-brand-press focus-visible:ring-brand/50 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-night",
  secondary:
    "bg-card text-ink border border-line hover:bg-canvas-2 focus-visible:ring-ink/20 focus-visible:ring-offset-canvas " +
    "dark:bg-nightcard dark:text-white dark:border-night-line dark:hover:bg-night-2 dark:focus-visible:ring-offset-night",
  ghost:
    "text-ink-2 hover:bg-ink/[0.06] hover:text-ink focus-visible:ring-ink/20 focus-visible:ring-offset-canvas " +
    "dark:text-night-ink-2 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-offset-night",
  danger:
    "bg-poor text-white hover:brightness-95 focus-visible:ring-poor/50 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-night",
  navy:
    "bg-navy text-white hover:bg-navy-2 focus-visible:ring-steel/60 focus-visible:ring-offset-slate",
  steel:
    "bg-steel text-white hover:bg-steel-press focus-visible:ring-steel/50 focus-visible:ring-offset-slate",
};

const SIZES = {
  sm: "h-9 rounded-xl px-3.5 text-sm",
  md: "h-11 rounded-2xl px-5 text-[15px]",
  lg: "h-14 rounded-2xl px-6 text-base font-display font-extrabold",
  icon: "h-10 w-10 rounded-xl",
};

export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    className = "",
    children,
    to,
    leftIcon,
    rightIcon,
    fullWidth,
    ...rest
  },
  ref
) {
  const cls = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${
    fullWidth ? "w-full" : ""
  } ${className}`;

  const inner = (
    <>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner size={size === "lg" ? 20 : 16} />
        </span>
      )}
      <span
        className={`inline-flex items-center gap-2 ${loading ? "opacity-0" : ""}`}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={cls} aria-busy={loading} {...rest}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {inner}
    </button>
  );
});
