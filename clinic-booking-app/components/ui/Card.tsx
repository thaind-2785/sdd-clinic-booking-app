import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  hover = false,
  onClick,
}: CardProps) {
  const baseStyles =
    'rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow';
  const hoverStyles = hover
    ? 'hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
    : '';
  const clickableProps = onClick
    ? {
        onClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
        role: 'button',
        tabIndex: 0,
      }
    : {};

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...clickableProps}
    >
      {children}
    </div>
  );
}
