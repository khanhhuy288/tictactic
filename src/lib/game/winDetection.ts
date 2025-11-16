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
  const winCombos = getWinCombos(gridSize);

  // Check if player's moves match any win combination
  for (const [index, winCombo] of winCombos.entries()) {
    if (match(winCombo, moves)) {
      return {
        winner: player,
        winningCells: winCombo,
        isTie: false,
      };
    }
  }

  return null;
}

/**
 * Check if the game is a tie (board is full and no winner).
 * @param board The board to check.
 * @param gridSize The size of the grid (default: 3).
 * @returns True if the game is a tie.
 */
export function checkTie(board: Board, gridSize: number = 3): boolean {
  return !hasEmptyCells(board);
}

