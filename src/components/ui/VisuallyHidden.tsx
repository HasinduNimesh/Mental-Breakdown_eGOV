import React from 'react';

export const VisuallyHidden: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ children, className = '', ...rest }) => (
  <span
    className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ${className}`}
    {...rest}
  >
    {children}
  </span>
);

export default VisuallyHidden;
