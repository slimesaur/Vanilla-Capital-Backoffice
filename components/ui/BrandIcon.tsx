import Image from 'next/image';

/**
 * variant="light" → cream/gold icons for DARK backgrounds (footer, header)
 * variant="dark"  → dark blue/gold icons for LIGHT backgrounds (services, contact, portfolio)
 */
interface BrandIconProps {
  name: string;
  size?: number;
  variant?: 'light' | 'dark';
  className?: string;
}

export default function BrandIcon({
  name,
  size = 40,
  variant = 'light',
  className,
}: BrandIconProps) {
  const src =
    variant === 'dark'
      ? `/icons/dark mode/VANILLA CAPITAL_ICONE ${name}_AZUL.svg`
      : `/icons/light mode/VANILLA CAPITAL_ICONE ${name}.svg`;

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
