'use client';

import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
}

const loadingMessages = [
  "Creating course for you...",
  "Igniting curiosity...",
  "Crafting knowledge...",
  "Preparing your learning journey...",
  "Almost there..."
];

export const LoadingScreen = ({ isVisible }: LoadingScreenProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-spin"></div>
        {/* Inner ring */}
        <div className="absolute inset-2 border-4 border-indigo-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
          {loadingMessages[currentMessageIndex]}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          This may take a few moments...
        </p>
      </div>
    </div>
  );
}; 