import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
};

export const Container: React.FC<ContainerProps> = ({ size = 'xl', className = '', children, ...rest }) => (
  <div className={`${sizes[size]} mx-auto px-6 ${className}`} {...rest}>
    {children}
  </div>
);

export default Container;
