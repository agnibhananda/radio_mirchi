"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Popup, Input } from 'pixel-retroui';

const CRT_GREEN = '#39ff14';
const CRT_BG = '#101c11';
const CRT_AMBER = '#ffb347';
const CRT_FONT = {
  fontFamily: '"Press Start 2P", "VT323", monospace',
};

const STATIONS = [
  { name: '95.6 FM', desc: 'Synthwave' },
  { name: '101.2 FM', desc: 'Mirchi' },
  { name: '88.8 FM', desc: 'Chillwave ' },
];

// Scanline overlay
const Scanlines = () => (
  <div
    aria-hidden
    style={{
      pointerEvents: 'none',
      position: 'absolute',
      inset: 0,
      zIndex: 2,
      background:
        'repeating-linear-gradient(0deg, rgba(57,255,20,0.08) 0px, rgba(57,255,20,0.08) 1px, transparent 1px, transparent 4px)',
      mixBlendMode: 'screen',
      opacity: 0.25,
    }}
  />
);

// Typewriter effect for output
function Typewriter({ text, speed = 18, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        if (onDone) onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onDone]);
  return <span>{displayed}</span>;
}

// Blinking block cursor
function BlinkingBlock() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 500);
    return () => clearInterval(t);
  }, []);
  return <span style={{ background: CRT_GREEN, color: CRT_GREEN, marginLeft: 2, display: 'inline-block', width: 13, height: 18, verticalAlign: 'middle', borderRadius: 2, opacity: on ? 1 : 0 }}>█</span>;
}

export default function TerminalPage() {
  const [lines, setLines] = useState<string[]>([
    'Welcome to RADIO MIRCHI Terminal Frequency v2.1',
    'Type `help` to see available commands.',
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [connectedStation, setConnectedStation] = useState<string | null>(null);
  const [stationPopup, setStationPopup] = useState<{ name: string; desc: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Focus input on mount and after every render
  useEffect(() => {
    inputRef.current?.focus();
  });

  // Auto-scroll to bottom on new output
  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [lines]);

  // Handle enter
  const handleEnter = () => {
    if (!input.trim()) return;
    setLines((prev) => [...prev, `radio-mirchi@terminal:~$ ${input}`]);
    setHistory((prev) => [...prev, input]);
    setInput('');
    setTyping(true);
    // Command logic
    setTimeout(() => {
      let output = '';
      const lower = input.trim().toLowerCase();
      if (lower === 'help') {
        output = 'Available commands: help, show stations, connect <station>, clear, exit';
      } else if (lower === 'show stations') {
        output = 'Available stations:\n' + STATIONS.map(s => `- ${s.name}: ${s.desc}`).join('\n');
      } else if (lower.startsWith('connect ')) {
        const station = input.slice(8).trim().toLowerCase();
        const found = STATIONS.find(s => {
          const freq = s.name.toLowerCase().replace(/\s*fm/, '').trim();
          return (
            s.name.toLowerCase().includes(station) ||
            s.desc.toLowerCase().includes(station) ||
            freq.includes(station) ||
            station.includes(freq)
          );
        });
        if (found) {
          setConnectedStation(found.name);
          setStationPopup(found);
          output = `Connected to ${found.name} (${found.desc})`;
        } else {
          output = `Station not found: ${input.slice(8).trim()}`;
        }
      } else if (lower === 'clear') {
        setLines([]);
        setTyping(false);
        return;
      } else if (lower === 'exit') {
        output = 'Session ended. Refresh to restart.';
      } else {
        output = `Unknown command: ${input}`;
      }
      setLines((prev) => [...prev, ...output.split('\n')]);
      setTyping(false);
    }, 600);
  };

  // Handle up arrow for history
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEnter();
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0) {
        setInput(history[history.length - 1]);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full flex flex-col bg-black"
      style={{
        background: `radial-gradient(ellipse at 60% 40%, ${CRT_BG} 60%, #0a0f0a 100%)`,
        minHeight: '100vh',
        minWidth: '100vw',
      }}
    >
      {/* CRT scanlines overlay */}
      <Scanlines />
      {/* Output area */}
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2.5vh 2vw 0 2vw',
          ...CRT_FONT,
          color: CRT_GREEN,
          fontSize: 13,
          lineHeight: 1.7,
          letterSpacing: '0.02em',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {lines.map((line, i) =>
          line ? (
            <div key={i} style={{marginBottom:2}}>
              <Typewriter text={line} speed={12} />
            </div>
          ) : (
            <div key={i} style={{height:18}} />
          )
        )}
        {connectedStation && (
          <div style={{marginTop:16,color:CRT_AMBER,fontSize:13}}>
            Listening to <b>{connectedStation}</b>... 
          </div>
        )}
      </div>
      {/* Prompt/input at bottom */}
      <div
        style={{
          width: '100%',
          padding: '0.5vh 2vw 2.5vh 2vw',
          background: 'rgba(16,28,17,0.98)',
          borderTop: `1.5px solid ${CRT_GREEN}`,
          display: 'flex',
          alignItems: 'center',
          ...CRT_FONT,
          fontSize: 13,
        }}
      >
        <span style={{color:CRT_GREEN,marginRight:8}}>{'radio-mirchi@terminal:~$'}</span>
        <Input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          bg="#101c11"
          textColor="#39ff14"
          borderColor="#39ff14"
          className="w-full px-2 py-1 font-mono text-xs outline-none focus:ring-0 focus:outline-none"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          style={{
            ...CRT_FONT,
            background:'transparent',
            border:'none',
            outline:'none',
            color:CRT_GREEN,
            fontSize:13,
            width:'100%',
            caretColor:CRT_GREEN,
            letterSpacing:'0.02em',
            padding:0,
          }}
        />
        <BlinkingBlock />
      </div>
      {/* Station Popup */}
      <Popup
        isOpen={!!stationPopup}
        onClose={() => setStationPopup(null)}
        bg="#101c11"
        baseBg="#181f18"
        textColor="#39ff14"
        borderColor="#39ff14"
        className="flex flex-col items-center justify-center"
      >
        <h2 style={{ fontFamily: 'inherit', fontSize: 18, marginBottom: 8, color: '#39ff14', letterSpacing: '0.04em' }}>
          {stationPopup?.name}
        </h2>
        <div style={{ fontFamily: 'inherit', fontSize: 14, marginBottom: 12 }}>
          {stationPopup?.desc}
        </div>
        <div style={{ fontFamily: 'inherit', fontSize: 12, color: '#39ff14', opacity: 0.7 }}>
          (Radio window)
        </div>
      </Popup>
    </div>
  );
} 