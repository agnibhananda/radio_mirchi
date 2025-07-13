"use client";
import React, { useState } from 'react';
import { Card, Input, Button } from 'pixel-retroui';
import { useAudio } from '../../lib/hooks/useAudio';

interface RegisterFormProps {
  onRegistrationSuccess: (user: any) => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function RegisterForm({ onRegistrationSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const { play: playSelect } = useAudio('/sfx/select.mp3');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    playSelect(); // Play select sound
    setIsLoading(true);
    setErrors({});

    // Simple validation
    const newErrors: FormErrors = {};
    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = 'Agent name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (mode === 'signup' && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'signup' ? '/api/register' : '/api/signin';
      const payload = mode === 'signup' 
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from API
        if (data.message) {
          if (data.message.includes('email')) {
            setErrors({ email: data.message });
          } else if (data.message.includes('password')) {
            setErrors({ password: data.message });
          } else if (data.message.includes('name')) {
            setErrors({ name: data.message });
          } else {
            setErrors({ general: data.message });
          }
        } else {
          setErrors({ general: 'An error occurred. Please try again.' });
        }
        return;
      }

      // Success
      setIsSuccess(true);
      const user = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        score: data.user.score
      };

      // Store userId in localStorage
      localStorage.setItem('userId', user.id);
      console.log('Stored userId in localStorage:', user.id); // Debug log

      setFormData({ name: '', email: '', password: '' });

      // Make POST request to create_mission endpoint in the background
      (async () => {
        try {
          const createMissionResponse = await fetch('http://localhost:8000/api/v1/create_mission', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              topic: "any", // topic is "any" to allow backend to assign a random topic
              user_id: user.id // Use the userId from the successful registration/signin
            }),
          });

          const missionData = await createMissionResponse.json();
          console.log('create_mission API response:', missionData); // Debug log

          if (!createMissionResponse.ok) {
            console.error('Failed to create mission in background:', missionData.message || 'Unknown error');
            // Optionally, you could set a non-blocking error state here if needed
          } else {
            console.log('Mission created successfully. Mission ID from backend:', missionData.id); // Debug log
            localStorage.setItem('missionId', missionData.id);
            console.log('Stored missionId in localStorage:', missionData.id); // Debug log
            // Allow user to proceed only after mission is created and ID is stored
            onRegistrationSuccess(user);
          }
        } catch (error) {
          console.error('Network error during mission creation in background:', error);
          // If mission creation fails, still allow user to proceed but without a missionId
          onRegistrationSuccess(user);
        }
      })();
      
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      // If initial registration/signin fails, ensure loading state is reset
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim() && (mode === 'signin' || formData.name.trim());

  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        bg="#fffbe6"
        textColor="#ea580c"
        borderColor="#e8dcc6"
        shadowColor="#f5e7c6"
        className="rounded-2xl shadow-2xl border overflow-hidden"
      >
        <div className="p-4">
          {/* Header */}
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-orange-200">
              <img src="/user.png" alt="Player Icon" className="w-22 h-22" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {mode === 'signup' ? 'Join the Resistance' : 'Agent Login'}
            </h2>
            <p className="text-gray-600 text-xs">
              {mode === 'signup' ? 'Register to track your infiltration progress' : 'Sign in to your agent account'}
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-700 font-medium text-sm">{mode === 'signup' ? 'Registration successful!' : 'Login successful!'}</span>
              </div>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠</span>
                <span className="text-red-700 text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mode === 'signup' && (
            <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                Agent Name
              </label>
                  <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your agent name"
                disabled={isLoading}
                    className="w-full"
                    color="orange"
                    borderColor={errors.name ? "red" : "orange"}
              />
              {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>
              )}
            <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Secure Email
              </label>
                <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="agent@resistance.net"
                  disabled={isLoading}
                  className="w-full"
                  color="orange"
                  borderColor={errors.email ? "red" : "orange"}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                disabled={isLoading}
                className="w-full"
                color="orange"
                borderColor={errors.password ? "red" : "orange"}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !formData.email.trim() || (mode === 'signup' && (!formData.name.trim() || !formData.password.trim())) || (mode === 'signin' && !formData.password.trim())}
              className="w-full"
              color="primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === 'signup' ? 'Registering...' : 'Signing in...'}</span>
                </div>
              ) : (
                mode === 'signup' ? 'Join the Mission' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-2 text-center">
            <Button
              type="button"
              color="secondary"
              className="w-full"
              onClick={() => {
                playSelect(); // Play select sound
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setErrors({});
                setIsSuccess(false);
              }}
            >
              {mode === 'signup' ? 'Already have an account? Sign In' : 'New agent? Register here'}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Your data is encrypted and secure
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}