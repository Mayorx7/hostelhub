import type { PropsWithChildren } from 'react';
import Container from './Container';

interface SectionProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function Section({ title, subtitle, className = '', children }: SectionProps) {
  return (
    <section className={`py-12 sm:py-16 ${className}`}>
      <Container>
        {title ? (
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
            {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
