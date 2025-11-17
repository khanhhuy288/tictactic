import type { Board, Player } from '../game/types';
import { findBestMoveWithThinking, findBestMoveWithDepthLimit } from './minimax';
import { evaluate } from './evaluator';
import type { ThinkingData } from './thinking';

const GRID_SIZE = 3;
const MAX_DEPTH_4X4 = 3; // Depth limit for 4x4 to keep performance reasonable

/**
 * AI Player interface for making moves.
 */
export class AIPlayer {
  private gridSize: number;
  private useAlphaBetaPruning: boolean;

  constructor(gridSize: number = GRID_SIZE, useAlphaBetaPruning: boolean = true) {
    this.gridSize = gridSize;
    this.useAlphaBetaPruning = useAlphaBetaPruning;
  }

  /**
   * Find the best move for the AI player.
   * @param board The current board state.
   * @param aiPlayer The AI player symbol.
   * @param humanPlayer The human player symbol.
   * @returns Object containing the move index and thinking data.
   */
  findBestMove(
    board: Board,
    aiPlayer: Player,
    humanPlayer: Player
  ): { move: number; thinking: ThinkingData } {
    // For 3×3, use perfect minimax
    if (this.gridSize === 3) {
      return findBestMoveWithThinking(board, aiPlayer, humanPlayer, this.gridSize, this.useAlphaBetaPruning);
    }

    // For 4×4, use depth-limited minimax with heuristic evaluation
    if (this.gridSize === 4) {
      return findBestMoveWithDepthLimit(
        board,
        aiPlayer,
        humanPlayer,
        this.gridSize,
        MAX_DEPTH_4X4,
        this.useAlphaBetaPruning,
        evaluate
      );
    }

    // For other grid sizes, not yet supported
    throw new Error(`Grid size ${this.gridSize} not yet supported`);
  }

  /**
   * Get a random corner move (used for AI's first move when playing X).
   * @param board The current board state.
   * @returns A random corner cell index.
   */
  getRandomCornerMove(board: Board): number {
    const corners = [0, this.gridSize - 1, this.gridSize * (this.gridSize - 1), this.gridSize * this.gridSize - 1];
    const availableCorners = corners.filter(
      (corner) => typeof board[corner] === 'number'
    );
    
    if (availableCorners.length === 0) {
      // Fallback to any available cell
      const available = board
        .map((cell, index) => (typeof cell === 'number' ? index : null))
        .filter((index): index is number => index !== null);
      return available[Math.floor(Math.random() * available.length)];
    }
    
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }
}

