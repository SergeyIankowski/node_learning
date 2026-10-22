import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'default' | 'primary' | 'ghost';
type Size = 'md' | 'sm';

function classes(variant: Variant, size: Size, extra?: string) {
  return [styles.button, variant !== 'default' && styles[variant], size === 'sm' && styles.sm, extra]
    .filter(Boolean)
    .join(' ');
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({ variant = 'default', size = 'md', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={classes(variant, size, className)} {...rest} />;
}

type LinkButtonProps = LinkProps & { variant?: Variant; size?: Size; disabled?: boolean };

/** Router link styled as a button. Renders a disabled button when `disabled`. */
export function LinkButton({
  variant = 'default',
  size = 'md',
  className,
  disabled,
  children,
  ...rest
}: LinkButtonProps) {
  if (disabled) {
    return (
      <button type="button" disabled className={classes(variant, size, className)}>
        {children}
      </button>
    );
  }
  return (
    <Link className={classes(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
