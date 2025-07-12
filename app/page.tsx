"use client";
import React, { useState } from 'react';
import RegisterSection from './components/RegisterSection';
import UpdatedHeroSection from './components/HeroSection';

export default function Home() {
  const [showRegistration, setShowRegistration] = useState(false);

  const handleInitiateBreach = () => {
    setShowRegistration(true);
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
  };

  return (
    <div>
      {showRegistration ? (
        <RegisterSection onComplete={handleRegistrationComplete} />
      ) : (
        <UpdatedHeroSection onInitiateBreach={handleInitiateBreach} />
      )}
    </div>
  );
}
