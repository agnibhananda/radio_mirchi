import React from 'react';
import { useAudio } from '../../lib/hooks/useAudio';

type PixelButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

export default function PixelButton({ children, onClick, className = '', type = 'button' }: PixelButtonProps) {
  const { play: playSelect } = useAudio('/sfx/select.mp3');

  const handleClick = () => {
    playSelect(); // Play select sound
    onClick?.();
  };

  return (
    <button
      className={`pixel-btn ${className}`}
      onClick={handleClick}
      type={type}
    >
      {children}
    </button>
  );
} 