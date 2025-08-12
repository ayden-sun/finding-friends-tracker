import React, { useState, useEffect } from 'react';

const FindingFriendsTracker = () => {
  const [gameData, setGameData] = useState(() => {
    try {
      const savedData = localStorage.getItem('findingFriendsData');
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return {};
    }
  });
  
  useEffect(() => {
    try {
      localStorage.setItem('findingFriendsData', JSON.stringify(gameData));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [gameData]);
  
  useEffect(() => {
    const today = new Date().toDateString();
    if (!gameData[today]) {
      setGameData(prev => ({
        ...prev,
        [today]: {
          players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6'],
          rounds: [],
          currentRound: 1
        }
      }));
    }
  }, [gameData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-purple-200">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎴 Finding Friends Score Tracker
          </h1>
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
            <h2 className="text-xl font-bold text-gray-800 mb-3">✅ Successfully Deployed!</h2>
            <p className="text-gray-700 mb-4">Your Finding Friends tracker is now live on the internet!</p>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">🎮 Coming Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 6-player game setup and management</li>
                <li>• Host and friend selection system</li>
                <li>• Automatic score calculation (400 points distribution)</li>
                <li>• 1v5 mode and bidding system</li>
                <li>• Player statistics and win rates</li>
                <li>• Game history and past performance</li>
                <li>• Data persistence (saves your games)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindingFriendsTracker;
