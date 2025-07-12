"use client";
import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';

interface Station {
  name: string;
  desc: string;
  color: string;
}

interface StationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station | null;
}

const StationPopup: React.FC<StationPopupProps> = ({ isOpen, onClose, station }) => {
  const [messages, setMessages] = useState<Array<{type: 'host' | 'caller' | 'player', text: string, time: string}>>([]);
  const [inputText, setInputText] = useState('');
  const [listenerCount, setListenerCount] = useState(1247);
  const [questioningMeter, setQuestioningMeter] = useState(12);
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState(false);

  // Generate initial AI dialogue
  useEffect(() => {
    if (station && messages.length === 0) {
      const initialMessages = [
        {
          type: 'host' as const,
          text: `Welcome to ${station.name}! This is your host, AI-7, broadcasting live from the digital ether.`,
          time: '14:32'
        },
        {
          type: 'caller' as const,
          text: 'Hey host! Love the new synthwave mix you\'re playing!',
          time: '14:33'
        },
        {
          type: 'host' as const,
          text: 'Thanks for tuning in! Remember, the algorithm knows what\'s best for everyone. Trust the system!',
          time: '14:33'
        }
      ];
      setMessages(initialMessages);
    }
  }, [station]);

  // Simulate listener count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      type: 'player' as const,
      text: inputText,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Interesting perspective... but have you considered the official narrative?',
        'That\'s a very... unique take on things.',
        'The algorithm suggests you might want to reconsider that viewpoint.',
        'Let\'s stick to the approved topics, shall we?'
      ];
      
      const aiResponse = {
        type: 'host' as const,
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Update questioning meter based on message impact
      const impact = Math.random() * 8 - 4; // -4 to +4
      setQuestioningMeter(prev => Math.max(0, Math.min(100, prev + impact)));
    }, 2000);
  };

  const handleMicToggle = async () => {
    if (!micPermission) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission(true);
        setIsRecording(true);
        // In a real app, you'd process the audio stream here
        setTimeout(() => setIsRecording(false), 3000);
      } catch (err) {
        console.log('Microphone permission denied');
      }
    } else {
      setIsRecording(!isRecording);
    }
  };

  // Handle ESC key to close popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 pointer-events-none"></div>
      <Rnd
        default={{
          x: window.innerWidth - 450,
          y: 50,
          width: 420,
          height: 600
        }}
        minWidth={350}
        minHeight={500}
        maxWidth={500}
        maxHeight={700}
        className="pointer-events-auto"
        style={{
          zIndex: 51,
        }}
      >
        <div 
          className="w-full h-full bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fefcf3 0%, #f5f1e8 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3 border-b border-orange-200 bg-gradient-to-r from-orange-100 to-yellow-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 cursor-pointer hover:bg-red-500 transition-colors"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 cursor-pointer hover:bg-yellow-500 transition-colors"></div>
              <div className="w-3 h-3 rounded-full bg-green-400 cursor-pointer hover:bg-green-500 transition-colors"></div>
            </div>
            <h3 className="text-sm font-bold text-gray-700">RADIO WINDOW</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-4 h-full flex flex-col">
            {/* Station Info */}
            <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center text-lg">
                  📻
                </div>
                <div>
                  <h4 className="font-bold text-base" style={{ color: station.color }}>
                    {station.name}
                  </h4>
                  <p className="text-sm text-gray-600">{station.desc}</p>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs text-blue-700 font-semibold mb-1">LISTENERS</div>
                <div className="text-xl font-bold text-blue-600">{listenerCount}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-green-700 font-semibold mb-1">QUESTIONING</div>
                <div className="text-xl font-bold text-green-600">{questioningMeter}%</div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 mb-4 overflow-y-auto min-h-0">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-3 ${msg.type === 'player' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-xs p-3 rounded-lg text-sm ${
                    msg.type === 'host' ? 'bg-blue-100 text-blue-800' :
                    msg.type === 'caller' ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    <div className="font-semibold text-xs mb-1">
                      {msg.type === 'host' ? 'AI-7' : msg.type === 'caller' ? 'Caller' : 'You'}
                    </div>
                    <div className="text-sm">{msg.text}</div>
                    <div className="text-xs opacity-60 mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-300"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg border border-orange-300 text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleMicToggle}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    isRecording 
                      ? 'bg-red-100 border-red-300 text-red-700' 
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isRecording ? '🔴 Recording...' : '🎤 Mic'}
                </button>
                <button className="flex-1 py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg border border-purple-300 text-sm font-medium transition-colors">
                  🔊 TTS
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              Drag to move • Press ESC to close
            </div>
          </div>
        </div>
      </Rnd>
    </div>
  );
};

export default StationPopup; 