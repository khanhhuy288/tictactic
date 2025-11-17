import type { Board, Player } from '../game/types';
import { checkWin } from '../game/winDetection';
import { hasEmptyCells } from '../game/board';
import type { MoveEvaluation, ThinkingData } from './thinking';

const GRID_SIZE = 3;
const WIN_SCORE = 100;
const LOSS_SCORE = -100;
const TIE_SCORE = 0;

interface MinimaxContext {
  nodesEvaluated: number;
  branchesPruned: number;
  maxDepth: number;
  terminalStates: {
    wins: number;
    losses: number;
    ties: number;
  };
  moveEvaluations: Map<number, MoveEvaluation>;
  currentMoveEvaluation: MoveEvaluation | null;
  // Per-root-move tracking
  rootMoveNodes: number; // Nodes visited for current root move
  rootMoveMaxDepth: number; // Max depth reached for current root move
  rootMoveStartNodes: number; // Starting node count when root move evaluation begins
}

/**
 * Minimax algorithm with optional alpha-beta pruning.
 * @param board The current board state.
 * @param player The current player (maximizer or minimizer).
 * @param aiPlayer The AI player symbol.
 * @param humanPlayer The human player symbol.
 * @param depth Current depth in the search tree.
 * @param alpha Best score for the maximizer (AI).
 * @param beta Best score for the minimizer (Human).
 * @param context Context object for tracking thinking data.
 * @param useAlphaBetaPruning Whether to use alpha-beta pruning.
 * @returns Evaluation score of the board position.
 */
export function minimax(
  board: Board,
  player: Player,
  aiPlayer: Player,
  humanPlayer: Player,
  depth: number,
  alpha: number,
  beta: number,
  context: MinimaxContext,
  useAlphaBetaPruning: boolean = true
): number {
  context.nodesEvaluated++;
  context.maxDepth = Math.max(context.maxDepth, depth);
  // Track max depth for current root move
  if (context.currentMoveEvaluation) {
    context.rootMoveMaxDepth = Math.max(context.rootMoveMaxDepth, depth);
  }

  // Check for terminal states - actual wins
  const aiWin = checkWin(board, aiPlayer, GRID_SIZE);
  if (aiWin) {
    context.terminalStates.wins++;
    const score = WIN_SCORE - depth; // Prefer shorter paths to victory
    if (context.currentMoveEvaluation) {
      context.currentMoveEvaluation.outcome = 'win';
      context.currentMoveEvaluation.score = score;
    }
    return score;
  }

  const humanWin = checkWin(board, humanPlayer, GRID_SIZE);
  if (humanWin) {
    context.terminalStates.losses++;
    const score = LOSS_SCORE + depth; // Prefer longer paths to loss
    if (context.currentMoveEvaluation) {
      context.currentMoveEvaluation.outcome = 'loss';
      context.currentMoveEvaluation.score = score;
    }
    return score;
  }

  // Check for tie
  if (!hasEmptyCells(board)) {
    context.terminalStates.ties++;
    const score = TIE_SCORE;
    if (context.currentMoveEvaluation) {
      context.currentMoveEvaluation.outcome = 'tie';
      context.currentMoveEvaluation.score = score;
    }
    return score;
  }

  // AI player is the maximizer
  if (player === aiPlayer) {
    let best = -Infinity;
    let val: number;

    for (let i = 0; i < board.length; i++) {
      if (typeof board[i] === 'number') {
        // Make the move
        const originalValue = board[i];
        board[i] = player;

        // Create evaluation context for this move
        const moveEval: MoveEvaluation = {
          position: i,
          score: 0,
          depth,
          outcome: 'unknown',
          pruned: false,
        };
        context.currentMoveEvaluation = moveEval;

        // Call minimax recursively
        val = minimax(board, humanPlayer, aiPlayer, humanPlayer, depth + 1, alpha, beta, context, useAlphaBetaPruning);
        best = Math.max(best, val);
        moveEval.score = val;

        // Undo the move
        board[i] = originalValue;

        // Alpha-beta pruning
        if (useAlphaBetaPruning) {
          alpha = Math.max(alpha, best);
          if (beta <= alpha) {
            context.branchesPruned++;
            moveEval.pruned = true;
            // Record pruning depth (depth at which pruning occurred)
            if (context.currentMoveEvaluation) {
              context.currentMoveEvaluation.pruningDepth = depth;
            }
            // Mark remaining moves as pruned
            for (let j = i + 1; j < board.length; j++) {
              if (typeof board[j] === 'number') {
                const prunedEval: MoveEvaluation = {
                  position: j,
                  score: 0,
                  depth,
                  outcome: 'unknown',
                  pruned: true,
                  pruningDepth: depth, // Pruned at root level
                };
                context.moveEvaluations.set(j, prunedEval);
              }
            }
            break;
          }
        }
      }
    }

    return best;
  } else {
    // Human player is the minimizer
    let best = +Infinity;
    let val: number;

    for (let i = 0; i < board.length; i++) {
      if (typeof board[i] === 'number') {
        // Make the move
        const originalValue = board[i];
        board[i] = player;

        // Create evaluation context for this move
        const moveEval: MoveEvaluation = {
          position: i,
          score: 0,
          depth,
          outcome: 'unknown',
          pruned: false,
        };
        context.currentMoveEvaluation = moveEval;

        // Call minimax recursively
        val = minimax(board, aiPlayer, aiPlayer, humanPlayer, depth + 1, alpha, beta, context, useAlphaBetaPruning);
        best = Math.min(best, val);
        moveEval.score = val;

        // Undo the move
        board[i] = originalValue;

        // Alpha-beta pruning
        if (useAlphaBetaPruning) {
          beta = Math.min(beta, best);
          if (beta <= alpha) {
            context.branchesPruned++;
            moveEval.pruned = true;
            // Record pruning depth (depth at which pruning occurred)
            if (context.currentMoveEvaluation) {
              context.currentMoveEvaluation.pruningDepth = depth;
            }
            // Mark remaining moves as pruned
            for (let j = i + 1; j < board.length; j++) {
              if (typeof board[j] === 'number') {
                const prunedEval: MoveEvaluation = {
                  position: j,
                  score: 0,
                  depth,
                  outcome: 'unknown',
                  pruned: true,
                  pruningDepth: depth, // Pruned at root level
                };
                context.moveEvaluations.set(j, prunedEval);
              }
            }
            break;
          }
        }
      }
    }

    return best;
  }
}

/**
 * Find the best move for the AI player using minimax with thinking data capture.
 * @param board The current board state.
 * @param aiPlayer The AI player symbol.
 * @param humanPlayer The human player symbol.
 * @param useAlphaBetaPruning Whether to use alpha-beta pruning.
 * @returns Object containing the best move index and thinking data.
 */
export function findBestMoveWithThinking(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  useAlphaBetaPruning: boolean = true
): { move: number; thinking: ThinkingData } {
  const startTime = performance.now();
  
  const context: MinimaxContext = {
    nodesEvaluated: 0,
    branchesPruned: 0,
    maxDepth: 0,
    terminalStates: {
      wins: 0,
      losses: 0,
      ties: 0,
    },
    moveEvaluations: new Map(),
    currentMoveEvaluation: null,
    rootMoveNodes: 0,
    rootMoveMaxDepth: 0,
    rootMoveStartNodes: 0,
  };

  let bestVal = -Infinity;
  let bestMove = -1;
  const evaluations: MoveEvaluation[] = [];

  // Evaluate all possible moves
  for (let i = 0; i < board.length; i++) {
    if (typeof board[i] === 'number') {
      // Make the move
      const originalValue = board[i];
      board[i] = aiPlayer;

      // Reset move evaluation tracking and per-move statistics
      context.currentMoveEvaluation = null;
      context.rootMoveStartNodes = context.nodesEvaluated;
      context.rootMoveMaxDepth = 0;
      
      const moveEval: MoveEvaluation = {
        position: i,
        score: 0,
        depth: 0,
        outcome: 'unknown',
        pruned: false,
      };
      context.currentMoveEvaluation = moveEval;

      // Call minimax
      const moveVal = minimax(
        board,
        humanPlayer,
        aiPlayer,
        humanPlayer,
        0,
        -Infinity,
        Infinity,
        context,
        useAlphaBetaPruning
      );

      // Calculate per-move statistics
      moveEval.nodesVisited = context.nodesEvaluated - context.rootMoveStartNodes;
      moveEval.maxDepthReached = context.rootMoveMaxDepth;

      // Store evaluation
      moveEval.score = moveVal;
      moveEval.depth = context.rootMoveMaxDepth;
      // Determine outcome from score
      if (moveVal > 50) {
        moveEval.outcome = 'win';
      } else if (moveVal < -50) {
        moveEval.outcome = 'loss';
      } else if (moveVal === 0) {
        moveEval.outcome = 'tie';
      } else {
        moveEval.outcome = 'unknown';
      }
      evaluations.push(moveEval);
      context.moveEvaluations.set(i, moveEval);

      // Undo the move
      board[i] = originalValue;

      // Update best move
      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }

  const endTime = performance.now();
  const searchTime = endTime - startTime;

  // Extract principal variation (simplified: just the chosen move for now)
  // TODO: Enhance to track full PV during search
  const principalVariation: number[] = bestMove >= 0 ? [bestMove] : [];

  const thinking: ThinkingData = {
    chosenMove: bestMove,
    chosenScore: bestVal,
    evaluations: Array.from(context.moveEvaluations.values()),
    nodesEvaluated: context.nodesEvaluated,
    branchesPruned: context.branchesPruned,
    maxDepth: context.maxDepth,
    terminalStatesFound: context.terminalStates,
    searchTime,
    principalVariation,
  };

  return { move: bestMove, thinking };
}

