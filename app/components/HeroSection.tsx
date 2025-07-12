"use client";
import React, { useState, useEffect, useRef } from 'react';

const palette = {
  bg: '#fefcf3',
  secondary: '#f5f1e8',
  border: '#e8dcc6',
  accent: '#d4a574',
  primary: '#8b4513',
  success: '#6b8e23',
  info: '#4682b4',
  warning: '#cd853f',
  text: '#2c1810',
  muted: '#8b7355',
  highlight: '#f0e68c',
  glow: '#ffd700',
};

const modernRetroFont = {
  fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Consolas", monospace',
};

// Sleek Radio Icon
const RadioIcon = ({ animate = false }) => {
  const [wave, setWave] = useState(0);
  
  useEffect(() => {
    if (animate) {
      const interval = setInterval(() => {
        setWave(prev => (prev + 1) % 3);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [animate]);

  return (
    <div className="relative group">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-50 shadow-lg border border-orange-200 transform transition-all duration-300 group-hover:scale-105">
        <svg width="48" height="36" viewBox="0 0 48 36" fill="none" className="mx-auto">
          <rect x="2" y="8" width="44" height="20" rx="6" fill="#d4a574" stroke="#8b4513" strokeWidth="2"/>
          <rect x="6" y="12" width="28" height="12" rx="3" fill="#f0e68c" stroke="#8b4513" strokeWidth="1"/>
          <rect x="38" y="12" width="6" height="6" rx="2" fill="#cd853f"/>
          <rect x="38" y="20" width="6" height="4" rx="2" fill="#4682b4"/>
          <circle cx="11" cy="18" r="2" fill="#6b8e23"/>
          <circle cx="17" cy="18" r="2" fill="#cd853f"/>
          <circle cx="23" cy="18" r="2" fill="#4682b4"/>
          <rect x="22" y="2" width="2" height="6" fill="#8b4513"/>
          <rect x="18" y="1" width="10" height="1" fill="#8b4513"/>
        </svg>
      </div>
      
      {animate && (
        <div className="absolute -top-2 -right-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute w-3 h-3 border-2 border-yellow-400 rounded-full animate-ping"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s',
                opacity: wave === i ? 0.8 : 0.3,
                right: `${i * 4}px`,
                top: `${i * 4}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Info Modal
function AboutModal({ open, onClose }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const aboutText = `Play as underground agents infiltrating retro radio broadcasts filled with AI-generated propaganda. Disrupt the signal before being discovered and kicked out. Use stealth, timing, and clever tactics to overcome the system's infenses.`;
  
  useEffect(() => {
    if (open) {
      let i = 0;
      setDisplayed('');
      const interval = setInterval(() => {
        setDisplayed(aboutText.slice(0, i));
        i++;
        if (i > aboutText.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 500);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-2xl rounded-2xl p-8 max-w-lg w-full relative transform transition-all duration-300 scale-100"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(212, 165, 116, 0.2)',
          ...modernRetroFont,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-orange-800">Mission Brief</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center text-orange-800 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="text-gray-700 leading-relaxed min-h-[120px]">
          {displayed}
          {showCursor && <span className="animate-pulse text-orange-600">|</span>}
        </div>
        
        <div className="mt-6 text-right">
          <span className="text-sm text-orange-600 opacity-70">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}

// Animated Status
function AnimatedStatus({ loading }) {
  const [dots, setDots] = useState('');
  const [blink, setBlink] = useState(true);
  
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots((d) => (d.length < 3 ? d + '.' : ''));
      }, 500);
      return () => clearInterval(interval);
    } else {
      const blinkInt = setInterval(() => setBlink((b) => !b), 800);
      return () => clearInterval(blinkInt);
    }
  }, [loading]);
  
  if (loading) return (
    <div className="flex items-center gap-2 text-orange-600">
      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
      <span>Connecting{dots}</span>
    </div>
  );
  
  return (
    <div className="flex items-center gap-2 text-green-600">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span>Ready{blink ? '_' : ''}</span>
    </div>
  );
}

// Typewriter Text
function TypewriterText({ text, speed = 50 }) {
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
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {showCursor && <span className="animate-pulse text-orange-500">|</span>}
    </span>
  );
}

// Floating Particles
function FloatingParticles() {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4 + 0.2,
    }));
    setParticles(newParticles);
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          y: (p.y + p.speed) % 100,
          opacity: 0.2 + Math.sin(Date.now() * 0.001 + p.id) * 0.3,
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
          className="absolute rounded-full bg-gradient-to-r from-yellow-300 to-orange-300"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 3}px rgba(255, 215, 0, 0.6)`,
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [radioAnimate, setRadioAnimate] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [missionHover, setMissionHover] = useState(false);
  const [riskHover, setRiskHover] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
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

  const handleInitiate = () => {
    // router.push('/terminal');
    console.log('Initiating infiltration...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 relative overflow-hidden">
      {/* Laptop Bezel */}
      <div className="absolute inset-0 p-8 md:p-10 lg:p-16">
        {/* Outer laptop shell */}
        <div 
          className="w-full h-full rounded-3xl shadow-2xl relative"
          style={{
            background: 'linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Inner bezel - made thinner */}
          <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 shadow-inner">
            {/* Screen area - made thinner */}
            <div 
              className="absolute inset-1.5 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Screen content */}
              <div className="w-full h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 relative overflow-hidden">
                {/* Floating Particles */}
                <FloatingParticles />
                
                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: `radial-gradient(circle at 25px 25px, rgba(212, 165, 116, 0.3) 2px, transparent 2px)`,
                      backgroundSize: '50px 50px',
                    }}
                  />
                </div>
                
                {/* Main Content */}
                <div className="relative z-10 min-h-full flex items-center justify-center p-6">
                  <div className="w-full max-w-4xl">
                    {/* Hero Card */}
                    <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-2xl border border-orange-200 overflow-hidden">
                      <div className="p-10 md:p-16 text-center">
                        {/* Radio Icon */}
                        <div 
                          className="mb-8 inline-block cursor-pointer"
                          onClick={() => setRadioAnimate(!radioAnimate)}
                        >
                          <RadioIcon animate={radioAnimate} />
                        </div>
                        
                        {/* Title */}
                        <div className="mb-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent flex-1"></div>
                            <button
                              onClick={() => setAboutOpen(true)}
                              className="w-8 h-8 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center text-orange-700 transition-all duration-200 hover:scale-110"
                            >
                              ℹ️
                            </button>
                            <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent flex-1"></div>
                          </div>
                        </div>
                        
                        {/* Subtitle */}
                        <div className="mb-8">
                          <p className="text-xl md:text-2xl text-orange-600 mb-2 font-medium">
                            RADIO MIRCHI
                          </p>
                          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            <TypewriterText text="Infiltrate retro radio broadcasts and disrupt AI propaganda in this terminal-styled narrative adventure." />
                          </p>
                        </div>
                        
                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
                          <div
                            className="p-6 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                            onMouseEnter={() => setMissionHover(true)}
                            onMouseLeave={() => setMissionHover(false)}
                          >
                            <div className="flex items-center justify-center mb-3">
                              <span className="text-2xl mr-2">📡</span>
                              <h3 className="text-lg font-bold text-green-700">MISSION</h3>
                            </div>
                            <p className="text-green-600 text-sm">Counter propaganda broadcasts</p>
                          </div>
                          
                          <div
                            className="p-6 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                            onMouseEnter={() => setRiskHover(true)}
                            onMouseLeave={() => setRiskHover(false)}
                          >
                            <div className="flex items-center justify-center mb-3">
                              <span className="text-2xl mr-2">⚠️</span>
                              <h3 className="text-lg font-bold text-red-700">RISK</h3>
                            </div>
                            <p className="text-red-600 text-sm">Avoid detection systems</p>
                          </div>
                        </div>
                        

                        <div className="mb-8">
                          <button
                            className="group relative px-16 py-6 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-orange-600 overflow-hidden"
                            style={{
                              backgroundColor: '#eed5a5',
                              color: '#ea580c',
                              ...modernRetroFont
                            }}
                            onMouseEnter={() => setButtonHover(true)}
                            onMouseLeave={() => setButtonHover(false)}
                            onClick={handleInitiate}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <span>▶</span>
                              <span>INITIATE INFILTRATION</span>
                            </span>
                            
                            {/* Animated background */}
                            <div 
                              className="absolute inset-0 bg-orange-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                            ></div>
                            
                            {/* Shine effect */}
                            {buttonHover && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform skew-x-12 translate-x-full animate-pulse"></div>
                            )}
                          </button>
                        </div>
                        
                        {/* Instructions */}
                        <p className="text-gray-500 text-sm">
                          Press <span className="text-orange-600 font-semibold">ENTER</span> or click to begin infiltration
                        </p>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-8 flex justify-between items-center text-sm text-gray-600 px-4">
                      <span>SYSTEM: TERMINAL-OS v3.7</span>
                      <AnimatedStatus loading={loading} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Laptop details */}
          {/* Brand logo */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs font-mono opacity-60">
            RETRO-TECH • MODEL RT-2024
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute bottom-6 left-6 w-3 h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-gray-500 shadow-inner"></div>
          
          {/* Power indicator */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg" style={{ boxShadow: '0 0 8px #4ade80' }}></div>
            <span className="text-gray-400 text-xs font-mono">PWR</span>
          </div>
        </div>
      </div>
      
      {/* About Modal */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}