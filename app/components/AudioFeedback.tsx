"use client";
import React, { useEffect, useRef } from 'react';

interface AudioFeedbackProps {
  isTerminalOpen: boolean;
  onKeyPress?: () => void;
}

const AudioFeedback: React.FC<AudioFeedbackProps> = ({ onKeyPress }) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Create key press sound
  const playKeyPress = () => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Key press sound: short, high-pitched beep
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    onKeyPress?.();
  };

  // Expose key press function globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).playTerminalKeyPress = playKeyPress;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).playTerminalKeyPress;
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default AudioFeedback; 