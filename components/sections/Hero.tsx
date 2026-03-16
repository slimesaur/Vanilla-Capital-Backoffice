import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative h-[100svh] max-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/benchmark/003.png"
          alt="Vanilla Capital"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
      </div>
    </section>
  );
}
