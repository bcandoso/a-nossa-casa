import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDatePicker } from '@/hooks/useDatePicker';
import { formatDate, formatMonthLong } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import fieldStyles from './TextField.module.css';
import styles from './DateField.module.css';

export function DateField({
  id,
  label,
  value,
  onChange,
  align = 'left',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (iso: string) => void;
  align?: 'left' | 'right';
}) {
  const picker = useDatePicker(value, onChange);
  const monthLabel = formatMonthLong(picker.view.year, picker.view.month);

  return (
    <div className={fieldStyles.field} ref={picker.rootRef}>
      <label className={fieldStyles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.anchor}>
        <button
          id={id}
          type="button"
          className={[fieldStyles.input, styles.trigger, picker.open ? styles.triggerOpen : ''].join(' ')}
          onClick={picker.toggle}
          aria-haspopup="dialog"
          aria-expanded={picker.open}
        >
          <Calendar size={14} className={styles.triggerIcon} aria-hidden />
          <span className={value ? styles.value : styles.placeholder}>
            {value ? formatDate(value) : pt.datePicker.placeholder}
          </span>
        </button>

        {picker.open ? (
          <div
            ref={picker.popoverRef}
            className={[styles.popover, align === 'right' ? styles.right : styles.left].join(' ')}
            role="dialog"
            aria-label={pt.datePicker.dialog}
          >
            <div className={styles.nav}>
              <button type="button" className={styles.navButton} onClick={picker.prevMonth} aria-label={pt.datePicker.prevMonth}>
                <ChevronLeft size={16} />
              </button>
              <span className={styles.month}>{monthLabel}</span>
              <button type="button" className={styles.navButton} onClick={picker.nextMonth} aria-label={pt.datePicker.nextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className={styles.weekdays}>
              {pt.datePicker.weekdays.map((weekday) => (
                <span key={weekday} className={styles.weekday}>
                  {weekday}
                </span>
              ))}
            </div>

            <div className={styles.grid}>
              {picker.grid.map((cell, index) =>
                cell.iso ? (
                  <button
                    key={cell.iso}
                    type="button"
                    className={[
                      styles.day,
                      cell.iso === value ? styles.selected : '',
                      cell.iso === picker.today ? styles.today : '',
                    ].join(' ')}
                    onClick={() => picker.select(cell.iso as string)}
                    aria-pressed={cell.iso === value}
                    aria-label={formatDate(cell.iso)}
                  >
                    {cell.day}
                  </button>
                ) : (
                  <span key={`empty-${index}`} className={styles.empty} />
                ),
              )}
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.link} onClick={() => picker.select(picker.today)}>
                {pt.datePicker.today}
              </button>
              {value ? (
                <button type="button" className={styles.link} onClick={() => picker.select('')}>
                  {pt.datePicker.clear}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
