import React from 'react';

type AsTag = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: AsTag;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  as: Tag = 'div',
  padding = 'md',
  shadow = true,
  border = true,
  className = '',
  children,
  ...rest
}) => {
  return (
    <Tag
      className={`bg-white ${border ? 'border border-border' : ''} ${
        shadow ? 'shadow-card' : ''
      } rounded-lg ${paddings[padding]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Card;
