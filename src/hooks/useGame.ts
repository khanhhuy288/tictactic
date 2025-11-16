'use client';

import { useState, useCallback } from 'react';
import type { Player, GameState, GameResult } from '@/lib/game/types';
import { createGameState, setPlayers, resetGameState } from '@/lib/game/gameState';
import { makeMove } from '@/lib/game/board';
import { checkWin, checkTie } from '@/lib/game/winDetection';

const GRID_SIZE = 3;

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(() => createGameState(GRID_SIZE));

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
        const winResult = checkWin(newBoard, prev.currentPlayer, GRID_SIZE);

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

        if (checkTie(newBoard, GRID_SIZE)) {
          result = { winner: null, winningCells: null, isTie: true };
          return {
            ...prev,
            board: newBoard,
            status: 'tie',
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
    []
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
        const winResult = checkWin(newBoard, prev.currentPlayer, GRID_SIZE);

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

        if (checkTie(newBoard, GRID_SIZE)) {
          result = { winner: null, winningCells: null, isTie: true };
          return {
            ...prev,
            board: newBoard,
            status: 'tie',
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
    []
  );

  const reset = useCallback(() => {
    setGameState((prev) => resetGameState(prev, GRID_SIZE));
  }, []);

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
    gridSize: GRID_SIZE,
  };
}

