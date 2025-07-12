"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Visualizer } from 'react-sound-visualizer';
import { Card } from 'pixel-retroui';

interface Station {
  name: string;
  desc: string;
  color: string;
}

interface StationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station | null;
  users?: Array<{
    name: string;
    isSelf?: boolean;
    color?: string;
    avatar?: string | null;
    badge?: string;
  }>;
}

const StationPopup: React.FC<StationPopupProps> = ({ isOpen, onClose, station, users }) => {
  const [listenerCount, setListenerCount] = useState(1236);
  const [questioningMeter, setQuestioningMeter] = useState(12);
  const [recording, setRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0-1
  const [isPressed, setIsPressed] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      // Only trigger push-to-talk if not focused on input/textarea
      const active = document.activeElement;
      const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.getAttribute('contenteditable') === 'true');
      if (!isInput && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        if (!recording && !isPressed) {
          setIsPressed(true);
          startRecording();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.getAttribute('contenteditable') === 'true');
      if (!isInput && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        if (recording && isPressed) {
          setIsPressed(false);
          stopRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, onClose, recording, isPressed]);

  // Audio input logic
  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    setRecording(false);
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
    // eslint-disable-next-line
  }, []);

  // Mouse push-to-talk handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recording && !isPressed) {
      setIsPressed(true);
      startRecording();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (recording && isPressed) {
      setIsPressed(false);
      stopRecording();
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (recording && isPressed) {
      setIsPressed(false);
      stopRecording();
    }
  };

  const demoUsers = [
    { name: 'You', isSelf: true, color: '#38bdf8', avatar: '/mic.png', badge: 'AGENT' },
    { name: 'Akshit', color: '#facc15', avatar: '/jukebox.png', badge: 'HOST' },
    { name: 'Harsimran', color: '#a78bfa', avatar: '/jukebox.png', badge: 'HOST' },
    { name: 'Mystery Guest', color: '#fb7185', avatar: null, badge: 'CALLER' },
  ];
  const userList = users && users.length > 0 ? users : demoUsers;

  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 pointer-events-none"></div>
      <Rnd
        default={{
          x: window.innerWidth - 540,
          y: 40,
          width: 480,
          height: 700
        }}
        minWidth={340}
        minHeight={500}
        maxWidth={500}
        maxHeight={700}
        className="pointer-events-auto"
        style={{ zIndex: 51 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-[#fefcf3] to-[#f5f1e8] border-2 border-[#e8dcc6] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
          {/* Title Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-[#f5f1e8] to-[#fefcf3] border-b border-[#e8dcc6]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs font-bold tracking-widest text-gray-700">RADIO WINDOW</div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col px-4 pt-4 pb-2 relative">
            {/* Station Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#eed5a5] rounded-lg flex items-center justify-center border border-[#e8dcc6]">
                <img src="/radio.png" alt="Radio Icon" className="w-7 h-7 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-mono font-bold text-pink-500 leading-none">{station.name}</span>
                <span className="text-xs font-mono text-gray-700 leading-none mt-1">{station.desc}</span>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="flex gap-2 mb-4">
              <Card
                bg="#f3f6fb"
                textColor="#2563eb"
                borderColor="#c7d6e8"
                shadowColor="#dbeafe"
                className="flex-1 px-3 py-2 flex flex-col items-center"
              >
                <span className="text-[11px] font-bold text-blue-500 tracking-widest">LISTENERS</span>
                <span className="text-xl font-mono text-blue-700 font-bold mt-1">{listenerCount}</span>
              </Card>
              <Card
                bg="#f3fbf6"
                textColor="#16a34a"
                borderColor="#c7e8d6"
                shadowColor="#bbf7d0"
                className="flex-1 px-3 py-2 flex flex-col items-center"
              >
                <span className="text-[11px] font-bold text-green-600 tracking-widest">QUESTIONING</span>
                <span className="text-xl font-mono text-green-700 font-bold mt-1">{questioningMeter}%</span>
              </Card>
            </div>

            {/* User Tiles (Dynamic) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {userList.map((user, idx) => {
                // Color and border logic
                const borderColor = user.isSelf ? '#38bdf8' : '#facc15';
                const labelColor = user.isSelf ? 'text-blue-500' : 'text-yellow-500';
                const waveformColor = user.color || (user.isSelf ? '#38bdf8' : '#facc15');
                return (
                  <Card
                    key={user.name}
                    bg="#fff"
                    textColor="#222"
                    borderColor={borderColor}
                    shadowColor="#e5e7eb"
                    className="relative flex flex-col justify-between h-32 p-3"
                  >
                    {/* Label */}
                    <span className={`absolute top-2 left-3 text-xs font-bold ${labelColor}`}>{user.name}</span>
                    {/* Avatar and badge row */}
                    <div className="flex items-end justify-between h-full">
                      {/* Avatar */}
                      <div className="flex flex-col justify-end">
                        {user.avatar ? (
                          <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <circle cx="10" cy="7" r="4" fill="#bbb" />
                              <rect x="4" y="13" width="12" height="5" rx="2.5" fill="#bbb" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Badge and waveform */}
                      <div className="flex flex-col items-end justify-end">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono font-bold bg-white border border-gray-300 rounded-full px-2 py-0.5 text-gray-800">{user.badge || 'WBI'}</span>
                          {/* Waveform */}
                          {user.isSelf ? (
                            recording && audioStream ? (
                              <Visualizer audio={audioStream} mode="continuous" autoStart slices={20} strokeColor={waveformColor}>
                                {({ canvasRef }) => (
                                  <canvas ref={canvasRef} width={40} height={12} style={{ background: 'transparent', display: 'block' }} />
                                )}
                              </Visualizer>
                            ) : (
                              <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                                <rect x="2" y="6" width="2" height="4" rx="1" fill={waveformColor} />
                                <rect x="6" y="2" width="2" height="8" rx="1" fill={waveformColor} />
                                <rect x="10" y="4" width="2" height="6" rx="1" fill={waveformColor} />
                                <rect x="14" y="1" width="2" height="10" rx="1" fill={waveformColor} />
                                <rect x="18" y="5" width="2" height="5" rx="1" fill={waveformColor} />
                                <rect x="22" y="3" width="2" height="7" rx="1" fill={waveformColor} />
                                <rect x="26" y="6" width="2" height="4" rx="1" fill={waveformColor} />
                                <rect x="30" y="2" width="2" height="8" rx="1" fill={waveformColor} />
                                <rect x="34" y="4" width="2" height="6" rx="1" fill={waveformColor} />
                              </svg>
                            )
                          ) : (
                            <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                              <rect x="2" y="6" width="2" height="4" rx="1" fill={waveformColor} />
                              <rect x="6" y="2" width="2" height="8" rx="1" fill={waveformColor} />
                              <rect x="10" y="4" width="2" height="6" rx="1" fill={waveformColor} />
                              <rect x="14" y="1" width="2" height="10" rx="1" fill={waveformColor} />
                              <rect x="18" y="5" width="2" height="5" rx="1" fill={waveformColor} />
                              <rect x="22" y="3" width="2" height="7" rx="1" fill={waveformColor} />
                              <rect x="26" y="6" width="2" height="4" rx="1" fill={waveformColor} />
                              <rect x="30" y="2" width="2" height="8" rx="1" fill={waveformColor} />
                              <rect x="34" y="4" width="2" height="6" rx="1" fill={waveformColor} />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Push-to-Talk Button */}
            <div className="flex-1 flex flex-col justify-end items-center pb-2">
              <div className="flex flex-col items-center">
                <button
                  className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-md transition-all duration-75 select-none relative ${
                    isPressed 
                      ? 'bg-[#c5d2de] border-[#9fb5c9] transform translate-y-1 shadow-sm' 
                      : 'bg-[#e0e7ef] border-[#b6c6d8] shadow-md'
                  } ${recording ? 'ring-4 ring-red-400' : ''}`}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  title="Push to Talk (Hold Space or Click & Hold)"
                >
                  <div className={`absolute w-16 h-16 rounded-full transition-all duration-75 ${
                    isPressed ? 'bg-[#9fb5c9]' : 'bg-[#b6c6d8]'
                  }`}></div>
                  <img src="/mic.png" alt="Microphone" className="w-12 h-12 relative z-10" />
                  {recording && (
                    <span className="absolute bottom-3 right-3 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </button>
                <span className="text-xs font-mono font-bold text-gray-600 mt-2 tracking-wider">
                  PUSH TO TALK
                </span>
                <span className="text-xs font-mono text-gray-500 mt-1">
                  Hold SPACE or Click & Hold
                </span>
              </div>
            </div>

            {/* Vertical Green Bar */}
            <div className="absolute top-20 right-2 h-[70%] w-2 rounded-full bg-gradient-to-b from-green-400 to-green-600 shadow-inner"></div>
          </div>
        </div>
      </Rnd>
    </div>
  );
};

export default StationPopup;