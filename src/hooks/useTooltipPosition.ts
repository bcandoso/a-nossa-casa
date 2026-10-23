import { useCallback, useRef } from 'react';

/** Positions a tooltip via CSS variables so JSX never receives a style prop. */
export function useTooltipPosition() {
  const hostRef = useRef<HTMLDivElement>(null);

  const setPosition = useCallback((clientX: number, clientY: number) => {
    const host = hostRef.current;
    if (!host) return;
    const box = host.getBoundingClientRect();
    const x = Math.min(Math.max(8, clientX - box.left + 12), Math.max(8, box.width - 160));
    const y = Math.min(Math.max(8, clientY - box.top + 12), Math.max(8, box.height - 48));
    host.style.setProperty('--tooltip-x', `${x}px`);
    host.style.setProperty('--tooltip-y', `${y}px`);
  }, []);

  const clearPosition = useCallback(() => {
    hostRef.current?.style.removeProperty('--tooltip-x');
    hostRef.current?.style.removeProperty('--tooltip-y');
  }, []);

  return { hostRef, setPosition, clearPosition };
}
