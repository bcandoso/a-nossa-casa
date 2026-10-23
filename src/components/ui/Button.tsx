import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Tone = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  tone = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: 'md' | 'sm'; children: ReactNode }) {
  const classes = [styles.button, styles[tone], size === 'sm' ? styles.sm : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
