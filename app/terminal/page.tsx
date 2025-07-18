"use client";
import React, { useRef, useState, useEffect } from 'react';
import StationPopup from '../components/StationPopup';
import AudioFeedback from '../components/AudioFeedback';
import { useRouter } from 'next/navigation';

// Add this import to your global CSS or _app.tsx if not already present:
// @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

// Consistent retro color palette
const RETRO_COLORS = {
  GREEN: '#00ff41',       // Matrix green
  AMBER: '#ffb000',       // Retro amber
  CYAN: '#00ffff',        // Bright cyan
  MAGENTA: '#ff00ff',     // Hot magenta
  ORANGE: '#ff8c00',      // Dark orange
  PURPLE: '#9932cc',      // Dark orchid
  RED: '#ff4500',         // Orange red
  BLUE: '#1e90ff',        // Dodger blue
  YELLOW: '#ffff00',      // Bright yellow
  WHITE: '#ffffff',       // Pure white
  BG_DARK: '#0a0a0a',     // Very dark
  BG_TERMINAL: '#1a1a1a', // Dark gray
  PROMPT: '#00ff41',      // Green for prompt
};

const RETRO_FONT = {
  fontFamily: "'VT323', 'Fira Mono', 'Menlo', monospace",
  fontWeight: 'normal',
  fontSize: '22px',
  letterSpacing: '1px',
};

interface Station {
  name: string;
  desc: string;
  color: string;
}

const STATIONS: Station[] = [
  { name: '95.6 FM', desc: 'SYNTHWAVE NIGHTS', color: RETRO_COLORS.PURPLE },
  { name: '101.2 FM', desc: 'RADIO MIRCHI', color: RETRO_COLORS.MAGENTA },
  { name: '88.8 FM', desc: 'CHILLWAVE ZONE', color: RETRO_COLORS.CYAN },
  { name: '107.5 FM', desc: 'NEON DREAMS', color: RETRO_COLORS.BLUE },
  { name: '93.1 FM', desc: 'RETRO WAVE', color: RETRO_COLORS.ORANGE },
];

// Retro scanlines
const RetroScanlines = () => (
  <div
    style={{
      pointerEvents: 'none',
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      background: `
        repeating-linear-gradient(
          0deg,
          rgba(0,255,65,0.03) 0px,
          rgba(0,255,65,0.03) 1px,
          transparent 1px,
          transparent 2px
        )
      `,
      mixBlendMode: 'screen',
      opacity: 0.6,
    }}
  />
);

// Typewriter effect for all text
interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  color?: string;
  onComplete?: () => void;
}

// Add a helper to generate unique IDs
let terminalLineId = 0;
function getNextTerminalLineId() {
  return `line-${terminalLineId++}-${Date.now()}`;
}

function TypewriterText({ text, speed = 30, delay = 0, color = RETRO_COLORS.GREEN, id }: TypewriterTextProps & { id: string }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const hasAnimated = React.useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 1000);
        hasAnimated.current = true;
        }
      }, speed);
    return () => clearInterval(interval);
  }, [text, speed, id]);

  const getCrtClass = (color: string) => {
    if (color === RETRO_COLORS.GREEN) return 'crt-text';
    if (color === RETRO_COLORS.CYAN) return 'crt-text-cyan';
    if (color === RETRO_COLORS.YELLOW) return 'crt-text-yellow';
    if (color === RETRO_COLORS.MAGENTA) return 'crt-text-magenta';
    if (color === RETRO_COLORS.WHITE) return 'crt-text-strong';
    return 'crt-text';
  };

  return (
    <span style={{ color }} className={getCrtClass(color)}>
      {displayed}
      {!hasAnimated.current && text && (
        <span style={{ 
          animation: 'blink 1s infinite',
          color: color,
        }} className={getCrtClass(color)}>
          █
        </span>
      )}
    </span>
  );
}

// Input field with inline cursor
interface RetroInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled: boolean;
  promptText: string;
}

const RETRO_INPUT_STYLE = {
  fontFamily: "'VT323', 'Fira Mono', 'Menlo', monospace",
  fontSize: '26px',
  color: '#fff',
  background: '#23232b',
  border: '2px solid #fff',
  borderRadius: '6px',
  padding: '10px 16px',
  outline: 'none',
  boxShadow: '0 0 0 2px #23232b',
  letterSpacing: '1px',
  caretColor: '#fff',
};

const RetroInput = ({ value, onChange, onKeyDown, disabled, promptText }: RetroInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      background: '#23232b',
      padding: '8px 12px',
      border: '2px solid #fff',
      borderRadius: '6px',
      boxShadow: '0 0 0 2px #18181b',
      ...RETRO_FONT,
    }}>
      <span style={{ 
        color: RETRO_COLORS.PROMPT, 
        marginRight: 12,
        ...RETRO_FONT,
        fontSize: '22px',
        textShadow: `0 0 5px ${RETRO_COLORS.PROMPT}`,
      }}>
        {promptText}
      </span>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          style={{
            ...RETRO_INPUT_STYLE,
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
          }}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
        {/* Custom blinking cursor - only show when focused */}
        {isFocused && (
        <span
          style={{
            position: 'absolute',
            left: `${value.length * 15}px`, // Approximate character width
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#fff',
            animation: 'blink 1s infinite',
            textShadow: `0 0 5px #fff` ,
            fontSize: '26px',
            lineHeight: 1,
            pointerEvents: 'none',
            fontFamily: "'VT323', 'Fira Mono', 'Menlo', monospace",
          }}
        >
          █
        </span>
        )}
      </div>
    </div>
  );
};



interface TerminalLine {
  id: string;
  text: string;
  color: string;
  delay: number;
}

export default function TerminalPage() {
  const router = useRouter();
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: getNextTerminalLineId(), text: '╔══════════════════════════════════════════════════════════╗', color: RETRO_COLORS.WHITE, delay: 0 },
    { id: getNextTerminalLineId(), text: '║            RADIO MIRCHI TERMINAL v3.0                    ║', color: RETRO_COLORS.WHITE, delay: 300 },
    { id: getNextTerminalLineId(), text: '║               [UNDERGROUND AGENT MODE]                   ║', color: RETRO_COLORS.WHITE, delay: 600 },
    { id: getNextTerminalLineId(), text: '╚══════════════════════════════════════════════════════════╝', color: RETRO_COLORS.WHITE, delay: 900 },
    { id: getNextTerminalLineId(), text: '', color: RETRO_COLORS.WHITE, delay: 1200 },
    { id: getNextTerminalLineId(), text: '>>> MISSION BRIEF: INFILTRATE RADIO BROADCASTS <<<', color: RETRO_COLORS.WHITE, delay: 1500 },
    { id: getNextTerminalLineId(), text: '>>> OBJECTIVE: DISRUPT AI PROPAGANDA <<<', color: RETRO_COLORS.YELLOW, delay: 1800 },
    { id: getNextTerminalLineId(), text: '>>> WARNING: AVOID DETECTION SYSTEMS <<<', color: RETRO_COLORS.RED, delay: 2100 },
    { id: getNextTerminalLineId(), text: '', color: RETRO_COLORS.WHITE, delay: 2400 },
    { id: getNextTerminalLineId(), text: 'Type "help" for available commands.', color: RETRO_COLORS.YELLOW, delay: 2700 },
    { id: getNextTerminalLineId(), text: '', color: RETRO_COLORS.WHITE, delay: 3000 },
  ]);
  
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [connectedStation, setConnectedStation] = useState<Station | null>(null);
  const [stationPopup, setStationPopup] = useState<Station | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const addLines = (newLines: Omit<TerminalLine, 'id'>[]) => {
    let delay = 0;
    newLines.forEach(line => {
      setTimeout(() => {
        setLines(prev => [...prev, { ...line, id: getNextTerminalLineId() }]);
      }, delay);
      delay += line.text ? 200 : 100;
    });
  };

  const handleCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    
    if (cmd === 'help') {
      addLines([
        { text: '╭──────────────────────────────────────────────────────────────╮', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│                  AVAILABLE COMMANDS                         │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│                                                            │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│  help         - Show this help screen                      │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│  stations     - List all radio stations                    │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│  connect <n>  - Connect to station                         │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│  disconnect   - Disconnect from station                    │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│  status       - Show connection status                     │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│  clear        - Clear terminal screen                      │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│  exit         - Exit terminal                              │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│                                                            │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '╰──────────────────────────────────────────────────────────────╯', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
      ]);
    } else if (cmd === 'stations') {
      addLines([
        { text: '╭──────────────────────────────────────────────────────────────╮', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│                        RADIO STATIONS                       │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '│                                                            │', color: RETRO_COLORS.WHITE, delay: 0 },
        ...STATIONS.map(station => ({
          text: `│  📻 ${station.name.padEnd(12)} - ${station.desc.padEnd(38)}│`,
          color: station.name === '101.2 FM' ? RETRO_COLORS.YELLOW : RETRO_COLORS.WHITE,
          delay: 0
        })),
        { text: '│                                                            │', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '╰──────────────────────────────────────────────────────────────╯', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: 'Use "connect <station>" to infiltrate broadcasts!', color: RETRO_COLORS.YELLOW, delay: 0 },
        { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
      ]);
    } else if (cmd.startsWith('connect ')) {
      const query = command.slice(8).trim().toLowerCase();
      const station = STATIONS.find(s => 
        s.name.toLowerCase().includes(query) ||
        s.desc.toLowerCase().includes(query) ||
        query.includes(s.name.toLowerCase().replace(/\s*fm/, '').trim())
      );
      
      if (station) {
        setConnectedStation(station);
        setTimeout(() => setStationPopup(station), 500);
        addLines([
          { text: `>>> INFILTRATING ${station.name} <<<`, color: RETRO_COLORS.YELLOW, delay: 0 },
          { text: `>>> FREQUENCY LOCKED <<<`, color: RETRO_COLORS.WHITE, delay: 0 },
          { text: `>>> TARGET: ${station.desc} <<<`, color: RETRO_COLORS.YELLOW, delay: 0 },
          { text: `>>> WARNING: AI SECURITY ACTIVE <<<`, color: RETRO_COLORS.RED, delay: 0 },
          { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
        ]);
      } else {
        addLines([
          { text: `>>> ERROR: STATION NOT FOUND <<<`, color: RETRO_COLORS.RED, delay: 0 },
          { text: `>>> SEARCH QUERY: ${query.toUpperCase()} <<<`, color: RETRO_COLORS.RED, delay: 0 },
          { text: 'Type "stations" to see available frequencies.', color: RETRO_COLORS.YELLOW, delay: 0 },
          { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
        ]);
      }
    } else if (cmd === 'disconnect') {
      if (connectedStation) {
        addLines([
          { text: `>>> DISCONNECTING FROM ${connectedStation.name} <<<`, color: RETRO_COLORS.YELLOW, delay: 0 },
          { text: `>>> FREQUENCY RELEASED <<<`, color: RETRO_COLORS.WHITE, delay: 0 },
          { text: `>>> MISSION STATUS: STEALTH MODE <<<`, color: RETRO_COLORS.WHITE, delay: 0 },
          { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
        ]);
        setConnectedStation(null);
      } else {
        addLines([
          { text: `>>> ERROR: NO ACTIVE CONNECTION <<<`, color: RETRO_COLORS.RED, delay: 0 },
          { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
        ]);
      }
    } else if (cmd === 'status') {
      if (connectedStation) {
        addLines([
          { text: '╭─ INFILTRATION STATUS ───────────────────────────────────────╮', color: RETRO_COLORS.WHITE, delay: 0 },
          { text: `│  STATUS: CONNECTED                                         │`, color: RETRO_COLORS.YELLOW, delay: 0 },
          { text: `│  TARGET: ${connectedStation.name.padEnd(36)} │`, color: connectedStation.name === '101.2 FM' ? RETRO_COLORS.YELLOW : RETRO_COLORS.WHITE, delay: 0 },
          { text: `│  BROADCAST: ${connectedStation.desc.padEnd(36)} │`, color: connectedStation.name === '101.2 FM' ? RETRO_COLORS.YELLOW : RETRO_COLORS.WHITE, delay: 0 },
          { text: `│  SIGNAL: STRONG                                            │`, color: RETRO_COLORS.WHITE, delay: 0 },
          { text: `│  STEALTH: ACTIVE                                           │`, color: RETRO_COLORS.WHITE, delay: 0 },
          { text: '╰──────────────────────────────────────────────────────────────╯', color: RETRO_COLORS.WHITE, delay: 0 },
          { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
        ]);
      } else {
        addLines([
          { text: '╭─ INFILTRATION STATUS ───────────────────────────────────────╮', color: RETRO_COLORS.WHITE, delay: 0 },
          { text: `│  STATUS: DISCONNECTED                                      │`, color: RETRO_COLORS.RED, delay: 0 },
          { text: `│  TARGET: NONE                                              │`, color: RETRO_COLORS.RED, delay: 0 },
          { text: `│  STEALTH: STANDBY                                          │`, color: RETRO_COLORS.YELLOW, delay: 0 },
          { text: '╰──────────────────────────────────────────────────────────────╯', color: RETRO_COLORS.WHITE, delay: 0 },
          { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
        ]);
      }
    } else if (cmd === 'clear') {
      setLines([]);
    } else if (cmd === 'exit') {
      addLines([
        { text: '>>> TERMINATING INFILTRATION <<<', color: RETRO_COLORS.RED, delay: 0 },
        { text: '>>> MISSION LOG SAVED <<<', color: RETRO_COLORS.YELLOW, delay: 0 },
        { text: '>>> KEEP THE RESISTANCE ALIVE! <<<', color: RETRO_COLORS.YELLOW, delay: 0 },
        { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
        { text: 'Session terminated. Redirecting to home...', color: RETRO_COLORS.YELLOW, delay: 0 },
        { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
      ]);
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } else {
      addLines([
        { text: `>>> UNKNOWN COMMAND: ${command.toUpperCase()} <<<`, color: RETRO_COLORS.RED, delay: 0 },
        { text: 'Type "help" for available commands.', color: RETRO_COLORS.YELLOW, delay: 0 },
        { text: '', color: RETRO_COLORS.WHITE, delay: 0 },
      ]);
    }
  };

  const handleEnter = () => {
    if (!input.trim() || typing) return;
    
    const command = input.trim();
    setLines(prev => [...prev, { 
      id: getNextTerminalLineId(),
      text: `radio-mirchi@terminal:~$ ${command}`, 
      color: RETRO_COLORS.PROMPT,
      delay: 0 
    }]);
    
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setInput('');
    setTyping(true);
    
    setTimeout(() => {
      handleCommand(command);
      setTyping(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Play key press sound for any key press
    if (typeof window !== 'undefined' && (window as any).playTerminalKeyPress) {
      (window as any).playTerminalKeyPress();
    }

    if (e.key === 'Enter') {
      handleEnter();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : -1;
        setHistoryIndex(newIndex);
        setInput(newIndex === -1 ? '' : history[newIndex]);
      }
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #fff #18181b;
        }
        *::-webkit-scrollbar {
          width: 8px;
        }
        *::-webkit-scrollbar-track {
          background: #18181b;
        }
        *::-webkit-scrollbar-thumb {
          background: #fff;
          border-radius: 4px;
        }
        .crt-text, .crt-text-strong, .crt-text-cyan, .crt-text-yellow, .crt-text-magenta {
          font-family: 'VT323', 'Fira Mono', 'Menlo', monospace !important;
          font-size: 22px !important;
          letter-spacing: 1px;
        }
      `}</style>
      
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          background: '#18181b',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <RetroScanlines />
        
        {/* Main terminal area */}
        <div
          ref={outputRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            ...RETRO_FONT,
            background: 'transparent',
            color: '#fff',
            lineHeight: 1.6,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {lines.map((line) => (
            <div key={line.id} style={{ marginBottom: line.text ? 4 : 12 }}>
              {line.text ? (
                <TypewriterText
                  id={line.id}
                  text={line.text}
                  speed={25}
                  delay={line.delay}
                  color={line.color}
                  onComplete={() => {}}
                />
              ) : (
                <div style={{ height: 20 }} />
              )}
            </div>
          ))}
          
          {connectedStation && (
            <div style={{ 
              marginTop: 16, 
              padding: '12px', 
              border: `2px solid ${connectedStation.color}`,
              borderRadius: '6px',
              background: `${connectedStation.color}20`,
              position: 'relative',
              ...RETRO_FONT,
            }}>
              <TypewriterText
                id={`connected-${connectedStation.name}`}
                key={`connected-${connectedStation.name}`}
                text={`🎵 INFILTRATING: ${connectedStation.name} - ${connectedStation.desc} 🎵`}
                speed={40}
                color={connectedStation.color}
                onComplete={() => {}}
              />
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div style={{ 
          padding: '16px 20px', 
          background: '#23232b',
          borderTop: `2px solid #fff`,
          position: 'relative',
          zIndex: 2,
        }}>
          <RetroInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={typing}
            promptText="radio-mirchi@terminal:~$"
          />
        </div>
        
        {/* Station popup */}
        <StationPopup
          isOpen={!!stationPopup}
          onClose={() => setStationPopup(null)}
          station={stationPopup}
        />
        
        {/* Audio Feedback */}
        <AudioFeedback isTerminalOpen={true} />
      </div>
    </>
  );
}