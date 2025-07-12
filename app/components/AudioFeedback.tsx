"use client";
import React, { useEffect, useRef } from 'react';

interface AudioFeedbackProps {
  isTerminalOpen: boolean;
  onKeyPress?: () => void;
}

const AudioFeedback: React.FC<AudioFeedbackProps> = ({ isTerminalOpen, onKeyPress }) => {
  const keyPressAudioRef = useRef<HTMLAudioElement | null>(null);
  const humAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const humOscillatorRef = useRef<OscillatorNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);

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

  // Start/stop ambient hum
  useEffect(() => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;

    if (isTerminalOpen) {
      // Create ambient hum
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Low electronic hum: 60Hz with slight modulation
      oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
      
      // Add slight frequency modulation for more realistic hum
      oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(62, audioContext.currentTime + 2);
      oscillator.frequency.linearRampToValueAtTime(58, audioContext.currentTime + 4);
      oscillator.frequency.linearRampToValueAtTime(60, audioContext.currentTime + 6);

      gainNode.gain.setValueAtTime(0.02, audioContext.currentTime); // Very quiet

      oscillator.start(audioContext.currentTime);
      
      humOscillatorRef.current = oscillator;
      humGainRef.current = gainNode;
    } else {
      // Stop hum
      if (humOscillatorRef.current) {
        humOscillatorRef.current.stop();
        humOscillatorRef.current = null;
      }
      if (humGainRef.current) {
        humGainRef.current.disconnect();
        humGainRef.current = null;
      }
    }

    return () => {
      if (humOscillatorRef.current) {
        humOscillatorRef.current.stop();
      }
      if (humGainRef.current) {
        humGainRef.current.disconnect();
      }
    };
  }, [isTerminalOpen]);

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