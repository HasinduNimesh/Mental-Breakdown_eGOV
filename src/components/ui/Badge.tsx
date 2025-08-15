import React from 'react';

export type BadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

const tones: Record<BadgeTone, string> = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800',
  brand: 'bg-primary-100 text-primary-800',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  rounded?: 'sm' | 'md' | 'full';
}

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  rounded = 'full',
  className = '',
  children,
  ...rest
}) => (
  <span
    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium ${
      rounded === 'full' ? 'rounded-full' : rounded === 'md' ? 'rounded-md' : 'rounded'
    } ${tones[tone]} ${className}`.trim()}
    {...rest}
  >
    {children}
  </span>
);

export default Badge;
