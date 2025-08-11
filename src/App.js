
import React, { useState, useEffect } from 'react';
import { Users, Trophy, Calendar, Plus, Minus, Edit2, RotateCcw, Star, Award, Target } from 'lucide-react';

const FindingFriendsTracker = () => {
  const [currentPage, setCurrentPage] = useState('new game');
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [gameData, setGameData] = useState(() => {
    // Load data from localStorage on initial load
    try {
      const savedData = localStorage.getItem('findingFriendsData');
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return {};
    }
  });
  
  // Save data to localStorage whenever gameData changes
  useEffect(() => {
    try {
      localStorage.setItem('findingFriendsData', JSON.stringify(gameData));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [gameData]);
  
  // Initialize today's data if it doesn't exist
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

  const getCurrentData = () => gameData[selectedDate] || { players: [], rounds: [], currentRound: 1 };
  const updateCurrentData = (updates) => {
    setGameData(prev => ({
      ...prev,
      [selectedDate]: { ...getCurrentData(), ...updates }
    }));
  };

  // New Game Page Component
  const NewGamePage = () => {
    const data = getCurrentData();
    const [playerNames, setPlayerNames] = useState(data.players || ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6']);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [host, setHost] = useState('');
    const [friends, setFriends] = useState([]);
    const [gameMode, setGameMode] = useState('normal');
    const [bid, setBid] = useState(80);
    const [noBids, setNoBids] = useState(false);
    const [opponentScore, setOpponentScore] = useState('');
    const [editingIndex, setEditingIndex] = useState(-1);

    const adjustBid = (amount) => {
      setBid(prev => Math.max(0, Math.min(150, prev + amount)));
    };

    const selectAll = () => {
      setSelectedPlayers(playerNames.slice(0, 6));
    };

    const calculateScores = () => {
      const finalBid = gameMode === '1v5' ? 200 : (noBids ? 160 : bid);
      const opScore = parseInt(opponentScore) || 0;
      const opponentWins = opScore >= finalBid;
      
      let scores = {};
      
      // Initialize all selected players with 0
      selectedPlayers.forEach(player => {
        scores[player] = 0;
      });

      if (opponentWins) {
        // Opponents win - split score evenly among opponents
        const opponents = selectedPlayers.filter(p => p !== host && !friends.includes(p));
        const totalScore = (opScore * 1.5) / opponents.length;
        opponents.forEach(opponent => {
          scores[opponent] = Math.round(totalScore);
        });
      } else {
        // Host team wins
        if (gameMode === '1v5') {
          // 1v5 mode - host gets all 400 points
          scores[host] = 400;
        } else {
          const baseScore = 400 - opScore;
          if (friends.length === 0) {
            scores[host] = baseScore;
          } else if (friends.length === 1) {
            scores[host] = Math.round(baseScore * 0.75);
            scores[friends[0]] = Math.round(baseScore * 0.25);
          } else if (friends.length === 2) {
            scores[host] = Math.round(baseScore * 0.5);
            scores[friends[0]] = Math.round(baseScore * 0.25);
            scores[friends[1]] = Math.round(baseScore * 0.25);
          }
        }
      }

      // Add round to data
      const newRound = {
        round: data.currentRound,
        players: selectedPlayers,
        host,
        friends: [...friends],
        bid: finalBid,
        opponentScore: opScore,
        scores,
        winner: opponentWins ? 'Opponents' : 'Host Team'
      };

      const updatedRounds = [...data.rounds, newRound];
      updateCurrentData({ 
        rounds: updatedRounds, 
        currentRound: data.currentRound + 1,
        players: playerNames 
      });

      // Reset form
      setSelectedPlayers([]);
      setHost('');
      setFriends([]);
      setBid(80);
      setOpponentScore('');
      setNoBids(false);
    };

    const availableFriends = selectedPlayers.filter(p => p !== host);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎮 Round {data.currentRound}
          </h2>
          
          {/* Player Names */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              👥 Player Names
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {playerNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[index] = e.target.value;
                        setPlayerNames(newNames);
                      }}
                      onBlur={() => setEditingIndex(-1)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingIndex(-1)}
                      className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="flex-1 px-3 py-2 bg-white rounded-lg border-2 border-gray-200">
                        {name}
                      </span>
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={selectAll}
              className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Users size={16} />
              Select First 6
            </button>
          </div>

          {/* Selected Players */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">🎯 Players This Round</h3>
            <div className="grid grid-cols-3 gap-2">
              {playerNames.map(name => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(name)}
                    onChange={(e) => {
                      if (e.target.checked && selectedPlayers.length < 6) {
                        setSelectedPlayers(prev => [...prev, name]);
                      } else if (!e.target.checked) {
                        setSelectedPlayers(prev => prev.filter(p => p !== name));
                      }
                    }}
                    disabled={!selectedPlayers.includes(name) && selectedPlayers.length >= 6}
                    className="rounded"
                  />
                  <span className="text-sm">{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Game Mode */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">🎲 Game Mode</label>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            >
              <option value="normal">Normal Mode</option>
              <option value="1v5">1v5 Mode</option>
            </select>
          </div>

          {/* Host Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">👑 Select Host</label>
            <select
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            >
              <option value="">Select Host</option>
              {selectedPlayers.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>

          {/* Friends Selection */}
          {gameMode !== '1v5' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">🤝 Select Friends (1-2)</label>
              <div className="space-y-2">
                {availableFriends.map(player => (
                  <label key={player} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={friends.includes(player)}
                      onChange={(e) => {
                        if (e.target.checked && friends.length < 2) {
                          setFriends(prev => [...prev, player]);
                        } else if (!e.target.checked) {
                          setFriends(prev => prev.filter(f => f !== player));
                        }
                      }}
                      disabled={!friends.includes(player) && friends.length >= 2}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {player} {player === host ? '(host)' : ''}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Bid Settings */}
          {gameMode !== '1v5' && (
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <label className="text-sm font-medium">💰 Starting Bid</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noBids}
                    onChange={(e) => setNoBids(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">No Bids? (160)</span>
                </label>
              </div>
              {!noBids && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustBid(-5)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-mono text-lg min-w-[80px] text-center">
                    {bid}
                  </span>
                  <button
                    onClick={() => adjustBid(5)}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Opponent Score */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">🎯 Final Opponent Score</label>
            <input
              type="number"
              value={opponentScore}
              onChange={(e) => setOpponentScore(e.target.value)}
              placeholder="Enter opponent score"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={calculateScores}
            disabled={!host || selectedPlayers.length !== 6 || opponentScore === ''}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
          >
            <Trophy size={20} />
            Add Game & Calculate Scores
          </button>
        </div>
      </div>
    );
  };

  // Statistics Page Component
  const StatisticsPage = () => {
    const data = getCurrentData();
    const isToday = selectedDate === new Date().toDateString();
    
    // Calculate statistics
    const playerStats = {};
    const allPlayers = new Set();
    
    data.rounds.forEach(round => {
      round.players.forEach(player => allPlayers.add(player));
      
      round.players.forEach(player => {
        if (!playerStats[player]) {
          playerStats[player] = {
            totalScore: 0,
            gamesPlayed: 0,
            hostGames: 0,
            hostWins: 0,
            friendGames: 0,
            friendWins: 0
          };
        }
        
        playerStats[player].totalScore += round.scores[player] || 0;
        playerStats[player].gamesPlayed++;
        
        if (round.host === player) {
          playerStats[player].hostGames++;
          if (round.winner === 'Host Team') {
            playerStats[player].hostWins++;
          }
        }
        
        if (round.friends.includes(player)) {
          playerStats[player].friendGames++;
          if (round.winner === 'Host Team') {
            playerStats[player].friendWins++;
          }
        }
      });
    });

    const sortedPlayers = Array.from(allPlayers).sort((a, b) => 
      (playerStats[b]?.totalScore || 0) - (playerStats[a]?.totalScore || 0)
    );

    const bestHost = sortedPlayers.reduce((best, player) => {
      const stats = playerStats[player];
      const winrate = stats?.hostGames > 0 ? (stats.hostWins / stats.hostGames) * 100 : 0;
      const bestWinrate = best ? (playerStats[best].hostGames > 0 ? (playerStats[best].hostWins / playerStats[best].hostGames) * 100 : 0) : 0;
      return winrate > bestWinrate ? player : best;
    }, null);

    const bestFriend = sortedPlayers.reduce((best, player) => {
      const stats = playerStats[player];
      const winrate = stats?.friendGames > 0 ? (stats.friendWins / stats.friendGames) * 100 : 0;
      const bestWinrate = best ? (playerStats[best].friendGames > 0 ? (playerStats[best].friendWins / playerStats[best].friendGames) * 100 : 0) : 0;
      return winrate > bestWinrate ? player : best;
    }, null);

    const mostGamesPlayer = sortedPlayers.reduce((most, player) => {
      const games = playerStats[player]?.gamesPlayed || 0;
      const mostGames = most ? (playerStats[most]?.gamesPlayed || 0) : 0;
      return games > mostGames ? player : most;
    }, null);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-2 border-green-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📊 Statistics
          </h2>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border-2 border-purple-200 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm text-gray-600">Best Host Tonight</div>
              <div className="font-bold text-purple-600">
                {bestHost ? `${bestHost} (${((playerStats[bestHost].hostWins / playerStats[bestHost].hostGames) * 100).toFixed(1)}%)` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border-2 border-pink-200 text-center">
              <div className="text-2xl mb-1">🤝</div>
              <div className="text-sm text-gray-600">Best Friend Tonight</div>
              <div className="font-bold text-pink-600">
                {bestFriend ? `${bestFriend} (${((playerStats[bestFriend].friendWins / playerStats[bestFriend].friendGames) * 100).toFixed(1)}%)` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border-2 border-blue-200 text-center">
              <div className="text-2xl mb-1">🎮</div>
              <div className="text-sm text-gray-600">Total Rounds</div>
              <div className="font-bold text-blue-600">{data.rounds.length}</div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border-2 border-orange-200 text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-sm text-gray-600">Most Games Played</div>
              <div className="font-bold text-orange-600">
                {mostGamesPlayer ? `${mostGamesPlayer} (${playerStats[mostGamesPlayer].gamesPlayed})` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Player Rankings */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b-2 border-gray-200">
              <h3 className="text-lg font-semibold">🏅 Player Rankings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Rank</th>
                    <th className="px-4 py-3 text-left font-semibold">Player</th>
                    <th className="px-4 py-3 text-right font-semibold">Total Score</th>
                    <th className="px-4 py-3 text-right font-semibold">Games</th>
                    <th className="px-4 py-3 text-right font-semibold">Host W/L</th>
                    <th className="px-4 py-3 text-right font-semibold">Host Rate</th>
                    <th className="px-4 py-3 text-right font-semibold">Friend W/L</th>
                    <th className="px-4 py-3 text-right font-semibold">Friend Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, index) => {
                    const stats = playerStats[player];
                    const hostRate = stats.hostGames > 0 ? (stats.hostWins / stats.hostGames) * 100 : 0;
                    const friendRate = stats.friendGames > 0 ? (stats.friendWins / stats.friendGames) * 100 : 0;
                    
                    return (
                      <tr key={player} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 font-bold">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                        </td>
                        <td className="px-4 py-3 font-semibold">{player}</td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600">{stats.totalScore}</td>
                        <td className="px-4 py-3 text-right">{stats.gamesPlayed}</td>
                        <td className="px-4 py-3 text-right">{stats.hostWins}/{stats.hostGames}</td>
                        <td className={`px-4 py-3 text-right font-semibold rounded ${
                          hostRate > 50 ? 'bg-green-100 text-green-800' : 
                          hostRate < 50 && stats.hostGames > 0 ? 'bg-red-100 text-red-800' : ''
                        }`}>
                          {stats.hostGames > 0 ? `${hostRate.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">{stats.friendWins}/{stats.friendGames}</td>
                        <td className={`px-4 py-3 text-right font-semibold rounded ${
                          friendRate > 50 ? 'bg-green-100 text-green-800' : 
                          friendRate < 50 && stats.friendGames > 0 ? 'bg-red-100 text-red-800' : ''
                        }`}>
                          {stats.friendGames > 0 ? `${friendRate.toFixed(1)}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Details Page Component
  const DetailsPage = () => {
    const data = getCurrentData();
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📋 Game Details
          </h2>

          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b-2 border-gray-200">
              <h3 className="text-lg font-semibold">🎯 Round History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Round</th>
                    <th className="px-4 py-3 text-left font-semibold">Host</th>
                    <th className="px-4 py-3 text-left font-semibold">Friends</th>
                    <th className="px-4 py-3 text-right font-semibold">Bid</th>
                    <th className="px-4 py-3 text-right font-semibold">Opponent Score</th>
                    <th className="px-4 py-3 text-left font-semibold">Winner</th>
                    <th className="px-4 py-3 text-left font-semibold">Scores</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rounds.map((round, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 font-bold">Round {round.round}</td>
                      <td className="px-4 py-3">{round.host}</td>
                      <td className="px-4 py-3">{round.friends.join(', ') || 'None'}</td>
                      <td className="px-4 py-3 text-right">{round.bid}</td>
                      <td className="px-4 py-3 text-right">{round.opponentScore}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          round.winner === 'Host Team' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {round.winner}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {Object.entries(round.scores)
                          .filter(([player, score]) => score > 0)
                          .map(([player, score]) => `${player}: ${score}`)
                          .join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Past Games Page Component
  const PastGamesPage = () => {
    const availableDates = Object.keys(gameData).sort((a, b) => new Date(b) - new Date(a));
    const isAllTime = selectedDate === 'all-time';
    
    // Calculate all-time statistics
    const allTimeStats = {};
    if (isAllTime) {
      Object.values(gameData).forEach(dayData => {
        dayData.rounds.forEach(round => {
          round.players.forEach(player => {
            if (!allTimeStats[player]) {
              allTimeStats[player] = {
                totalScore: 0,
                gamesPlayed: 0,
                hostGames: 0,
                hostWins: 0,
                friendGames: 0,
                friendWins: 0
              };
            }
            
            allTimeStats[player].totalScore += round.scores[player] || 0;
            allTimeStats[player].gamesPlayed++;
            
            if (round.host === player) {
              allTimeStats[player].hostGames++;
              if (round.winner === 'Host Team') {
                allTimeStats[player].hostWins++;
              }
            }
            
            if (round.friends.includes(player)) {
              allTimeStats[player].friendGames++;
              if (round.winner === 'Host Team') {
                allTimeStats[player].friendWins++;
              }
            }
          });
        });
      });
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📅 Past Games
          </h2>
          
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            >
              <option value="all-time">🏆 All Time Statistics</option>
              {availableDates.map(date => (
                <option key={date} value={date}>
                  📅 {date}
                </option>
              ))}
            </select>
          </div>
          
          {isAllTime ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b-2 border-gray-200">
                <h3 className="text-lg font-semibold">🏆 All Time Rankings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Rank</th>
                      <th className="px-4 py-3 text-left font-semibold">Player</th>
                      <th className="px-4 py-3 text-right font-semibold">Total Score</th>
                      <th className="px-4 py-3 text-right font-semibold">Games Played</th>
                      <th className="px-4 py-3 text-right font-semibold">Host Rate</th>
                      <th className="px-4 py-3 text-right font-semibold">Friend Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(allTimeStats)
                      .sort((a, b) => allTimeStats[b].totalScore - allTimeStats[a].totalScore)
                      .map((player, index) => {
                        const stats = allTimeStats[player];
                        const hostRate = stats.hostGames > 0 ? (stats.hostWins / stats.hostGames) * 100 : 0;
                        const friendRate = stats.friendGames > 0 ? (stats.friendWins / stats.friendGames) * 100 : 0;
                        
                        return (
                          <tr key={player} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-4 py-3 font-bold">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                            </td>
                            <td className="px-4 py-3 font-semibold">{player}</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-600">{stats.totalScore.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{stats.gamesPlayed}</td>
                            <td className={`px-4 py-3 text-right font-semibold rounded ${
                              hostRate > 50 ? 'bg-green-100 text-green-800' : 
                              hostRate < 50 && stats.hostGames > 0 ? 'bg-red-100 text-red-800' : ''
                            }`}>
                              {stats.hostGames > 0 ? `${hostRate.toFixed(1)}%` : '-'}
                            </td>
                            <td className={`px-4 py-3 text-right font-semibold rounded ${
                              friendRate > 50 ? 'bg-green-100 text-green-800' : 
                              friendRate < 50 && stats.friendGames > 0 ? 'bg-red-100 text-red-800' : ''
                            }`}>
                              {stats.friendGames > 0 ? `${friendRate.toFixed(1)}%` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <StatisticsPage />
          )}
        </div>
      </div>
    );
  };

  const getCurrentDate = () => {
    if (selectedDate === 'all-time') return 'All Time Statistics';
    const today = new Date().toDateString();
    if (selectedDate === today) return `Today - ${selectedDate}`;
    return selectedDate;
  };

  const isToday = selectedDate === new Date().toDateString();
  const canCreateGame = isToday || selectedDate === 'all-time';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-purple-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              🎴 Finding Friends Score Tracker
            </h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">Current Date</div>
              <div className="text-lg font-semibold text-purple-600">{getCurrentDate()}</div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setCurrentPage('new game')}
              className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                currentPage === 'new game' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              disabled={!canCreateGame}
            >
              <Users size={18} />
              New Game
            </button>
            <button
              onClick={() => setCurrentPage('statistics')}
              className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                currentPage === 'statistics' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Trophy size={18} />
              Statistics
            </button>
            <button
              onClick={() => setCurrentPage('details')}
              className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                currentPage === 'details' 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              <Target size={18} />
              Details
            </button>
            <button
              onClick={() => setCurrentPage('past games')}
              className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                currentPage === 'past games' 
                  ? 'bg-indigo-500 text-white shadow-lg' 
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              <Calendar size={18} />
              Past Games
            </button>
          </div>
        </div>

        {/* Page Content */}
        {currentPage === 'new game' && canCreateGame && <NewGamePage />}
        {currentPage === 'statistics' && <StatisticsPage />}
        {currentPage === 'details' && <DetailsPage />}
        {currentPage === 'past games' && <PastGamesPage />}
        
        {currentPage === 'new game' && !canCreateGame && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">⏰</div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cannot Create New Games</h3>
            <p className="text-yellow-700">You can only create new games for today's date. View past statistics or switch to today's date to create new games.</p>
          </div>
        )}

        {/* Scoreboard for current rounds */}
        {getCurrentData().rounds.length > 0 && currentPage !== 'past games' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              📊 Current Scoreboard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Player</th>
                    {getCurrentData().rounds.map((_, index) => (
                      <th key={index} className="px-4 py-2 text-center font-semibold">
                        R{index + 1}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(getCurrentData().rounds.flatMap(r => r.players)))
                    .sort((a, b) => {
                      const aTotal = getCurrentData().rounds.reduce((sum, r) => sum + (r.scores[a] || 0), 0);
                      const bTotal = getCurrentData().rounds.reduce((sum, r) => sum + (r.scores[b] || 0), 0);
                      return bTotal - aTotal;
                    })
                    .map((player, index) => {
                      const total = getCurrentData().rounds.reduce((sum, r) => sum + (r.scores[player] || 0), 0);
                      return (
                        <tr key={player} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-2 font-semibold">
                            {index === 0 && '🏆 '}{player}
                          </td>
                          {getCurrentData().rounds.map((round, roundIndex) => (
                            <td key={roundIndex} className="px-4 py-2 text-center">
                              {round.players.includes(player) ? (round.scores[player] || 0) : '-'}
                            </td>
                          ))}
                          <td className="px-4 py-2 text-right font-bold text-blue-600">{total}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindingFriendsTracker;

