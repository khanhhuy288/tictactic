import type { GameState, Player, Board } from './types';
import { createBoard } from './board';

const DEFAULT_GRID_SIZE = 3;

/**
 * Create initial game state.
 * @param gridSize The size of the grid (default: 3).
 * @returns Initial game state.
 */
export function createGameState(gridSize: number = DEFAULT_GRID_SIZE): GameState {
  return {
    board: createBoard(gridSize),
    currentPlayer: null,
    humanPlayer: null,
    aiPlayer: null,
    status: 'symbol-selection',
    winner: null,
    winningCells: null,
  };
}

/**
 * Reset game state to initial state.
 * @param currentState Current game state.
 * @param gridSize The size of the grid (default: 3).
 * @returns Reset game state.
 */
export function resetGameState(
  currentState: GameState,
  gridSize: number = DEFAULT_GRID_SIZE
): GameState {
  return {
    ...createGameState(gridSize),
    humanPlayer: currentState.humanPlayer,
    aiPlayer: currentState.aiPlayer,
  };
}

/**
 * Set players and start the game.
 * @param state Current game state.
 * @param humanPlayer The human player's symbol.
 * @returns Updated game state with players set.
 */
export function setPlayers(state: GameState, humanPlayer: Player): GameState {
  const aiPlayer: Player = humanPlayer === 'O' ? 'X' : 'O';
  return {
    ...state,
    humanPlayer,
    aiPlayer,
    currentPlayer: 'X', // X always goes first
    status: 'playing',
  };
}

