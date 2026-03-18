'use client';

import { useState, useEffect } from 'react';

// Cache-busting version: bump when hero assets change to force fresh load
const HERO_VERSION = 3;
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
    <div
      className="absolute inset-0 z-0 transition-opacity duration-150"
      style={{ opacity: posterReady ? 1 : 0 }}
    >
      <div className="absolute inset-0 bg-[#2a3647]" aria-hidden="true" />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER_URL}
        fetchPriority="high"
        className="w-full h-full object-cover object-center"
        aria-label="Vanilla Capital investment consultancy background"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
    </div>
  );
}
