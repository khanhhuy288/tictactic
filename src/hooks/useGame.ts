'use client';

import { useState, useCallback } from 'react';
import type { Player, GameState, GameResult } from '@/lib/game/types';
import { createGameState, setPlayers, resetGameState } from '@/lib/game/gameState';
import { makeMove } from '@/lib/game/board';
import { checkWin, checkDraw } from '@/lib/game/winDetection';

export function useGame(gridSize: number = 3) {
  const [gameState, setGameState] = useState<GameState>(() => createGameState(gridSize));

  const selectSymbol = useCallback((player: Player) => {
    setGameState((prev) => {
      const newState = setPlayers(prev, player);
      return newState;
    });
  }, []);

  const makePlayerMove = useCallback(
    (index: number): GameResult | null => {
      let result: GameResult | null = null;

      setGameState((prev) => {
        if (prev.status !== 'playing' || prev.currentPlayer === null) {
          return prev;
        }

        // Check if cell is empty
        if (typeof prev.board[index] !== 'number') {
          return prev;
        }

        const newBoard = makeMove(prev.board, index, prev.currentPlayer);
        const winResult = checkWin(newBoard, prev.currentPlayer, gridSize);

        if (winResult) {
          result = winResult;
          return {
            ...prev,
            board: newBoard,
            status: 'won',
            winner: winResult.winner!,
            winningCells: winResult.winningCells,
          };
        }

        if (checkDraw(newBoard)) {
          result = { winner: null, winningCells: null, isDraw: true };
          return {
            ...prev,
            board: newBoard,
            status: 'draw',
          };
        }

        // Switch player
        const nextPlayer: Player = prev.currentPlayer === 'X' ? 'O' : 'X';
        return {
          ...prev,
          board: newBoard,
          currentPlayer: nextPlayer,
        };
      });

      return result;
    },
    [gridSize]
  );

  const makeAIMove = useCallback(
    (index: number): GameResult | null => {
      let result: GameResult | null = null;

      setGameState((prev) => {
        if (prev.status !== 'playing' || prev.currentPlayer === null) {
          return prev;
        }

        // Check if cell is empty
        if (typeof prev.board[index] !== 'number') {
          return prev;
        }

        const newBoard = makeMove(prev.board, index, prev.currentPlayer);
        const winResult = checkWin(newBoard, prev.currentPlayer, gridSize);

        if (winResult) {
          result = winResult;
          return {
            ...prev,
            board: newBoard,
            status: 'won',
            winner: winResult.winner!,
            winningCells: winResult.winningCells,
          };
        }

        if (checkDraw(newBoard)) {
          result = { winner: null, winningCells: null, isDraw: true };
          return {
            ...prev,
            board: newBoard,
            status: 'draw',
          };
        }

        // Switch back to human player
        return {
          ...prev,
          board: newBoard,
          currentPlayer: prev.humanPlayer!,
        };
      });

      return result;
    },
    [gridSize]
  );

  const reset = useCallback(
    (nextGridSize?: number) => {
      setGameState((prev) => resetGameState(prev, nextGridSize ?? gridSize));
    },
    [gridSize]
  );

  const isHumanTurn = gameState.status === 'playing' && gameState.currentPlayer === gameState.humanPlayer;
  const isAITurn = gameState.status === 'playing' && gameState.currentPlayer === gameState.aiPlayer;

  return {
    gameState,
    selectSymbol,
    makePlayerMove,
    makeAIMove,
    reset,
    isHumanTurn,
    isAITurn,
    gridSize,
  };
}

