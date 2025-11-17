import type { Board, Player, GameResult } from './types';
import { getWinCombos } from '@/utils/winCombos';
import { hasEmptyCells } from './board';

/**
 * Check if a player's moves match a win combination.
 * @param winCombo A win combination (array of cell indices).
 * @param moves The moves the player has made (array of cell indices).
 * @returns True if all cells in the win combination are in the player's moves.
 */
function match(winCombo: number[], moves: number[]): boolean {
  return winCombo.every((cell) => moves.includes(cell));
}

/**
 * Check if a player has won the game.
 * @param board The board to check.
 * @param player The player to check for a win.
 * @param gridSize The size of the grid (default: 3).
 * @returns GameResult with winner and winning cells, or null if no win.
 */
export function checkWin(
  board: Board,
  player: Player,
  gridSize: number = 3
): GameResult | null {
  // Get all moves made by the player
  const moves = board.reduce<number[]>(
    (acc, cell, index) => (cell === player ? acc.concat(index) : acc),
    []
  );

  // Get win combinations for this grid size
  // For 3x3: winLength = 3, for 4x4: winLength = 4
  const winLength = gridSize;
  const winCombos = getWinCombos(gridSize, winLength);

  // Check if player's moves match any win combination
  for (const winCombo of winCombos) {
    if (match(winCombo, moves)) {
      return {
        winner: player,
        winningCells: winCombo,
          isDraw: false,
      };
    }
  }

  return null;
}

/**
 * Check if the game is a draw (board is full and no winner).
 * @param board The board to check.
 * @returns True if the game is a draw.
 */
export function checkDraw(board: Board): boolean {
  return !hasEmptyCells(board);
}

