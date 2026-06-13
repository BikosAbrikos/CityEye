import { useRef, useState } from "react";

/**
 * Мобильный bottom-sheet с двумя снапами (peek / expanded).
 * Движение — через transform translateY (GPU, не layout). Свайп ручкой:
 * учитывается скорость (flick), позиция и демпинг к границам.
 */
export function BottomSheet({
  peek = 84,
  heightVh = 64,
  expanded,
  onExpandedChange,
  handleLabel,
  children,
}) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [dragPx, setDragPx] = useState(null); // px-перевод во время drag, иначе null

  const restingTransform = expanded
    ? "translateY(0)"
    : `translateY(calc(100% - ${peek}px))`;

  function onPointerDown(e) {
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture?.(e.pointerId);
    const max = el.offsetHeight - peek;
    const base = expanded ? 0 : max;
    drag.current = { startY: e.clientY, base, max, t0: performance.now() };
    setDragPx(base);
  }
  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    let next = d.base + (e.clientY - d.startY);
    next = Math.min(Math.max(next, 0), d.max); // демпинг = жёсткие границы snap-зоны
    setDragPx(next);
  }
  function onPointerUp(e) {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    const v = dy / Math.max(performance.now() - d.t0, 1); // px/ms, + вниз
    let exp = expanded;
    if (v > 0.35) exp = false;
    else if (v < -0.35) exp = true;
    else exp = dragPx < d.max / 2;
    drag.current = null;
    setDragPx(null);
    onExpandedChange(exp);
  }

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 bottom-0 z-sheet flex flex-col rounded-t-[26px] border-t border-line bg-card shadow-sheet dark:border-night-line dark:bg-nightcard"
      style={{
        height: `${heightVh}vh`,
        transform: dragPx != null ? `translateY(${dragPx}px)` : restingTransform,
        transition: dragPx != null ? "none" : "transform 0.42s var(--ease-drawer)",
        touchAction: "none",
      }}
    >
      {/* Ручка / заголовок — зона захвата */}
      <button
        onClick={() => onExpandedChange(!expanded)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="shrink-0 cursor-grab touch-none px-4 pb-1 pt-2.5 text-left active:cursor-grabbing"
        aria-label={expanded ? "Свернуть панель" : "Развернуть панель"}
      >
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ink/15 dark:bg-white/20" />
        {handleLabel}
      </button>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5">
        {children}
      </div>
    </div>
  );
}
