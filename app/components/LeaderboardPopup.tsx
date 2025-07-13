"use client";
import React, { useState, useEffect } from 'react';
import { Card } from 'pixel-retroui';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  email: string;
  score: number;
  joinedAt: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface LeaderboardPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaderboardPopup({ isOpen, onClose }: LeaderboardPopupProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchLeaderboard = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/leaderboard?limit=10&page=${page}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setCurrentPage(page);
      } else {
        setError(result.message || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard(currentPage);
  };

  const handlePageChange = (newPage: number) => {
    fetchLeaderboard(newPage);
  };

  // Fetch data when popup opens
  useEffect(() => {
    if (isOpen && !data) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  // Handle popup visibility animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Handle ESC key to close popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <img src="/first_prize.png" alt="1st Place" className="w-16 h-16" />;
      case 2: return <img src="/second_prize.png" alt="2nd Place" className="w-16 h-16" />;
      case 3: return <img src="/third_prize.png" alt="3rd Place" className="w-16 h-16" />;
      default: return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) ${visible ? 'scale(1)' : 'scale(0.95)'}`,
          zIndex: 1000,
          width: '90vw',
          maxWidth: 700,
          height: '80vh',
          maxHeight: 700,
          opacity: visible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
        className="drop-shadow-2xl"
      >
        <Card
          bg="#fffbe6"
          textColor="#ea580c"
          borderColor="#e8dcc6"
          shadowColor="#f5e7c6"
          className="w-full h-full rounded-xl shadow-2xl border overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-orange-100 border-b border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                <img src="/trophy.png" alt="Trophy" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Resistance Leaderboard</h3>
                <p className="text-sm text-gray-600">Top infiltration agents</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {loading && !data ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading leaderboard...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      fetchLeaderboard(currentPage);
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : data && data.leaderboard.length > 0 ? (
              <>
                {/* Stats Bar */}
                <Card
                  bg="#f9fafb"
                  textColor="#6b7280"
                  borderColor="#e5e7eb"
                  shadowColor="#f3f4f6"
                  className="p-4 border-b"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span>Total Agents: {data.pagination.totalUsers}</span>
                    <span>Page {data.pagination.currentPage} of {data.pagination.totalPages}</span>
                  </div>
                </Card>

                {/* Leaderboard List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    {data.leaderboard.map((entry) => (
                      <Card
                        key={entry.id}
                        bg={entry.rank <= 3 ? "#fef3c7" : "#ffffff"}
                        textColor={entry.rank <= 3 ? "#d97706" : "#374151"}
                        borderColor={entry.rank <= 3 ? "#f59e0b" : "#d1d5db"}
                        shadowColor={entry.rank <= 3 ? "#fde68a" : "#f3f4f6"}
                        className="p-4 transition-all duration-200 hover:shadow-md"
                      >
                                                  <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                entry.rank <= 3
                                  ? 'bg-yellow-200'
                                  : 'bg-gray-100'
                              }`}>
                                {getRankIcon(entry.rank)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{entry.name}</h4>
                                <p className="text-sm text-gray-500">{entry.email}</p>
                                <p className="text-xs text-gray-400">Joined {formatDate(entry.joinedAt)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-orange-600">{entry.score}</div>
                              <div className="text-xs text-gray-500">points</div>
                            </div>
                          </div>
                        </Card>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <Card
                    bg="#f9fafb"
                    textColor="#6b7280"
                    borderColor="#e5e7eb"
                    shadowColor="#f3f4f6"
                    className="p-4 border-t"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!data.pagination.hasPrevPage || loading}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-600">
                        {currentPage} / {data.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!data.pagination.hasNextPage || loading}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-gray-600 mb-2">No agents registered yet</p>
                  <p className="text-sm text-gray-500">Be the first to join the resistance!</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <Card
            bg="#f9fafb"
            textColor="#6b7280"
            borderColor="#e5e7eb"
            shadowColor="#f3f4f6"
            className="p-3 border-t text-center"
          >
            <p className="text-xs">
              Press ESC to close • Auto-refreshes every 30s
            </p>
          </Card>
        </Card>
      </div>
    </>
  );
}