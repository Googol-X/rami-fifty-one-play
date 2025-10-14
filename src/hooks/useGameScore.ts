import { useState, useEffect } from 'react';

export interface RoundResult {
  roundNumber: number;
  playerScore: number;
  botScore: number;
  winner: 'player' | 'bot';
  timestamp: number;
}

export interface GameScore {
  playerTotal: number;
  botTotal: number;
  rounds: RoundResult[];
  targetScore: number;
}

const STORAGE_KEY = 'rami51_game_score';
const DEFAULT_TARGET_SCORE = 200;

export function useGameScore() {
  const [gameScore, setGameScore] = useState<GameScore>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading game score:', error);
    }
    return {
      playerTotal: 0,
      botTotal: 0,
      rounds: [],
      targetScore: DEFAULT_TARGET_SCORE
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameScore));
    } catch (error) {
      console.error('Error saving game score:', error);
    }
  }, [gameScore]);

  const addRound = (playerScore: number, botScore: number, winner: 'player' | 'bot') => {
    setGameScore(prev => ({
      ...prev,
      playerTotal: prev.playerTotal + playerScore,
      botTotal: prev.botTotal + botScore,
      rounds: [
        ...prev.rounds,
        {
          roundNumber: prev.rounds.length + 1,
          playerScore,
          botScore,
          winner,
          timestamp: Date.now()
        }
      ]
    }));
  };

  const resetGame = () => {
    setGameScore({
      playerTotal: 0,
      botTotal: 0,
      rounds: [],
      targetScore: DEFAULT_TARGET_SCORE
    });
  };

  const isGameOver = () => {
    return gameScore.playerTotal >= gameScore.targetScore || 
           gameScore.botTotal >= gameScore.targetScore;
  };

  const getWinner = (): 'player' | 'bot' | null => {
    if (!isGameOver()) return null;
    return gameScore.playerTotal >= gameScore.targetScore ? 'player' : 'bot';
  };

  return {
    gameScore,
    addRound,
    resetGame,
    isGameOver: isGameOver(),
    winner: getWinner()
  };
}
