import React from 'react';

export default function GlitchLogo({ color = '#222' }: { color?: string }) {
  return (
    <h1
      className="glitch text-center text-4xl md:text-6xl leading-tight mb-4"
      style={{ color, textShadow: `0 0 8px ${color}, 2px 0 2px #ff005a, -2px 0 2px #00fff9` }}
    >
      RADIO<br />MIRCHI
    </h1>
  );
} 