import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  to?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
}

const baseStyle =
  'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors';

const variants = {
  primary: 'bg-[#5C2200] text-white hover:bg-[#7A3010]',
  secondary: 'border border-[#d6c2b7] bg-white text-[#5C2200] hover:bg-orange-50',
};

export default function Button({
  children,
  to,
  variant = 'primary',
  className = '',
  type = 'button',
  onClick,
}: ButtonProps) {
  const classes = `${baseStyle} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
