import React from 'react';

export default function AboutSection() {
  return (
    <section className="mt-12 max-w-xl mx-auto text-center">
      <h2 className="section-title">About the Game</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4 justify-center mb-2">
          {/* Example SVG icons, replace with your own as needed */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="16" rx="2" fill="#39ff14"/><rect x="8" y="12" width="16" height="8" rx="1" fill="#101014"/></svg>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" fill="#39ff14"/><rect x="14" y="10" width="4" height="12" fill="#101014"/></svg>
        </div>
        <p className="text-[#baffc9] text-sm leading-relaxed" style={{fontFamily: 'inherit'}}>
          Play as underground agents infiltrating windows via retro-style <span className="text-[#39ff14] font-bold">radio broadcasts</span> filled with AI-generated propaganda. Disrupt the signal before being discovered and kicked out.
        </p>
      </div>
    </section>
  );
} 