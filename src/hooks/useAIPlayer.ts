'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Player, Board } from '@/lib/game/types';
import type { ThinkingData } from '@/lib/ai/thinking';
import { AIPlayer } from '@/lib/ai/aiPlayer';

export function useAIPlayer(gridSize: number = 3, useAlphaBetaPruning: boolean = true) {
  const [thinkingData, setThinkingData] = useState<ThinkingData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const aiPlayer = useMemo(() => new AIPlayer(gridSize, useAlphaBetaPruning), [gridSize, useAlphaBetaPruning]);

  const calculateMove = useCallback(
    async (board: Board, aiPlayerSymbol: Player, humanPlayerSymbol: Player) => {
      setIsCalculating(true);
      
      // Use setTimeout to allow UI to update
      return new Promise<{ move: number; thinking: ThinkingData }>((resolve) => {
        setTimeout(() => {
          const result = aiPlayer.findBestMove(board, aiPlayerSymbol, humanPlayerSymbol);
          setThinkingData(result.thinking);
          setIsCalculating(false);
          resolve(result);
        }, 0);
      });
    },
    [aiPlayer]
  );

  const getRandomCornerMove = useCallback(
    (board: Board) => {
      return aiPlayer.getRandomCornerMove(board);
    },
    [aiPlayer]
  );

  const clearThinking = useCallback(() => {
    setThinkingData(null);
  }, []);

  return {
    calculateMove,
    getRandomCornerMove,
    thinkingData,
    isCalculating,
    clearThinking,
  };
}

