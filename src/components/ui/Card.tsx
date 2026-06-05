import type { PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren {
  className?: string;
}

export default function Card({ className = '', children }: CardProps) {
  return (
    <article className={`rounded-2xl border border-[#e8dcd7] bg-white shadow-sm ${className}`}>
      {children}
    </article>
  );
}
