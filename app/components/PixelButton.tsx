import React from 'react';

type PixelButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

export default function PixelButton({ children, onClick, className = '', type = 'button' }: PixelButtonProps) {
  return (
    <button
      className={`pixel-btn ${className}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
} 