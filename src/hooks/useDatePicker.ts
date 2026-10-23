import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { monthGrid, parseYearMonth, shiftMonth, todayIso, type YearMonth } from '@/components/ui/calendar';

export function useDatePicker(value: string, onChange: (iso: string) => void) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<YearMonth>(() => parseYearMonth(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => todayIso(), []);

  useEffect(() => {
    if (open) setView(parseYearMonth(value));
  }, [open, value]);

  useEffect(() => {
    if (open) popoverRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = useCallback(
    (iso: string) => {
      onChange(iso);
      setOpen(false);
    },
    [onChange],
  );

  return {
    rootRef,
    popoverRef,
    open,
    toggle: () => setOpen((current) => !current),
    view,
    grid: useMemo(() => monthGrid(view), [view]),
    today,
    prevMonth: () => setView((current) => shiftMonth(current, -1)),
    nextMonth: () => setView((current) => shiftMonth(current, 1)),
    select,
  };
}
