import type { Board, Player } from '../game/types';
import { getWinCombos } from '@/utils/winCombos';

/**
 * Heuristic evaluation function for the current board.
 * This is used for larger grids (4×4) where minimax is too expensive.
 * @param board The board to evaluate.
 * @param aiPlayer The AI player symbol.
 * @param humanPlayer The human player symbol.
 * @param gridSize The size of the grid.
 * @returns Evaluation score (positive favors AI, negative favors human).
 */
export function evaluate(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  gridSize: number = 3
): number {
  let score = 0;
  const winCombos = getWinCombos(gridSize);

  // Evaluate score for each winning line
  for (const line of winCombos) {
    score += evaluateLine(board, line, aiPlayer, humanPlayer);
  }

  return score;
}

/**
 * Heuristic evaluation function for a given line of cells.
 * @param board The board.
 * @param line Array of cell indices forming a line.
 * @param aiPlayer The AI player symbol.
 * @param humanPlayer The human player symbol.
 * @returns Evaluation score for this line.
 */
function evaluateLine(
  board: Board,
  line: number[],
  aiPlayer: Player,
  humanPlayer: Player
): number {
  let aiCount = 0;
  let humanCount = 0;

  // Count pieces in this line
  for (const cellIndex of line) {
    if (board[cellIndex] === aiPlayer) {
      aiCount++;
    } else if (board[cellIndex] === humanPlayer) {
      humanCount++;
    }
  }

  // If line has both players, it's blocked (no value)
  if (aiCount > 0 && humanCount > 0) {
    return 0;
  }

  // Score based on AI advantage
  if (aiCount > 0) {
    // AI has pieces in this line
    const baseScore = Math.pow(10, aiCount - 1);
    return baseScore;
  } else if (humanCount > 0) {
    // Human has pieces in this line (threat)
    const baseScore = Math.pow(10, humanCount - 1);
    return -baseScore;
  }

  // Empty line (neutral)
  return 0;
}

