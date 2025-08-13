import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  className?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

type ButtonProps = (
  | ({ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
) &
  CommonProps;

const base = 'inline-flex items-center gap-2 rounded-md font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-700 disabled:opacity-60 disabled:cursor-not-allowed';

const sizes: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3',
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800',
  secondary: 'bg-accent-500 text-white hover:bg-accent-600',
  outline: 'border-2 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white',
  ghost: 'text-primary-700 hover:bg-bg-100',
};

export const Button: React.FC<ButtonProps> = ({
  href,
  className = '',
  children,
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  ...rest
}) => {
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={cls} {...(rest as any)}>
        {leadingIcon}
        <span>{children}</span>
        {trailingIcon}
      </Link>
    );
  }

  return (
    <button className={cls} {...(rest as any)}>
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
};

export default Button;
