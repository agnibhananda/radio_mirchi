"use client";
import React, { useState } from 'react';
import RegisterSection from './components/RegisterSection';
import UpdatedHeroSection from './components/UpdatedHeroSection';

export default function Home() {
  const [showMain, setShowMain] = useState(false);

  const handleRegistrationComplete = () => {
    setShowMain(true);
  };

  return (
    <div>
      {!showMain ? (
        <RegisterSection onComplete={handleRegistrationComplete} />
      ) : (
        <UpdatedHeroSection />
      )}
    </div>
  );
}
