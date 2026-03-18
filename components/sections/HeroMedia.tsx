'use client';

import { useState, useEffect } from 'react';

// Per-deploy cache buster - ensures fresh load, no old image flash
const HERO_VERSION = process.env.NEXT_PUBLIC_HERO_VERSION || '4';
const POSTER_URL = `/hero/HERO001.png?v=${HERO_VERSION}`;
const VIDEO_URL = `/hero/HERO002.mp4?v=${HERO_VERSION}`;

export default function HeroMedia() {
  const [posterReady, setPosterReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setPosterReady(true);
    img.onerror = () => setPosterReady(true);
    img.src = POSTER_URL;
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <div
        className="absolute inset-0 bg-[#2a3647] transition-opacity duration-200"
        style={{ opacity: posterReady ? 0 : 1 }}
        aria-hidden="true"
      />
      {posterReady && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_URL}
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-label="Vanilla Capital investment consultancy background"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
