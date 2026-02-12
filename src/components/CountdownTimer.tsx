'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetTimestamp: number; // Unix timestamp in seconds
  label?: string;
}

export function CountdownTimer({ targetTimestamp, label = 'Time Remaining' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = targetTimestamp - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="animate-pulse">⏰</span>
        <span>Loading...</span>
      </div>
    );
  }

  const allZero = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      
      {allZero ? (
        <div className="text-lg font-bold text-red-400">🔥 Resolution In Progress</div>
      ) : (
        <div className="flex gap-3">
          {/* Days */}
          {timeLeft.days > 0 && (
            <div className="flex flex-col items-center">
              <div className="bg-gray-800 rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">days</span>
            </div>
          )}

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 rounded-lg px-3 py-2 min-w-[60px]">
              <span className="text-2xl font-bold text-orange-400">{String(timeLeft.hours).padStart(2, '0')}</span>
            </div>
            <span className="text-xs text-gray-500 mt-1">hours</span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 rounded-lg px-3 py-2 min-w-[60px]">
              <span className="text-2xl font-bold text-orange-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
            </div>
            <span className="text-xs text-gray-500 mt-1">mins</span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 rounded-lg px-3 py-2 min-w-[60px]">
              <span className="text-2xl font-bold text-gray-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
            <span className="text-xs text-gray-500 mt-1">secs</span>
          </div>
        </div>
      )}
    </div>
  );
}
