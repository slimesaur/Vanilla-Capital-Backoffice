/**
 * variant="light" → cream/gold icons for DARK backgrounds (footer, header)
 * variant="dark"  → dark blue/gold icons for LIGHT backgrounds (services, contact, portfolio)
 *
 * Uses <img> + encodeURI: paths contain spaces ("light mode/…"); next/image broke Chromium hydration.
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
  const rawPath =
    variant === 'dark'
      ? `/icons/dark mode/VANILLA CAPITAL_ICONE ${name}_AZUL.svg`
      : `/icons/light mode/VANILLA CAPITAL_ICONE ${name}.svg`;

  const src = encodeURI(rawPath);

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      draggable={false}
      decoding="async"
    />
  );
}
