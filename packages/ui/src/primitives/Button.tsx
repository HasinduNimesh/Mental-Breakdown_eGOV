import * as React from 'react';
import clsx from 'clsx';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};
const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-blue-900 text-white hover:bg-blue-800 focus-visible:ring-blue-900 ring-offset-white',
  secondary: 'border border-blue-900 text-blue-900 bg-white hover:bg-blue-50 focus-visible:ring-blue-900 ring-offset-white',
  ghost: 'text-blue-900 hover:bg-blue-50 focus-visible:ring-blue-900 ring-offset-white',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button ref={ref} className={clsx(base, sizes[size], variants[variant], className)} {...props} />
  )
);
Button.displayName = 'Button';
