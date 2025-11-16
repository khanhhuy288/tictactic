import { findBestMoveWithThinking } from '@/lib/ai/minimax';
import type { Board } from '@/lib/game/types';

describe('minimax', () => {
  describe('findBestMoveWithThinking', () => {
    it('should find winning move when available', () => {
      // X can win in one move
      const board: Board = ['X', 'X', 2, 'O', 'O', 5, 6, 7, 8];
      const result = findBestMoveWithThinking(board, 'X', 'O');
      expect(result.move).toBe(2);
      expect(result.thinking.chosenScore).toBeGreaterThan(50);
    });

    it('should block opponent winning move', () => {
      // O can win, X must block
      const board: Board = ['O', 'O', 2, 'X', 4, 5, 6, 7, 8];
      const result = findBestMoveWithThinking(board, 'X', 'O');
      expect(result.move).toBe(2);
    });

    it('should return thinking data', () => {
      const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const result = findBestMoveWithThinking(board, 'X', 'O');
      
      expect(result.thinking).toBeDefined();
      expect(result.thinking.nodesEvaluated).toBeGreaterThan(0);
      expect(result.thinking.chosenMove).toBeGreaterThanOrEqual(0);
      expect(result.thinking.chosenMove).toBeLessThan(9);
    });

    it('should prefer corner moves in opening', () => {
      const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const result = findBestMoveWithThinking(board, 'X', 'O');
      const corners = [0, 2, 6, 8];
      expect(corners).toContain(result.move);
    });
  });
});

