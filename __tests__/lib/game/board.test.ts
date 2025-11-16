import { createBoard, isEmptyCell, hasEmptyCells, getEmptyCells, makeMove } from '@/lib/game/board';
import type { Board } from '@/lib/game/types';

describe('board', () => {
  describe('createBoard', () => {
    it('should create a 3x3 board with indices', () => {
      const board = createBoard(3);
      expect(board).toHaveLength(9);
      expect(board).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should create a 4x4 board with indices', () => {
      const board = createBoard(4);
      expect(board).toHaveLength(16);
      expect(board[0]).toBe(0);
      expect(board[15]).toBe(15);
    });
  });

  describe('isEmptyCell', () => {
    it('should return true for number values', () => {
      expect(isEmptyCell(0)).toBe(true);
      expect(isEmptyCell(5)).toBe(true);
    });

    it('should return false for player values', () => {
      expect(isEmptyCell('X')).toBe(false);
      expect(isEmptyCell('O')).toBe(false);
    });
  });

  describe('hasEmptyCells', () => {
    it('should return true when board has empty cells', () => {
      const board: Board = [0, 1, 'X', 3, 4, 5, 6, 7, 8];
      expect(hasEmptyCells(board)).toBe(true);
    });

    it('should return false when board is full', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
      expect(hasEmptyCells(board)).toBe(false);
    });
  });

  describe('getEmptyCells', () => {
    it('should return indices of empty cells', () => {
      const board: Board = ['X', 1, 'O', 3, 4, 5, 6, 7, 8];
      const empty = getEmptyCells(board);
      expect(empty).toEqual([1, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('makeMove', () => {
    it('should place a move on the board', () => {
      const board = createBoard(3);
      const newBoard = makeMove(board, 4, 'X');
      expect(newBoard[4]).toBe('X');
      expect(newBoard[0]).toBe(0); // Other cells unchanged
    });

    it('should throw error if cell is occupied', () => {
      const board: Board = ['X', 1, 2, 3, 4, 5, 6, 7, 8];
      expect(() => makeMove(board, 0, 'O')).toThrow();
    });
  });
});

