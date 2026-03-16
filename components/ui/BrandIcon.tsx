import Image from 'next/image';

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
