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

    it('keeps per-move stats aligned with global totals', () => {
      const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const result = findBestMoveWithThinking(board, 'X', 'O');

      const totalNodesFromMoves = result.thinking.evaluations.reduce(
        (sum, evaluation) => sum + (evaluation.nodesVisited ?? 0),
        0
      );
      const totalPrunesFromMoves = result.thinking.evaluations.reduce(
        (sum, evaluation) => sum + (evaluation.branchesPruned ?? 0),
        0
      );

      expect(totalNodesFromMoves).toBe(result.thinking.nodesEvaluated);
      expect(totalPrunesFromMoves).toBe(result.thinking.branchesPruned);

      result.thinking.evaluations.forEach((evaluation) => {
        expect(evaluation.nodesVisited ?? 0).toBeGreaterThan(0);
        expect(evaluation.maxDepthReached ?? 0).toBeGreaterThanOrEqual(0);
      });
    });

    it('treats all moves as fully evaluated when pruning is disabled', () => {
      const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const result = findBestMoveWithThinking(board, 'X', 'O', 3, false);

      result.thinking.evaluations.forEach((evaluation) => {
        expect(evaluation.pruned).toBe(false);
        expect(evaluation.fullyEvaluated).toBe(true);
        expect(evaluation.pruningDepth).toBeUndefined();
      });
    });
  });
});

