import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/landing/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-800',
    secondary: 'bg-secondary-200 text-ink hover:bg-secondary-300',
    outline: 'border-2 border-primary text-primary hover:bg-secondary-100',
  };

  return (
    <button
      className={cn(
        'px-6 py-3 rounded-none clip-cut-corners font-semibold transition-[transform_0.1s_ease,color_0.2s,background-color_0.2s,border-color_0.2s] active:scale-[0.97]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
