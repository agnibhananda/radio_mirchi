"use client";
import React, { useState } from 'react';
import RegisterForm from './RegisterForm';

interface RegisterSectionProps {
  onComplete: () => void;
}

export default function RegisterSection({ onComplete }: RegisterSectionProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSkip, setShowSkip] = useState(false);

  // Show skip option after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRegistrationSuccess = (user: any) => {
    setCurrentUser(user);
    // Auto-proceed after successful registration
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 relative overflow-hidden">
      {/* Laptop Bezel - Same as HeroSection */}
      <div className="absolute inset-0 p-8 md:p-10 lg:p-16">
        <div 
          className="w-full h-full rounded-3xl shadow-2xl relative"
          style={{
            background: 'linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 shadow-inner">
            <div 
              className="absolute inset-1.5 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Screen content */}
              <div className="w-full h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 relative overflow-hidden">
                {/* Floating Particles - Same pattern as HeroSection */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-gradient-to-r from-yellow-300 to-orange-300 animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        opacity: Math.random() * 0.4 + 0.2,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Main Content */}
                <div className="relative z-10 min-h-full flex items-center justify-center p-6">
                  <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent flex-1"></div>
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center border-2 border-orange-200">
                          <span className="text-xl">🎯</span>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent flex-1"></div>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Mission Registration
                      </h1>
                      <p className="text-lg text-gray-600 max-w-lg mx-auto">
                        Join the resistance and track your infiltration progress. Your data helps us monitor the effectiveness of our operations.
                      </p>
                    </div>

                    {/* Registration Form */}
                    <div className="flex justify-center mb-8">
                      <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
                    </div>

                    {/* Skip Option */}
                    {showSkip && !currentUser && (
                      <div className="text-center">
                        <div className="inline-block p-4 bg-white bg-opacity-50 rounded-lg border border-orange-200">
                          <p className="text-sm text-gray-600 mb-3">
                            Want to proceed without registration?
                          </p>
                          <button
                            onClick={handleSkip}
                            className="px-6 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors border border-gray-300"
                          >
                            Continue as Guest
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Success State */}
                    {currentUser && (
                      <div className="text-center">
                        <div className="inline-block p-6 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">✅</span>
                          </div>
                          <h3 className="text-lg font-bold text-green-800 mb-2">
                            Welcome to the Resistance, {currentUser.name}!
                          </h3>
                          <p className="text-green-700 mb-4">
                            Your agent profile has been created. Proceeding to mission briefing...
                          </p>
                          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop details - Same as HeroSection */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs font-mono opacity-60">
            RETRO-TECH • MODEL RT-2024
          </div>
          <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute bottom-6 left-6 w-3 h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-gray-500 shadow-inner"></div>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg" style={{ boxShadow: '0 0 8px #4ade80' }}></div>
            <span className="text-gray-400 text-xs font-mono">PWR</span>
          </div>
        </div>
      </div>
    </div>
  );
}