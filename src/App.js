import React, { useState, useEffect } from 'react';
import { Users, Trophy, Calendar, Plus, Minus, Edit2, Target } from 'lucide-react';

const FindingFriendsTracker = () => {
  const [currentPage, setCurrentPage] = useState('new game');
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
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
          <p className="text-lg text-gray-600 mt-4">Coming soon - full game functionality!</p>
        </div>
      </div>
    </div>
  );
};

export default FindingFriendsTracker;
