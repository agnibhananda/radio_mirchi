"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { Visualizer } from 'react-sound-visualizer';
import { Card, ProgressBar, Button } from 'pixel-retroui';
import { useAudio } from '../../lib/hooks/useAudio';
import { useLocalStorage } from '../../lib/hooks/useLocalStorage';
import AudioPlayer from '../../lib/utils/audioPlayer';

interface Speaker {
  name: string;
  role: string;
}

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
  const [questioningMeter, setQuestioningMeter] = useState(148);
  const [recording, setRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0-1
  const [isPressed, setIsPressed] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [missionId, setMissionId] = useLocalStorage<string | null>('missionId', null);
  const [missionStatus, setMissionStatus] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoadingMission, setIsLoadingMission] = useState(true); // New state for overall mission loading
  const [connectionError, setConnectionError] = useState(false); // New state for connection errors
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null); // Ref for WebSocket instance
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  const { play: playSelect } = useAudio('/sfx/select.mp3');

  // Connecting effect
  useEffect(() => {
    if (isOpen && station) {
      setIsConnecting(true);
      setConnectionProgress(0);
      
      // Animate progress from 0 to 100 over 5 seconds
      const progressInterval = setInterval(() => {
        setConnectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2; // Increment by 2% every 100ms (5 seconds total)
        });
      }, 100);
      
      const timer = setTimeout(() => {
        setIsConnecting(false);
        setConnectionProgress(0);
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isOpen, station]);

  // Fetch speaker data
  const fetchSpeakerData = useCallback(async (id: string) => {
    console.log('Fetching speaker data for missionId:', id); // Debug log
    const apiUrl = `/api/mission/${id}`;
    console.log('API URL for speaker data:', apiUrl); // Debug log
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.speakers && Array.isArray(data.speakers)) {
        setSpeakers(data.speakers);
      }
      setIsLoadingMission(false); // Mission data loaded
    } catch (error) {
      console.error('Error fetching speaker data:', error);
      setConnectionError(true); // Set error state
      setIsLoadingMission(false); // Stop loading even on error
    }
  }, []);

  // Handle popup closure
  const handleClose = useCallback(() => {
    if (missionId) {
      console.log("Disconnecting webhook for missionId:", missionId);
      // In a real scenario, you would send a disconnect signal to the backend
    }
    onClose();
  }, [onClose, missionId]);

  // Retrieve missionId from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      console.log('StationPopup mounted. missionId from localStorage:', missionId); // Debug log
      // missionId is already managed by useLocalStorage, so it's available here
      // We can directly proceed to polling if missionId exists
      if (missionId) {
        setIsLoadingMission(true);
        setMissionStatus(null); // Reset status
        setSpeakers([]); // Reset speakers
      } else {
        setIsLoadingMission(false); // No missionId, so no loading
        console.warn('No missionId found in localStorage when StationPopup opened.'); // Debug warning
      }
    }
  }, [isOpen, missionId]);

  // Mission status polling effect
  useEffect(() => {
    if (!isOpen || !missionId || missionStatus === 'stage2') {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const pollMissionStatus = async () => {
      try {
        console.log('Polling mission status for missionId:', missionId); // Debug log
        const response = await fetch(`http://localhost:8000/api/v1/mission_status/${missionId.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMissionStatus(data.status);

        if (data.status === 'stage2') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          // Fetch speaker data once status is stage2
          fetchSpeakerData(missionId);
        }
      } catch (error) {
        console.error('Error polling mission status:', error);
        setConnectionError(true); // Set error state
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    // Start polling
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(pollMissionStatus, 800); // Poll every 0.8 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isOpen, missionId, missionStatus, fetchSpeakerData]);

  // WebSocket connection effect
  useEffect(() => {
    if (isOpen && missionId && missionStatus === 'stage2' && !webSocketRef.current) {
      const player = new AudioPlayer();
      audioPlayerRef.current = player;

      player.setOnDialogueEnd(() => {
        if (webSocketRef.current?.readyState === WebSocket.OPEN) {
          webSocketRef.current.send(JSON.stringify({ action: 'ready_for_next' }));
          console.log('[WebSocket] Sent ready_for_next.');
        }
      });

      console.log('Attempting to establish WebSocket connection for missionId:', missionId);
      const wsUrl = `ws://localhost:8000/api/v1/ws/${missionId}`;
      const ws = new WebSocket(wsUrl);
      webSocketRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connection established.');
        setConnectionError(false);
      };

      ws.onmessage = async (event) => {
        if (typeof event.data === 'string') {
          try {
            const message = JSON.parse(event.data);
            if (message.status === 'dialogue_end') {
              console.log('[WebSocket] Received dialogue_end signal.');
              audioPlayerRef.current?.handleDialogueEnd();
            }
          } catch (e) {
            console.error('[WebSocket] Error parsing JSON message:', e);
          }
        } else if (event.data instanceof Blob) {
          console.log('[WebSocket] Received audio blob from server.');
          const arrayBuffer = await event.data.arrayBuffer();
          audioPlayerRef.current?.addAudioChunk(arrayBuffer);
        } else if (event.data instanceof ArrayBuffer) {
          console.log('[WebSocket] Received audio ArrayBuffer from server.');
          audioPlayerRef.current?.addAudioChunk(event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setConnectionError(true);
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason);
        webSocketRef.current = null;
        if (!event.wasClean) {
          setConnectionError(true);
        }
      };

      return () => {
        if (webSocketRef.current) {
          console.log('[WebSocket] Closing connection on unmount/dependency change.');
          webSocketRef.current.close();
          webSocketRef.current = null;
        }
        if (audioPlayerRef.current) {
          audioPlayerRef.current.stop();
          audioPlayerRef.current = null;
        }
      };
    }
  }, [isOpen, missionId, missionStatus]);

  // Timer effect
  useEffect(() => {
    if (isOpen && !isConnecting) {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setElapsedTime(0);
    }
  }, [isOpen, isConnecting]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        playSelect(); // Play select sound
        handleClose();
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
  }, [isOpen, handleClose, recording, isPressed]);

  // Audio input logic
  const startRecording = async () => {
    if (recording || !webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
      if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
        console.warn('[Mic] WebSocket not connected. Cannot start recording.');
      }
      return;
    }

    try {
      console.log('[Mic] Starting recording...');
      webSocketRef.current.send(JSON.stringify({ action: 'start_speech' }));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
        },
      });
      setAudioStream(stream);
      setRecording(true);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && webSocketRef.current?.readyState === WebSocket.OPEN) {
          webSocketRef.current.send(event.data);
        }
      };

      recorder.start(100); // Collect 100ms of audio at a time
    } catch (err) {
      console.error('[Mic] Error starting recording:', err);
      alert('Microphone access denied or an error occurred.');
    }
  };

  const stopRecording = () => {
    if (!recording) return;

    console.log('[Mic] Stopping recording...');
    setRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify({ action: 'stop_speech' }));
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    mediaRecorderRef.current = null;
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

  // Remove demoUsers and ensure userList is based on actual users or empty
  const userList = users && users.length > 0 ? users : [];

  // Dynamic grid layout based on number of users
  const getGridClass = (userCount: number) => {
    if (userCount <= 4) return 'grid-cols-2';
    if (userCount <= 6) return 'grid-cols-3';
    if (userCount <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const getTileHeight = (userCount: number) => {
    if (userCount <= 4) return 'h-32';
    if (userCount <= 6) return 'h-28';
    if (userCount <= 9) return 'h-24';
    return 'h-20';
  };

  if (!isOpen || !station) return null;

  // If there's a connection error, display an error message
  if (connectionError) {
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
                onClick={() => {
                  playSelect(); // Play select sound
                  handleClose();
                }}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Error Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-red-500 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-xl font-bold text-red-600 mb-2">CONNECTION FAILED</h3>
              <p className="text-sm text-gray-700 mb-4">
                Unable to establish a secure connection to the radio frequency.
              </p>
              <p className="text-xs text-gray-500">
                Please check your network and try again.
              </p>
              <Button
                onClick={() => {
                  setConnectionError(false); // Reset error state to allow retry
                  setIsLoadingMission(true); // Re-trigger loading
                  // Optionally, re-fetch missionId or re-initiate polling here
                }}
                className="mt-6"
                color="primary"
              >
                Retry Connection
              </Button>
            </div>
          </div>
        </Rnd>
      </div>
    );
  }

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
              onClick={() => {
                playSelect(); // Play select sound
                handleClose();
              }}
              className="text-gray-400 hover:text-gray-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col px-4 pt-4 pb-2 relative">
            {isConnecting || isLoadingMission ? (
              /* Connecting/Loading Screen */
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center">
                  {/* Radio Icon */}
                  <div className="w-16 h-16 bg-[#eed5a5] rounded-lg flex items-center justify-center border border-[#e8dcc6] mx-auto mb-6">
                    <img src="/radio.png" alt="Radio Icon" className="w-14 h-14 object-contain" />
                  </div>
                  
                  {/* Connecting Text */}
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {isConnecting ? 'CONNECTING TO RADIO' : 'LOADING MISSION DATA'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {isConnecting ? `${station.name} - ${station.desc}` : 'Please wait...'}
                  </p>
                  
                  {/* Loading Animation */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  {/* Progress Bar (only for initial connection) */}
                  {isConnecting && (
                    <div className="w-48 mx-auto mb-4">
                      <ProgressBar
                        size="md"
                        color="#ff6600"
                        borderColor="black"
                        className="w-full"
                        progress={connectionProgress}
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-4 font-mono">
                    {isConnecting ? 'ESTABLISHING SECURE CONNECTION...' : 'RETRIEVING MISSION DETAILS...'}
                  </p>
                </div>
              </div>
            ) : (
              /* Normal Content */
              <>
                {/* Station Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#eed5a5] rounded-lg flex items-center justify-center border border-[#e8dcc6]">
                      <img src="/radio.png" alt="Radio Icon" className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-mono font-bold text-pink-500 leading-none">{station.name}</span>
                      <span className="text-xs font-mono text-gray-700 leading-none mt-1">{station.desc}</span>
                    </div>
                  </div>
                  {/* Timer */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-mono font-bold text-gray-700">{formatTime(elapsedTime)}</span>
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
                    <span className="text-xl font-mono text-green-700 font-bold mt-1">{questioningMeter}</span>
                  </Card>
                </div>

                {/* Speaker Info (if available) */}
                {speakers.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Speakers:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {speakers.map((speaker, idx) => (
                        <Card
                          key={idx}
                          bg="#f3f6fb"
                          textColor="#2563eb"
                          borderColor="#c7d6e8"
                          shadowColor="#dbeafe"
                          className="px-3 py-2 flex flex-col"
                        >
                          <span className="text-xs font-bold text-blue-700">{speaker.name}</span>
                          <span className="text-[10px] text-gray-600">{speaker.role}</span>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Tiles (Dynamic) */}
                <div className={`grid ${getGridClass(userList.length)} gap-2 mb-4 max-h-64 overflow-y-auto`}>
                  {userList.map((user, idx) => {
                    // Color and border logic
                    const borderColor = user.isSelf ? '#38bdf8' : '#facc15';
                    const labelColor = user.isSelf ? 'text-blue-500' : 'text-yellow-500';
                    const waveformColor = user.color || (user.isSelf ? '#38bdf8' : '#facc15');
                    return (
                      <Card
                        key={`${user.name}-${idx}`}
                        bg="#fff"
                        textColor="#222"
                        borderColor={borderColor}
                        shadowColor="#e5e7eb"
                        className={`relative flex flex-col justify-between ${getTileHeight(userList.length)} p-2`}
                      >
                        {/* Label */}
                        <span className={`absolute top-1 left-2 text-xs font-bold ${labelColor} truncate max-w-[80%]`}>{user.name}</span>
                        {/* Avatar and badge row */}
                        <div className="flex items-end justify-between h-full">
                          {/* Avatar */}
                          <div className="flex flex-col justify-end">
                            {user.avatar ? (
                              <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full bg-gray-200 border border-gray-300" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                                  <circle cx="10" cy="7" r="4" fill="#bbb" />
                                  <rect x="4" y="13" width="12" height="5" rx="2.5" fill="#bbb" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Badge and waveform */}
                          <div className="flex flex-col items-end justify-end">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-mono font-bold bg-white border border-gray-300 rounded-full px-1.5 py-0.5 text-gray-800">{user.badge || 'WBI'}</span>
                              {/* Waveform */}
                              {user.isSelf ? (
                                recording && audioStream ? (
                                  <Visualizer audio={audioStream} mode="continuous" autoStart slices={20} strokeColor={waveformColor}>
                                    {({ canvasRef }) => (
                                      <canvas ref={canvasRef} width={30} height={10} style={{ background: 'transparent', display: 'block' }} />
                                    )}
                                  </Visualizer>
                                ) : (
                                  <svg width="30" height="10" viewBox="0 0 30 10" fill="none">
                                    <rect x="1" y="5" width="1.5" height="3" rx="0.75" fill={waveformColor} />
                                    <rect x="3" y="2" width="1.5" height="6" rx="0.75" fill={waveformColor} />
                                    <rect x="5" y="4" width="1.5" height="4" rx="0.75" fill={waveformColor} />
                                    <rect x="7" y="1" width="1.5" height="7" rx="0.75" fill={waveformColor} />
                                    <rect x="9" y="3" width="1.5" height="5" rx="0.75" fill={waveformColor} />
                                    <rect x="11" y="2" width="1.5" height="6" rx="0.75" fill={waveformColor} />
                                    <rect x="13" y="4" width="1.5" height="4" rx="0.75" fill={waveformColor} />
                                    <rect x="15" y="1" width="1.5" height="7" rx="0.75" fill={waveformColor} />
                                    <rect x="17" y="3" width="1.5" height="5" rx="0.75" fill={waveformColor} />
                                    <rect x="19" y="2" width="1.5" height="6" rx="0.75" fill={waveformColor} />
                                  </svg>
                                )
                              ) : (
                                <svg width="30" height="10" viewBox="0 0 30 10" fill="none">
                                  <rect x="1" y="5" width="1.5" height="3" rx="0.75" fill={waveformColor} />
                                  <rect x="3" y="2" width="1.5" height="6" rx="0.75" fill={waveformColor} />
                                  <rect x="5" y="4" width="1.5" height="4" rx="0.75" fill={waveformColor} />
                                  <rect x="7" y="1" width="1.5" height="7" rx="0.75" fill={waveformColor} />
                                  <rect x="9" y="3" width="1.5" height="5" rx="0.75" fill={waveformColor} />
                                  <rect x="11" y="2" width="1.5" height="6" rx="0.75" fill={waveformColor} />
                                  <rect x="13" y="4" width="1.5" height="4" rx="0.75" fill={waveformColor} />
                                  <rect x="15" y="1" width="1.5" height="7" rx="0.75" fill={waveformColor} />
                                  <rect x="17" y="3" width="1.5" height="5" rx="0.75" fill={waveformColor} />
                                  <rect x="19" y="2" width="1.5" height="6" rx="0.75" fill={waveformColor} />
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
              </>
            )}
          </div>
        </div>
      </Rnd>
    </div>
  );
};

export default StationPopup;