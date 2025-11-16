import type { Board, CellValue, Player } from './types';

const DEFAULT_GRID_SIZE = 3;

/**
 * Create an empty board of the specified size.
 * @param gridSize The size of the grid (e.g., 3 for 3×3).
 * @returns A board array with indices as cell values.
 */
export function createBoard(gridSize: number = DEFAULT_GRID_SIZE): Board {
  return Array.from(Array(gridSize * gridSize).keys());
}

/**
 * Check if a cell is empty (contains a number/index).
 * @param cellValue The value in the cell.
 * @returns True if the cell is empty.
 */
export function isEmptyCell(cellValue: CellValue): boolean {
  return typeof cellValue === 'number';
}

/**
 * Check if there are any empty cells left on the board.
 * @param board The board to check.
 * @returns True if there are empty cells remaining.
 */
export function hasEmptyCells(board: Board): boolean {
  return board.some(isEmptyCell);
}

/**
 * Get all empty cell indices from the board.
 * @param board The board to check.
 * @returns Array of indices representing empty cells.
 */
export function getEmptyCells(board: Board): number[] {
  return board
    .map((cell, index) => (isEmptyCell(cell) ? index : null))
    .filter((index): index is number => index !== null);
}

/**
 * Make a move on the board.
 * @param board The board to update.
 * @param index The cell index to place the move.
 * @param player The player making the move.
 * @returns A new board with the move applied.
 */
export function makeMove(board: Board, index: number, player: Player): Board {
  if (!isEmptyCell(board[index])) {
    throw new Error(`Cell ${index} is already occupied`);
  }
  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
}

