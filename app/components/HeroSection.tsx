"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LeaderboardPopup from './LeaderboardPopup';
import RegisterForm from './RegisterForm';
import { Button, Popup, Card } from 'pixel-retroui';
import RegisterSection from '../components/RegisterSection';
import { useAudio } from '../../lib/hooks/useAudio';
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
}

// Info Modal
interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

function AboutModal({ open, onClose, anchorRef }: AboutModalProps & { anchorRef?: React.RefObject<HTMLButtonElement> }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (open) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) ${visible ? 'scale(1)' : 'scale(0.95)'}`,
          zIndex: 1000,
          width: '90vw',
          maxWidth: 500,
          opacity: visible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
        className="drop-shadow-2xl"
      >
          <Popup
            isOpen={open}
            onClose={onClose}
            bg="#fefcd0"
            baseBg="#f5f1e8"
            textColor="#2c1810"
            borderColor="#e8dcc6"
            className="w-full"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl font-bold text-orange-800">Mission Brief</span>
            </div>
            <div>
              Play as underground agents infiltrating retro radio broadcasts filled with AI-generated propaganda. Disrupt the signal before being discovered and kicked out. Use stealth, timing, and clever tactics to overcome the system's defenses.
            </div>
            <div className="mt-4 text-right">
              <span className="text-sm text-orange-600 opacity-70">Press ESC to close</span>
            </div>
          </Popup>
        </div>
      </>
    );
  }

// Animated Status
interface AnimatedStatusProps {
  loading: boolean;
}

function AnimatedStatus({ loading }: AnimatedStatusProps) {
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
interface TypewriterTextProps {
  text: string;
  speed?: number;
}

function TypewriterText({ text, speed = 50 }: TypewriterTextProps) {
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

export default function UpdatedHeroSection({ onInitiateBreach }: { onInitiateBreach: () => void }) {
  const router = useRouter();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [radioAnimate, setRadioAnimate] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [missionHover, setMissionHover] = useState(false);
  const [riskHover, setRiskHover] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const { play: playSelect } = useAudio('/sfx/select.mp3');
  const { toggle: toggleMusic, isPlaying: isMusicPlaying, stop: stopMusic } = useAudio('/sfx/music.mp3', { loop: true });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup music when component unmounts
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);

  // Expose global music stop function
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).stopAllMusic = stopMusic;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).stopAllMusic;
      }
    };
  }, [stopMusic]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (aboutOpen) setAboutOpen(false);
        if (leaderboardOpen) setLeaderboardOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aboutOpen, leaderboardOpen]);

  const handleInitiate = () => {
    playSelect(); // Play select sound
    setTimeout(() => {
      onInitiateBreach();
    }, 120);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 relative overflow-hidden">
      {/* Laptop Bezel */}
      <div className="absolute inset-0 p-4 md:p-8 lg:p-12">
        {/* Outer laptop shell */}
        <div 
          className="w-full h-full rounded-3xl shadow-2xl relative"
          style={{
            background: 'linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Inner bezel */}
          <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 shadow-inner">
            {/* Screen area */}
            <div 
              className="absolute inset-1.5 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Screen content */}
              <div className="w-full h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 relative overflow-hidden">
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
                
                {/* Main Content - Fixed Layout */}
                <div className="relative z-10 min-h-full flex flex-col">
                  {/* Content Container */}
                  <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                  <div className="w-full max-w-4xl">
                    {/* Hero Card */}
                      <Card
                        bg="#fffbe6"
                        textColor="#ea580c"
                        borderColor="#e8dcc6"
                        shadowColor="#f5e7c6"
                        className="rounded-3xl shadow-2xl border overflow-hidden p-0"
                      >
                        <div className="p-6 md:p-8 lg:p-10 text-center">
                        {/* Radio Icon */}
                        <div 
                            className="mb-6 flex justify-center relative"
                          onClick={() => {
                            toggleMusic(); // Toggle music play/pause
                            setRadioAnimate(!radioAnimate);
                          }}
                        >
                            <img 
                              src="/radio.png" 
                              alt="Radio Icon" 
                              className={`w-16 h-12 md:w-20 md:h-16 lg:w-24 lg:h-20 object-contain drop-shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200 ${
                                isMusicPlaying ? 'animate-pulse' : ''
                              }`}
                            />
                            {isMusicPlaying && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                            )}
                        </div>
                        
                          {/* Title Section */}
                          <div className="mb-6">
                            {/* Action Buttons Row */}
                            <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
                              <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent flex-1 max-w-32"></div>
                              <div className="flex gap-3">
                                <button
                                  ref={infoButtonRef}
                                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center text-orange-700 transition-all duration-200 hover:scale-110"
                                  onClick={() => setAboutOpen((v) => !v)}
                                  title="Mission Brief"
                                >
                                  <img src="/info.png" alt="Info" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                                </button>
                            <button
                                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-200 hover:bg-yellow-300 flex items-center justify-center text-yellow-700 transition-all duration-200 hover:scale-110"
                                  onClick={() => setLeaderboardOpen(true)}
                                  title="Leaderboard"
                            >
                                  <img src="/trophy.png" alt="Leaderboard" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                            </button>
                          </div>
                              <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent flex-1 max-w-32"></div>
                        </div>
                            
                            {/* Main Title */}
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-600 mb-3" style={{
                              ...modernRetroFont,
                              textShadow: '0 0 10px rgba(234, 88, 12, 0.5), 0 0 20px rgba(234, 88, 12, 0.3)',
                              letterSpacing: '0.1em',
                              fontWeight: '900'
                            }}>
                              RADIO MIRCHI
                            </h1>
                        
                        {/* Subtitle */}
                            <div className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            <TypewriterText text="Infiltrate retro radio broadcasts and disrupt AI propaganda in this terminal-styled narrative adventure." />
                            </div>
                        </div>
                        
                        {/* Feature Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 max-w-2xl mx-auto">
                          <div
                            onMouseEnter={() => setMissionHover(true)}
                            onMouseLeave={() => setMissionHover(false)}
                            >
                              <Card
                                bg="#e6fbe6"
                                textColor="#14532d"
                                borderColor="#22c55e"
                                shadowColor="#bbf7d0"
                                className="p-4 md:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer h-full"
                          >
                            <div className="flex items-center justify-center mb-3">
                                  <img src="/flag.png" alt="Mission" className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 object-contain" />
                                  <h3 className="text-base md:text-lg font-bold" style={{ color: '#15803d' }}>MISSION</h3>
                                </div>
                                <p className="text-green-700 text-sm md:text-base">Counter propaganda broadcasts</p>
                              </Card>
                            </div>
                          <div
                            onMouseEnter={() => setRiskHover(true)}
                            onMouseLeave={() => setRiskHover(false)}
                            >
                              <Card
                                bg="#fef2f2"
                                textColor="#991b1b"
                                borderColor="#ef4444"
                                shadowColor="#fecaca"
                                className="p-4 md:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer h-full"
                          >
                            <div className="flex items-center justify-center mb-3">
                                  <img src="/danger.png" alt="Risk" className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 object-contain" />
                                  <h3 className="text-base md:text-lg font-bold" style={{ color: '#b91c1c' }}>RISK</h3>
                            </div>
                                <p className="text-red-700 text-sm md:text-base">Avoid detection systems</p>
                              </Card>
                          </div>
                        </div>
                        
                          {/* Main Action Button */}
                          <div className="mb-6">
                            <Button
                              color="primary"
                              className="px-8 md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 text-lg md:text-xl font-bold drop-shadow-lg"
                              style={{ fontFamily: 'inherit' }}
                            onClick={handleInitiate}
                          >
                              <span className="flex items-center gap-2">
                              <span>▶</span>
                              <span>INITIATE INFILTRATION</span>
                            </span>
                            </Button>
                        </div>
                        
                        {/* Instructions */}
                          <p className="text-gray-500 text-xs md:text-sm">
                          Press <span className="text-orange-600 font-semibold">ENTER</span> or click to begin infiltration
                        </p>
                        </div>
                      </Card>
                      </div>
                    </div>
                    
                  {/* Footer - Fixed at bottom */}
                  <div className="p-4 md:p-6">
                    <div className="flex justify-between items-center text-xs md:text-sm text-gray-600">
                      <span style={modernRetroFont}>SYSTEM: TERMINAL-OS v3.7</span>
                      <AnimatedStatus loading={loading} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Laptop details */}
          <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs font-mono opacity-60">
            RETRO-TECH • MODEL RT-2024
          </div>
          <div className="absolute top-4 md:top-6 left-4 md:left-6 w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute top-4 md:top-6 right-4 md:right-6 w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute top-3 md:top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 md:gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400 animate-pulse shadow-lg" style={{ boxShadow: '0 0 8px #4ade80' }}></div>
            <span className="text-gray-400 text-xs font-mono">PWR</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} anchorRef={infoButtonRef as React.RefObject<HTMLButtonElement>} />
      <LeaderboardPopup isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
    </div>
  );
}