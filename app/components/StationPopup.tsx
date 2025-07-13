"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { Visualizer } from 'react-sound-visualizer';
import { Card, ProgressBar, Button, Input } from 'pixel-retroui';
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
  const [initialListeners, setInitialListeners] = useState(0);
  const [awakenedListeners, setAwakenedListeners] = useState(1236);
  const [questioningMeter, setQuestioningMeter] = useState(148);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [missionId, setMissionId] = useLocalStorage<string | null>('missionId', null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [missionStatus, setMissionStatus] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoadingMission, setIsLoadingMission] = useState(true); // New state for overall mission loading
  const [connectionError, setConnectionError] = useState(false); // New state for connection errors
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null); // Ref for WebSocket instance
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

  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isOpen && !isConnecting && !showTimeoutPopup) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { // Check for 1 because it will decrement to 0
            if (timer) clearInterval(timer);
            webSocketRef.current?.close();
            onClose(); // Close the main station popup
            setShowTimeoutPopup(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isOpen || isConnecting || showTimeoutPopup) {
      setTimeLeft(180); // Reset timer when popup is closed, connecting, or timeout popup is shown
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, isConnecting, showTimeoutPopup, onClose]);

  // Success condition effect
  useEffect(() => {
    if (initialListeners > 0 && awakenedListeners >= initialListeners / 2) {
      console.log('Mission Success! Awakened listeners reached target.');
      webSocketRef.current?.close();
      onClose(); // Close the main station popup
      setShowSuccessPopup(true);
    }
  }, [awakenedListeners, initialListeners, onClose]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const TimeoutPopup: React.FC = () => (
    <Rnd
      default={{
        x: window.innerWidth / 2 - 200,
        y: window.innerHeight / 2 - 100,
        width: 400,
        height: 200,
      }}
      minWidth={300}
      minHeight={150}
      bounds="window"
      className="z-50"
    >
      <Card
        className="w-full h-full flex flex-col p-5"
        bg="#fefcd0"
      >
        <div className="flex-none p-4 border-b-2 border-gray-700 text-center text-xl font-bold">
          Time Out!
        </div>
        <div className="flex-grow flex flex-col items-center justify-center p-4 mb-8 text-center">
          <p className="text-xl font-bold mb-4">Mission Failed! You ran out of time.</p>
          <Button onClick={() => setShowTimeoutPopup(false)}>
            Close
          </Button>
        </div>
      </Card>
    </Rnd>
  );

  // Handle sending messages
  const handleSendMessage = () => {
    if (message.trim() !== '' && webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify({ user_dialogue: message }));
      console.log('[WebSocket] Sent user dialogue:', message);
      setMessage(''); // Clear the input after sending
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

  if (showTimeoutPopup) {
    return <TimeoutPopup />;
  }

  const SuccessPopup: React.FC = () => (
    <Rnd
      default={{
        x: window.innerWidth / 2 - 200,
        y: window.innerHeight / 2 - 100,
        width: 400,
        height: 200,
      }}
      minWidth={300}
      minHeight={150}
      bounds="window"
      className="z-50"
    >
      <Card
        className="w-full h-full flex flex-col"
        style={{ backgroundColor: 'var(--pixel-retro-ui-bg-color)' }}
      >
        <div className="flex-none p-4 border-b-2 border-gray-700 text-center text-xl font-bold">
          Mission Accomplished!
        </div>
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <p className="text-xl font-bold mb-4">Mission Successful! You awakened the majority of the listeners. Good job!</p>
          <Button onClick={() => setShowSuccessPopup(false)}>
            Close
          </Button>
        </div>
      </Card>
    </Rnd>
  );

  if (showSuccessPopup) {
    return <SuccessPopup />;
  }

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
                {initialListeners > 0 && (
                  <p className="text-sm text-gray-600 mb-2 text-center">
                    Target: {Math.floor(initialListeners / 2)} Listeners
                  </p>
                )}
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
                    <span className="text-sm font-mono font-bold text-gray-700">{formatTime(timeLeft)}</span>
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
                    <span className="text-xl font-mono text-blue-700 font-bold mt-1">{awakenedListeners}</span>
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

              </>
            )}
          </div>

          {/* Message Input and Send Button */}
          <div className="absolute bottom-4 left-0 right-0 mx-auto z-10 flex gap-2 w-11/12 max-w-[420px]">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              bg="#fefcf3"
              textColor="#000000"
              borderColor="#e8dcc6"
            />
            <Button color="primary" onClick={() => console.log('Send message:', message)}>
              Send
            </Button>
          </div>
        </div>
      </Rnd>
    </div>
  );
};

export default StationPopup;