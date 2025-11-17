import { checkWin, checkDraw } from '@/lib/game/winDetection';
import type { Board } from '@/lib/game/types';

describe('winDetection', () => {
  describe('checkWin', () => {
    it('should detect horizontal win for X', () => {
      const board: Board = ['X', 'X', 'X', 3, 4, 5, 6, 7, 8];
      const result = checkWin(board, 'X', 3);
      expect(result).not.toBeNull();
      expect(result?.winner).toBe('X');
      expect(result?.winningCells).toEqual([0, 1, 2]);
    });

    it('should detect vertical win for O', () => {
      const board: Board = ['O', 1, 2, 'O', 4, 5, 'O', 7, 8];
      const result = checkWin(board, 'O', 3);
      expect(result).not.toBeNull();
      expect(result?.winner).toBe('O');
      expect(result?.winningCells).toEqual([0, 3, 6]);
    });

    it('should detect diagonal win', () => {
      const board: Board = ['X', 1, 2, 3, 'X', 5, 6, 7, 'X'];
      const result = checkWin(board, 'X', 3);
      expect(result).not.toBeNull();
      expect(result?.winner).toBe('X');
      expect(result?.winningCells).toEqual([0, 4, 8]);
    });

    it('should return null when no win', () => {
      const board: Board = ['X', 'O', 'X', 3, 4, 5, 6, 7, 8];
      const result = checkWin(board, 'X', 3);
      expect(result).toBeNull();
    });
  });

  describe('checkDraw', () => {
    it('should return true when board is full and no winner', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      expect(checkDraw(board)).toBe(true);
    });

    it('should return false when board has empty cells', () => {
      const board: Board = ['X', 'O', 'X', 3, 4, 5, 6, 7, 8];
      expect(checkDraw(board)).toBe(false);
    });
  });
});

