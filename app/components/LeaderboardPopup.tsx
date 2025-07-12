"use client";
import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';

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
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-auto" onClick={onClose}></div>
      <Rnd
        default={{
          x: (window.innerWidth - 600) / 2,
          y: 50,
          width: 600,
          height: 700
        }}
        minWidth={500}
        minHeight={600}
        maxWidth={800}
        maxHeight={800}
        className="pointer-events-auto"
        style={{ zIndex: 51 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-100 to-yellow-100 border-b border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                🏆
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
                    onClick={() => fetchLeaderboard(currentPage)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : data && data.leaderboard.length > 0 ? (
              <>
                {/* Stats Bar */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Total Agents: {data.pagination.totalUsers}</span>
                    <span>Page {data.pagination.currentPage} of {data.pagination.totalPages}</span>
                  </div>
                </div>

                {/* Leaderboard List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    {data.leaderboard.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                          entry.rank <= 3
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                            : 'bg-white border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                              entry.rank <= 3
                                ? 'bg-gradient-to-br from-yellow-200 to-orange-200 text-orange-800'
                                : 'bg-gray-100 text-gray-600'
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
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
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
                  </div>
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
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Drag to move • Press ESC to close • Auto-refreshes every 30s
            </p>
          </div>
        </div>
      </Rnd>
    </div>
  );
}