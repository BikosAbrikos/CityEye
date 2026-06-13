/** Спиннер на чистом CSS (off-main-thread). Быстрый оборот = ощущение скорости. */
export function Spinner({ size = 18, className = "" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em] ${className}`}
      style={{ width: size, height: size, animationDuration: "0.6s" }}
      role="status"
      aria-label="Загрузка"
    />
  );
}
