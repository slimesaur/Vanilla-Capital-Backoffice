import Image from 'next/image';

// Hero image dimensions: 1409×793 (aspect ratio ~1.78)
const ASPECT_RATIO = 1409 / 793;

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${ASPECT_RATIO}` }}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/benchmark/003.png"
          alt="Vanilla Capital"
          fill
          className="object-contain object-center scale-[1.02]"
          priority
          quality={90}
        />
      </div>
    </section>
  );
}
