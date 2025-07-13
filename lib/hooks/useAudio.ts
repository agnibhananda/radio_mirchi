import { useCallback, useRef, useState } from 'react';

export const useAudio = (audioSrc: string, options?: { loop?: boolean }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.volume = 0.3; // Set volume to 30%
      if (options?.loop) {
        audioRef.current.loop = true;
      }
    }
    
    // Reset audio to beginning and play
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(error => {
      console.warn('Audio playback failed:', error);
    });
  }, [audioSrc, options?.loop]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.warn('Audio playback failed:', error);
      });
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current) {
      play();
    } else if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, play, pause, resume]);

  return { play, pause, resume, stop, toggle, isPlaying };
}; 