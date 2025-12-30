
import React, { useState, useEffect } from 'react';
import { GameState, Difficulty, Choice, PlayerStats, LeaderboardEntry } from './types';
import { GameServer } from './services/gameServer';
import { StorageService } from './services/storageService';
import Scoreboard from './components/Scoreboard';
import HandIcon from './components/HandIcon';

const App: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [game, setGame] = useState<GameServer | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setLeaderboard(StorageService.getLeaderboard());
    setStats(StorageService.getStats());
  }, []);

  const startGame = () => {
    if (!playerName.trim()) return;
    const newGame = new GameServer(playerName, difficulty, 5);
    setGame(newGame);
    setGameState({ ...newGame.getState(), phase: 'Playing' });
  };

  const handlePlayTurn = async (choice: Choice) => {
    if (!game || isProcessing) return;
    setIsProcessing(true);
    
    // Slight delay for "Rock Paper Scissors... SHOOT!" feeling
    setTimeout(async () => {
      const newState = await game.playTurn(choice);
      setGameState(newState);
      setIsProcessing(false);

      if (newState.phase === 'GameOver') {
        saveMatchResult(newState);
      }
    }, 450);
  };

  const saveMatchResult = (finalState: GameState) => {
    const currentStats = StorageService.getStats();
    const isUserWinner = finalState.userScore >= finalState.targetScore;
    
    const updatedStats: PlayerStats = {
      ...currentStats,
      name: finalState.playerName,
      matchesPlayed: currentStats.matchesPlayed + 1,
      wins: currentStats.wins + (isUserWinner ? 1 : 0),
      losses: currentStats.losses + (isUserWinner ? 0 : 1),
      winStreak: isUserWinner ? (currentStats.winStreak || 0) + 1 : 0,
      highStreak: Math.max(currentStats.highStreak || 0, isUserWinner ? (currentStats.winStreak || 0) + 1 : 0)
    };
    
    StorageService.saveStats(updatedStats);
    setStats(updatedStats);
    setLeaderboard(StorageService.getLeaderboard());
  };

  const resetGame = () => {
    setGame(null);
    setGameState(null);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-main">
        <div className="text-center mb-10 animate-bounce-subtle">
          <h1 className="text-5xl md:text-7xl font-black font-outfit text-white mb-2 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] leading-tight uppercase">
            ROCK PAPER <span className="text-blue-500">SCISSORS</span>
          </h1>
        </div>

        <div className="glass-card p-8 rounded-3xl w-full max-w-md shadow-2xl border-t border-blue-500/20">
          <div className="mb-6">
            <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-widest">Guest Name</label>
            <input 
              type="text" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>

          <div className="mb-8">
            <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-widest">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-xl font-bold text-xs transition-all uppercase tracking-tighter ${
                    difficulty === d 
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/50' 
                      : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={startGame}
            disabled={!playerName.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
          >
            Start Match
          </button>
        </div>

        {leaderboard.length > 0 && (
          <div className="mt-12 w-full max-w-md">
            <h3 className="text-slate-400 text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest">
              <i className="fa-solid fa-bolt-lightning text-blue-400"></i> Global Top Streaks
            </h3>
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
              {leaderboard.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border-b border-slate-800/50 last:border-0 hover:bg-blue-500/5 transition-colors">
                  <span className="text-slate-400 font-medium text-sm">{idx + 1}. {entry.name}</span>
                  <span className="text-blue-400 font-bold text-sm">{entry.highStreak} Streak</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col p-4 sm:p-8 bg-gradient-to-b from-blue-950/20 to-transparent">
      {/* Header Info */}
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center mb-8">
        <button onClick={resetGame} className="text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
          <i className="fa-solid fa-arrow-left"></i> Resign
        </button>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Difficulty mode</p>
          <p className="text-blue-400 font-black text-sm">{gameState.difficulty.toUpperCase()}</p>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <Scoreboard state={gameState} />

        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-12 mt-4 mb-16">
          {/* AI Side */}
          <div className="flex flex-col items-center order-2 md:order-1">
            {/* Neural Link removed as requested */}
            <div className={`w-36 h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-300 relative ${
              isProcessing 
                ? 'animate-pulse bg-violet-900/20 border-2 border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]' 
                : 'bg-slate-900/80 border-2 border-slate-800 shadow-xl'
            }`}>
              {!isProcessing && gameState.aiLastChoice ? (
                <HandIcon value={gameState.aiLastChoice} className="text-violet-400" />
              ) : (
                <i className="fa-solid fa-microchip text-slate-700 text-5xl"></i>
              )}
              {gameState.roundResult === 'lose' && !isProcessing && (
                <div className="absolute -top-2 -right-2 bg-violet-600 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg animate-bounce">ROUND WIN</div>
              )}
            </div>
            <p className="mt-4 text-xs font-bold text-slate-600 uppercase tracking-widest">SYSTEM</p>
          </div>

          {/* Center Message */}
          <div className="text-center order-1 md:order-2">
            <h2 className={`text-4xl font-black uppercase tracking-tighter mb-2 transition-all duration-300 ${
              gameState.roundResult === 'win' ? 'text-blue-400' : 
              gameState.roundResult === 'lose' ? 'text-violet-400' : 'text-white'
            }`}>
              {isProcessing ? 'SCANNING...' : gameState.roundResult === 'draw' ? 'STALEMATE' : gameState.message}
            </h2>
            {!isProcessing && gameState.userLastChoice && (
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                Next Calculation Initializing...
              </p>
            )}
          </div>

          {/* User Side */}
          <div className="flex flex-col items-center order-3">
            <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-3">Operator</span>
            <div className="w-36 h-36 rounded-[2.5rem] bg-blue-950/20 border-2 border-blue-500/50 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.15)] relative">
              {gameState.userLastChoice ? (
                <HandIcon value={gameState.userLastChoice} className="text-blue-400" />
              ) : (
                <i className="fa-solid fa-user-shield text-blue-900 text-5xl"></i>
              )}
              {gameState.roundResult === 'win' && !isProcessing && (
                <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg animate-bounce">ROUND WIN</div>
              )}
            </div>
            <p className="mt-4 text-xs font-bold text-slate-600 uppercase tracking-widest">{gameState.playerName}</p>
          </div>
        </div>

        {/* Action Controls */}
        {gameState.phase === 'Playing' && !isProcessing && (
          <div className="grid grid-cols-3 gap-6 w-full max-w-xl mx-auto">
            {(['Rock', 'Paper', 'Scissors'] as Choice[]).map(choice => (
              <button
                key={choice}
                onClick={() => handlePlayTurn(choice)}
                className="group relative flex flex-col items-center justify-center p-6 glass-card rounded-3xl border border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 transition-all active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <HandIcon value={choice} className="group-hover:scale-110 transition-transform mb-3 text-slate-400 group-hover:text-blue-400" />
                <span className="font-black text-xs uppercase tracking-widest text-slate-500 group-hover:text-blue-300">{choice}</span>
              </button>
            ))}
          </div>
        )}

        {/* Match Result Overlay */}
        {gameState.phase === 'GameOver' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
            <div className="max-w-md w-full glass-card p-10 rounded-[3rem] border-2 border-blue-500/30 text-center shadow-[0_0_100px_rgba(59,130,246,0.2)]">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border-4 ${
                gameState.userScore > gameState.aiScore ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-violet-500 bg-violet-500/20 text-violet-400'
              }`}>
                <i className={`fa-solid ${gameState.userScore > gameState.aiScore ? 'fa-medal' : 'fa-skull'} text-5xl`}></i>
              </div>
              <h2 className="text-4xl font-black mb-4 font-outfit text-white uppercase tracking-tighter">Match Finalized</h2>
              <p className="text-slate-400 mb-8 font-medium leading-relaxed">{gameState.message}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Your Score</p>
                  <p className="text-3xl font-black text-blue-400">{gameState.userScore}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">AI Score</p>
                  <p className="text-3xl font-black text-violet-400">{gameState.aiScore}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={startGame}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-900/40"
                >
                  Request Rematch
                </button>
                <button 
                  onClick={resetGame}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-black py-4 rounded-2xl transition-all uppercase text-xs tracking-[0.2em]"
                >
                  Exit Arena
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Dashboard removed as requested */}
    </div>
  );
};

export default App;
