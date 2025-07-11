"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const palette = {
  bg: '#fffbe9',
  border: '#cab588',
  accent: '#cf854b',
  warning: '#a33f35',
  dark: '#362d23',
  green: '#4b572f',
  teal: '#5c9288',
  yellow: '#eed5a5',
  crt: '#39ff14',
  bezel: '#1a1a1a',
  bezelLight: '#333333',
  bezelDark: '#0d0d0d',
};

const pixelFont = {
  fontFamily: '"Courier New", "Press Start 2P", monospace',
};

// Enhanced Pixel-art radio SVG with animation
const PixelRadio = ({ animate = false }: { animate?: boolean }) => {
  const [wave, setWave] = useState(0);
  
  useEffect(() => {
    if (animate) {
      const interval = setInterval(() => {
        setWave(prev => (prev + 1) % 3);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [animate]);

  return (
    <div className="relative">
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
        <rect x="4" y="12" width="56" height="28" rx="4" fill="#cab588" stroke="#362d23" strokeWidth="3"/>
        <rect x="10" y="18" width="36" height="16" rx="2" fill="#eed5a5" stroke="#362d23" strokeWidth="2"/>
        <rect x="50" y="18" width="8" height="8" rx="2" fill="#cf854b" stroke="#362d23" strokeWidth="2"/>
        <rect x="50" y="28" width="8" height="6" rx="2" fill="#5c9288" stroke="#362d23" strokeWidth="2"/>
        <rect x="14" y="22" width="8" height="4" rx="1" fill="#4b572f"/>
        <rect x="24" y="22" width="8" height="4" rx="1" fill="#a33f35"/>
        <rect x="34" y="22" width="8" height="4" rx="1" fill="#cf854b"/>
        <rect x="14" y="28" width="28" height="4" rx="1" fill="#cab588"/>
        <rect x="8" y="8" width="4" height="8" fill="#362d23"/>
        <rect x="52" y="8" width="4" height="8" fill="#362d23"/>
        {/* Antenna with signal waves */}
        <rect x="30" y="4" width="4" height="8" fill="#362d23"/>
        <rect x="28" y="2" width="8" height="2" fill="#362d23"/>
      </svg>
      {/* Signal waves */}
      {animate && (
        <div className="absolute -top-2 -right-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute w-4 h-4 border-2 border-green-400 rounded-full animate-ping"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s',
                opacity: wave === i ? 0.8 : 0.3,
                right: `${i * 6}px`,
                top: `${i * 6}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced icons with hover effects
const MissionIcon = ({ animate = false }: { animate?: boolean }) => (
  <span 
    style={{
      fontSize: 20, 
      marginRight: 6,
      display: 'inline-block',
      transform: animate ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
      transition: 'transform 0.2s ease',
      filter: animate ? 'drop-shadow(0 0 4px #4b572f)' : 'none',
    }}
  >
    📡
  </span>
);

const RiskIcon = ({ animate = false }: { animate?: boolean }) => (
  <span 
    style={{
      fontSize: 20, 
      marginRight: 6,
      display: 'inline-block',
      transform: animate ? 'scale(1.2)' : 'scale(1)',
      transition: 'transform 0.2s ease',
      filter: animate ? 'drop-shadow(0 0 4px #a33f35)' : 'none',
    }}
  >
    ⚠️
  </span>
);

// Enhanced Info modal with better animations
function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const aboutText = `Play as underground agents infiltrating retro radio broadcasts filled with AI-generated propaganda. Disrupt the signal before being discovered and kicked out. Use stealth, timing, and clever tactics to overcome the system's defenses.`;
  
  useEffect(() => {
    if (open) {
      let i = 0;
      setDisplayed('');
      const interval = setInterval(() => {
        setDisplayed(aboutText.slice(0, i));
        i++;
        if (i > aboutText.length) {
          clearInterval(interval);
          setShowCursor(false);
        }
      }, 25);
      return () => clearInterval(interval);
    }
  }, [open]);

  useEffect(() => {
    if (open && displayed.length < aboutText.length) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }
  }, [open, displayed.length]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: 'blur(4px)',
        animation: open ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <div 
        className="bg-opacity-95 border-2 shadow-2xl p-6 max-w-md w-full relative"
        style={{
          background: palette.bg,
          borderColor: palette.teal,
          boxShadow: `0 0 32px 8px ${palette.teal}44, 0 0 0 4px ${palette.border}`,
          borderRadius: 16,
          ...pixelFont,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <span style={{color: palette.teal, fontWeight: 'bold', fontSize: 16}}>
            // CLASSIFIED INTEL
          </span>
          <button 
            aria-label="Close" 
            onClick={onClose}
            className="hover:scale-110 transition-transform duration-200"
            style={{
              background: 'none',
              border: 'none',
              color: palette.warning,
              fontWeight: 'bold',
              fontSize: 18,
              cursor: 'pointer',
              ...pixelFont
            }}
          >
            ✕
          </button>
        </div>
        <div style={{color: palette.dark, fontSize: 14, lineHeight: 1.7, minHeight: 120}}>
          {displayed}
          {showCursor && <span className="animate-pulse">|</span>}
          {!displayed && <span style={{opacity: 0.3}}>{aboutText}</span>}
        </div>
        <div className="mt-4 text-right">
          <span style={{color: palette.accent, fontSize: 12, opacity: 0.8}}>
            [PRESS ESC TO CLOSE]
          </span>
        </div>
      </div>
    </div>
  );
}

// Enhanced Info icon with pulse effect
function InfoTooltip({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  
  return (
    <span 
      className="relative inline-block ml-3 cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <span
        tabIndex={0}
        aria-label="About the Game"
        style={{
          color: palette.teal,
          fontSize: 24,
          verticalAlign: 'middle',
          userSelect: 'none',
          transform: hover ? 'scale(1.2) rotate(15deg)' : 'scale(1)',
          transition: 'transform 0.2s ease',
          filter: hover ? `drop-shadow(0 0 8px ${palette.teal})` : 'none',
        }}
      >
        ℹ️
      </span>
      {hover && (
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-teal-400 rounded-full animate-ping opacity-75" />
      )}
    </span>
  );
}

// Enhanced animated status
function AnimatedStatus({ loading }: { loading: boolean }) {
  const [dots, setDots] = useState('');
  const [blink, setBlink] = useState(true);
  
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots((d) => (d.length < 8 ? d + '█' : ''));
      }, 150);
      return () => clearInterval(interval);
    } else {
      const blinkInt = setInterval(() => setBlink((b) => !b), 600);
      return () => clearInterval(blinkInt);
    }
  }, [loading]);
  
  if (loading) return (
    <span className="flex items-center gap-1">
      <span className="animate-spin">⚡</span>
      Connecting... [{dots.padEnd(8, '▒')}]
    </span>
  );
  return (
    <span className="flex items-center gap-1">
      <span style={{color: palette.crt}}>●</span>
      STATUS: READY{blink ? '_' : ' '}
    </span>
  );
}

// Enhanced flicker text with better timing
function FlickerText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setShowCursor(false);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="flex items-center">
      {displayed || <span style={{ opacity: 0.3 }}>{text}</span>}
      {showCursor && <span className="animate-pulse ml-1">|</span>}
    </span>
  );
}

// Enhanced scanline overlay
const ScanlineOverlay = () => (
  <div className="pointer-events-none absolute inset-0 z-10 rounded-lg overflow-hidden">
    <div
      className="absolute inset-0 animate-pulse"
      style={{
        background: 'repeating-linear-gradient(0deg, rgba(57,255,20,0.12) 0px, rgba(57,255,20,0.12) 1px, transparent 1px, transparent 3px)',
        mixBlendMode: 'screen',
      }}
    />
  </div>
);

// Particle effect for background
function ParticleField() {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setParticles(newParticles);
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          y: (p.y + p.speed) % 100,
          opacity: 0.1 + Math.sin(Date.now() * 0.001 + p.id) * 0.2,
        }))
      );
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-teal-400"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${palette.teal}`,
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [missionHover, setMissionHover] = useState(false);
  const [riskHover, setRiskHover] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [radioAnimate, setRadioAnimate] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && aboutOpen) {
        setAboutOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aboutOpen]);

  // Enhanced beep sound with multiple tones
  const playBeep = (type = 'default') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.value = type === 'hover' ? 660 : 880;
      gainNode.gain.value = 0.1;
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        ctx.close();
      }, type === 'hover' ? 60 : 120);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // Play beep on button hover/click
  const handleInitiate = () => {
    playBeep();
    setTimeout(() => router.push('/terminal'), 120); // slight delay for beep
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Full screen bezel */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${palette.bezelDark} 0%, ${palette.bezel} 40%, ${palette.bezelLight} 60%, ${palette.bezel} 100%)`,
          boxShadow: `inset 0 0 100px 20px ${palette.bezelDark}`,
        }}
      >
        {/* Bezel details */}
        <div className="absolute inset-4 border-4 border-gray-600 rounded-3xl shadow-inner">
          <div className="absolute inset-2 border-2 border-gray-500 rounded-2xl">
            {/* Corner screws */}
            {[
              { top: 20, left: 20 },
              { top: 20, right: 20 },
              { bottom: 20, left: 20 },
              { bottom: 20, right: 20 },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full border-2 border-gray-400 bg-gray-700 shadow-inner"
                style={pos}
              />
            ))}
            
            {/* Brand label */}
            <div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm font-mono opacity-60"
              style={{ letterSpacing: '0.15em' }}
            >
              RETRO-TERM XK-7 // Est. 1986
            </div>
            
            {/* Power indicator */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg animate-pulse" 
                   style={{ boxShadow: `0 0 12px ${palette.crt}` }} />
              <span className="text-gray-400 text-xs font-mono">PWR</span>
            </div>
            
            {/* Screen area */}
            <div 
              className="absolute inset-8 rounded-2xl overflow-hidden"
              style={{
                background: `radial-gradient(ellipse at 50% 30%, ${palette.bg} 30%, ${palette.yellow} 100%)`,
                boxShadow: `inset 0 0 50px 10px rgba(0,0,0,0.3)`,
              }}
            >
              {/* Particle field */}
              <ParticleField />
              
              {/* Main content */}
              <div className="relative z-10 h-full flex items-center justify-center p-8">
                <div className="w-full max-w-4xl">
                  {/* Global scanlines */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-20 opacity-30"
                    style={{
                      background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(57,255,20,0.1) 2px, rgba(57,255,20,0.1) 4px)',
                    }}
                  />
                  
                  <section
                    className="mx-auto w-full max-w-3xl px-8 py-12 flex flex-col items-center gap-8 border-4 shadow-2xl relative"
                    style={{
                      background: `${palette.bg}f0`,
                      borderColor: palette.border,
                      boxShadow: `0 0 40px 12px ${palette.teal}66, 0 0 0 6px ${palette.border}`,
                      borderRadius: 20,
                      backdropFilter: 'blur(2px)',
                      ...pixelFont,
                    }}
                  >
                    <div
                      className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
                      onClick={() => setRadioAnimate(!radioAnimate)}
                    >
                      <PixelRadio animate={radioAnimate} />
                    </div>
                    
                    <div className="flex flex-row items-center gap-3">
                      <h1
                        className="text-4xl md:text-6xl text-center font-bold"
                        style={{
                          color: palette.dark,
                          letterSpacing: '0.1em',
                          textShadow: `0 0 12px ${palette.teal}, 0 3px ${palette.yellow}, 0 0 20px ${palette.crt}33`,
                          ...pixelFont,
                        }}
                      >
                        RADIO MIRCHI
                      </h1>
                      <InfoTooltip onClick={() => setAboutOpen(true)} />
                    </div>
                    
                    <div className="text-xl md:text-2xl mb-4 animate-pulse" 
                         style={{ color: palette.accent, ...pixelFont }}>
                      TERMINAL FREQUENCY v2.1
                    </div>
                    
                    <div className="text-center text-lg md:text-xl mb-6 leading-relaxed" 
                         style={{ 
                           color: palette.green, 
                           textShadow: `0 1px ${palette.yellow}`, 
                           ...pixelFont 
                         }}>
                      Infiltrate retro radio broadcasts and disrupt AI propaganda<br />
                      in this terminal-styled narrative adventure.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
                      <div
                        className="border-3 p-6 text-center flex flex-col items-center justify-center group  transform transition-all duration-200 hover:scale-105"
                        tabIndex={0}

                        onMouseLeave={() => setMissionHover(false)}
                        style={{
                          borderColor: palette.teal,
                          background: missionHover ? '#f0f8f0' : '#f8f8e8',
                          color: palette.green,
                          ...pixelFont,
                          borderRadius: 12,
                          boxShadow: missionHover ? `0 0 20px ${palette.teal}66` : '0 0 0 0 transparent',
                        }}
                      >
                        <span style={{ color: palette.accent, marginBottom: 8, fontWeight: 'bold', ...pixelFont }}>
                          <MissionIcon animate={missionHover} />MISSION
                        </span>
                        <span style={{ fontSize: 16 }}>Counter propaganda broadcasts</span>
                      </div>
                      
                      <div
                        className="border-3 p-6 text-center flex flex-col items-center justify-center group  transform transition-all duration-200 hover:scale-105"
                        tabIndex={0}

                        onMouseLeave={() => setRiskHover(false)}
                        style={{
                          borderColor: palette.warning,
                          background: riskHover ? '#fff0f0' : '#fff3f0',
                          color: palette.warning,
                          ...pixelFont,
                          borderRadius: 12,
                          boxShadow: riskHover ? `0 0 20px ${palette.warning}66` : '0 0 0 0 transparent',
                        }}
                      >
                        <span style={{ color: palette.warning, marginBottom: 8, fontWeight: 'bold', ...pixelFont }}>
                          <RiskIcon animate={riskHover} />RISK
                        </span>
                        <span style={{ fontSize: 16, color: palette.dark }}>Avoid detection systems</span>
                      </div>
                    </div>
                    
                    <div className="relative w-full max-w-lg">
                      <button
                        className="w-full text-2xl font-mono border-4 flex items-center justify-center gap-3 relative overflow-hidden group"
                        style={{
                          background: buttonHover ? `linear-gradient(135deg, ${palette.crt} 0%, #2fff2f 100%)` : palette.crt,
                          color: '#101014',
                          borderColor: palette.teal,
                          boxShadow: buttonHover 
                            ? `0 0 30px 6px ${palette.crt}cc, 0 0 0 4px ${palette.border}` 
                            : `0 0 20px 3px ${palette.crt}99, 0 0 0 4px ${palette.border}`,
                          borderRadius: 12,
                          padding: '1.5rem 2rem',
                          letterSpacing: '0.1em',
                          cursor: 'pointer',
                          ...pixelFont,
                          filter: buttonHover ? 'drop-shadow(0 0 12px #39ff14)' : 'drop-shadow(0 0 8px #39ff14cc)',
                          transform: buttonHover ? 'scale(1.05) translateY(-3px)' : 'scale(1)',
                          transition: 'all 0.2s cubic-bezier(0.4, 2, 0.6, 1)',
                        }}
                        onMouseEnter={() => {
                          setButtonHover(true);
                        }}
                        onMouseLeave={() => setButtonHover(false)}
                        onClick={handleInitiate}
                      >
                        <span className="relative z-10">
                          <FlickerText text={'> INITIATE INFILTRATION'} />
                        </span>
                        <ScanlineOverlay />
                        {buttonHover && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform skew-x-12 translate-x-full group-hover:animate-pulse" />
                        )}
                      </button>
                    </div>
                    
                    <div className="text-center mt-4 text-base animate-pulse" 
                         style={{ color: palette.dark, opacity: 0.8, ...pixelFont }}>
                      Press <span style={{ color: palette.accent, fontWeight: 'bold' }}>ENTER</span> or click to begin infiltration
                    </div>
                  </section>
                  
                  <footer
                    className="w-full max-w-3xl mx-auto border-t border-dashed mt-8 pt-4 flex flex-row justify-between items-center text-sm"
                    style={{ 
                      borderColor: palette.teal, 
                      color: palette.dark, 
                      opacity: 0.7, 
                      ...pixelFont 
                    }}
                  >
                    <span>SYSTEM: TERMINAL-OS v3.7</span>
                    <AnimatedStatus loading={loading} />
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}