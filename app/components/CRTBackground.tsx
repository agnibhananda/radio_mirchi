import React from 'react';

export default function CRTBackground({ children }: { children: React.ReactNode }) {
  return <div className="crt min-h-screen w-full flex flex-col items-center justify-center">{children}</div>;
} 