import type { Board, Player } from '../game/types';
import { checkWin } from '../game/winDetection';
import { hasEmptyCells } from '../game/board';
import type { MoveEvaluation, ThinkingData } from './thinking';

const WIN_SCORE = 100;
const LOSS_SCORE = -100;
const DRAW_SCORE = 0;

function deriveOutcomeDepth(score: number, outcome: MoveEvaluation['outcome']): number | undefined {
  if (outcome === 'win') {
    return Math.max(0, WIN_SCORE - score);
  }
  if (outcome === 'loss') {
    return Math.max(0, score - LOSS_SCORE);
  }
  return undefined;
}

interface MinimaxContext {
  nodesEvaluated: number;
  branchesPruned: number;
  maxDepth: number;
  terminalStates: {
    wins: number;
    losses: number;
    draws: number;
  };
  activeRootEvaluation: MoveEvaluation | null;
  // Per-root-move tracking
  rootMoveMaxDepth: number; // Max depth reached for current root move
  rootMoveStartNodes: number; // Starting node count when root move evaluation begins
  rootMovePruneStart: number; // Starting prune count when root move evaluation begins
}

function markRootMovePruned(context: MinimaxContext, depth: number) {
  if (!context.activeRootEvaluation) {
    return;
  }
  context.activeRootEvaluation.pruned = true;
  context.activeRootEvaluation.fullyEvaluated = false;
  if (context.activeRootEvaluation.pruningDepth === undefined) {
    context.activeRootEvaluation.pruningDepth = depth;
  } else {
    context.activeRootEvaluation.pruningDepth = Math.min(
      context.activeRootEvaluation.pruningDepth,
      depth
    );
  }
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
 * @param gridSize The size of the grid.
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
  gridSize: number,
  useAlphaBetaPruning: boolean = true
): number {
  context.nodesEvaluated++;
  context.maxDepth = Math.max(context.maxDepth, depth);
  if (context.activeRootEvaluation) {
    context.rootMoveMaxDepth = Math.max(context.rootMoveMaxDepth, depth);
  }

  // Check for terminal states - actual wins
  const aiWin = checkWin(board, aiPlayer, gridSize);
  if (aiWin) {
    context.terminalStates.wins++;
    return WIN_SCORE - depth; // Prefer shorter paths to victory
  }

  const humanWin = checkWin(board, humanPlayer, gridSize);
  if (humanWin) {
    context.terminalStates.losses++;
    return LOSS_SCORE + depth; // Prefer longer paths to loss
  }

  // Check for draw
  if (!hasEmptyCells(board)) {
    context.terminalStates.draws++;
    return DRAW_SCORE;
  }

  // AI player is the maximizer
  if (player === aiPlayer) {
    let best = -Infinity;
    let val: number;

    for (let i = 0; i < board.length; i++) {
      if (typeof board[i] === 'number') {
        const originalValue = board[i];
        board[i] = player;

        val = minimax(
          board,
          humanPlayer,
          aiPlayer,
          humanPlayer,
          depth + 1,
          alpha,
          beta,
          context,
          gridSize,
          useAlphaBetaPruning
        );
        best = Math.max(best, val);

        board[i] = originalValue;

        if (useAlphaBetaPruning) {
          alpha = Math.max(alpha, best);
          if (beta <= alpha) {
            context.branchesPruned++;
            markRootMovePruned(context, depth);
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
        const originalValue = board[i];
        board[i] = player;

        val = minimax(
          board,
          aiPlayer,
          aiPlayer,
          humanPlayer,
          depth + 1,
          alpha,
          beta,
          context,
          gridSize,
          useAlphaBetaPruning
        );
        best = Math.min(best, val);

        board[i] = originalValue;

        if (useAlphaBetaPruning) {
          beta = Math.min(beta, best);
          if (beta <= alpha) {
            context.branchesPruned++;
            markRootMovePruned(context, depth);
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
 * @param gridSize The size of the grid.
 * @param useAlphaBetaPruning Whether to use alpha-beta pruning.
 * @returns Object containing the best move index and thinking data.
 */
export function findBestMoveWithThinking(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  gridSize: number,
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
      draws: 0,
    },
    activeRootEvaluation: null,
    rootMoveMaxDepth: 0,
    rootMoveStartNodes: 0,
    rootMovePruneStart: 0,
  };

  let bestVal = -Infinity;
  const bestMoves: number[] = [];
  const evaluations: MoveEvaluation[] = [];

  // Evaluate all possible moves
  for (let i = 0; i < board.length; i++) {
    if (typeof board[i] === 'number') {
      // Make the move
      const originalValue = board[i];
      board[i] = aiPlayer;

      // Reset move evaluation tracking and per-move statistics
      context.activeRootEvaluation = null;
      context.rootMoveStartNodes = context.nodesEvaluated;
      context.rootMoveMaxDepth = 0;
      context.rootMovePruneStart = context.branchesPruned;
      
      const moveEval: MoveEvaluation = {
        position: i,
        score: 0,
        depth: 0,
        outcome: 'unknown',
        pruned: false,
        fullyEvaluated: true,
      };
      context.activeRootEvaluation = moveEval;

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
        gridSize,
        useAlphaBetaPruning
      );

      // Calculate per-move statistics
      moveEval.nodesVisited = context.nodesEvaluated - context.rootMoveStartNodes;
      moveEval.maxDepthReached = context.rootMoveMaxDepth;
      moveEval.branchesPruned = context.branchesPruned - context.rootMovePruneStart;

      // Store evaluation
      moveEval.score = moveVal;
      if (moveVal > 50) {
        moveEval.outcome = 'win';
      } else if (moveVal < -50) {
        moveEval.outcome = 'loss';
      } else if (moveVal === 0) {
        moveEval.outcome = 'draw';
      } else {
        moveEval.outcome = 'unknown';
      }
      const outcomeDepth = deriveOutcomeDepth(moveEval.score, moveEval.outcome);
      moveEval.depth = outcomeDepth ?? context.rootMoveMaxDepth;
      evaluations.push(moveEval);
      context.activeRootEvaluation = null;

      // Undo the move
      board[i] = originalValue;

      // Update best move
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMoves.length = 0;
        bestMoves.push(i);
      } else if (Math.abs(moveVal - bestVal) < 1e-6) {
        bestMoves.push(i);
      }
    }
  }

  const endTime = performance.now();
  const searchTime = endTime - startTime;

  // Extract principal variation (simplified: just the chosen move for now)
  // TODO: Enhance to track full PV during search
  const randomIndex = bestMoves.length > 0 ? Math.floor(Math.random() * bestMoves.length) : -1;
  const chosenMove = randomIndex >= 0 ? bestMoves[randomIndex] : -1;

  const principalVariation: number[] = chosenMove >= 0 ? [chosenMove] : [];

  const thinking: ThinkingData = {
    chosenMove,
    chosenScore: bestVal,
    evaluations,
    nodesEvaluated: context.nodesEvaluated,
    branchesPruned: context.branchesPruned,
    maxDepth: context.maxDepth,
    terminalStatesFound: context.terminalStates,
    searchTime,
    principalVariation,
  };

  return { move: chosenMove, thinking };
}

/**
 * Depth-limited minimax with heuristic evaluation for larger grids.
 * @param board The current board state.
 * @param player The current player (maximizer or minimizer).
 * @param aiPlayer The AI player symbol.
 * @param humanPlayer The human player symbol.
 * @param depth Current depth in the search tree.
 * @param maxDepth Maximum depth to search.
 * @param alpha Best score for the maximizer (AI).
 * @param beta Best score for the minimizer (Human).
 * @param context Context object for tracking thinking data.
 * @param gridSize The size of the grid.
 * @param evaluateFn Heuristic evaluation function.
 * @param useAlphaBetaPruning Whether to use alpha-beta pruning.
 * @returns Evaluation score of the board position.
 */
function minimaxWithDepthLimit(
  board: Board,
  player: Player,
  aiPlayer: Player,
  humanPlayer: Player,
  depth: number,
  maxDepth: number,
  alpha: number,
  beta: number,
  context: MinimaxContext,
  gridSize: number,
  evaluateFn: (board: Board, aiPlayer: Player, humanPlayer: Player, gridSize: number) => number,
  useAlphaBetaPruning: boolean = true
): number {
  context.nodesEvaluated++;
  context.maxDepth = Math.max(context.maxDepth, depth);
  if (context.activeRootEvaluation) {
    context.rootMoveMaxDepth = Math.max(context.rootMoveMaxDepth, depth);
  }

  // Check for terminal states - actual wins
  const aiWin = checkWin(board, aiPlayer, gridSize);
  if (aiWin) {
    context.terminalStates.wins++;
    return WIN_SCORE - depth;
  }

  const humanWin = checkWin(board, humanPlayer, gridSize);
  if (humanWin) {
    context.terminalStates.losses++;
    return LOSS_SCORE + depth;
  }

  // Check for draw
  if (!hasEmptyCells(board)) {
    context.terminalStates.draws++;
    return DRAW_SCORE;
  }

  // If we've reached max depth, use heuristic evaluation
  if (depth >= maxDepth) {
    return evaluateFn(board, aiPlayer, humanPlayer, gridSize);
  }

  // AI player is the maximizer
  if (player === aiPlayer) {
    let best = -Infinity;
    let val: number;

    for (let i = 0; i < board.length; i++) {
      if (typeof board[i] === 'number') {
        const originalValue = board[i];
        board[i] = player;

        val = minimaxWithDepthLimit(
          board,
          humanPlayer,
          aiPlayer,
          humanPlayer,
          depth + 1,
          maxDepth,
          alpha,
          beta,
          context,
          gridSize,
          evaluateFn,
          useAlphaBetaPruning
        );
        best = Math.max(best, val);

        board[i] = originalValue;

        if (useAlphaBetaPruning) {
          alpha = Math.max(alpha, best);
          if (beta <= alpha) {
            context.branchesPruned++;
            markRootMovePruned(context, depth);
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
        const originalValue = board[i];
        board[i] = player;

        val = minimaxWithDepthLimit(
          board,
          aiPlayer,
          aiPlayer,
          humanPlayer,
          depth + 1,
          maxDepth,
          alpha,
          beta,
          context,
          gridSize,
          evaluateFn,
          useAlphaBetaPruning
        );
        best = Math.min(best, val);

        board[i] = originalValue;

        if (useAlphaBetaPruning) {
          beta = Math.min(beta, best);
          if (beta <= alpha) {
            context.branchesPruned++;
            markRootMovePruned(context, depth);
            break;
          }
        }
      }
    }

    return best;
  }
}

/**
 * Find the best move for 4x4 grids using depth-limited minimax with heuristic evaluation.
 * @param board The current board state.
 * @param aiPlayer The AI player symbol.
 * @param humanPlayer The human player symbol.
 * @param gridSize The size of the grid.
 * @param maxDepth Maximum search depth (default: 3).
 * @param useAlphaBetaPruning Whether to use alpha-beta pruning.
 * @param evaluateFn Heuristic evaluation function.
 * @returns Object containing the best move index and thinking data.
 */
export function findBestMoveWithDepthLimit(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  gridSize: number,
  maxDepth: number = 3,
  useAlphaBetaPruning: boolean = true,
  evaluateFn: (board: Board, aiPlayer: Player, humanPlayer: Player, gridSize: number) => number
): { move: number; thinking: ThinkingData } {
  const startTime = performance.now();
  
  const context: MinimaxContext = {
    nodesEvaluated: 0,
    branchesPruned: 0,
    maxDepth: 0,
    terminalStates: {
      wins: 0,
      losses: 0,
      draws: 0,
    },
    activeRootEvaluation: null,
    rootMoveMaxDepth: 0,
    rootMoveStartNodes: 0,
    rootMovePruneStart: 0,
  };

  let bestVal = -Infinity;
  let bestMove = -1;
  const evaluations: MoveEvaluation[] = [];

  // Evaluate all possible moves
  for (let i = 0; i < board.length; i++) {
    if (typeof board[i] === 'number') {
      const originalValue = board[i];
      board[i] = aiPlayer;

      context.activeRootEvaluation = null;
      context.rootMoveStartNodes = context.nodesEvaluated;
      context.rootMoveMaxDepth = 0;
      context.rootMovePruneStart = context.branchesPruned;
      
      const moveEval: MoveEvaluation = {
        position: i,
        score: 0,
        depth: 0,
        outcome: 'unknown',
        pruned: false,
        fullyEvaluated: true,
      };
      context.activeRootEvaluation = moveEval;

      const moveVal = minimaxWithDepthLimit(
        board,
        humanPlayer,
        aiPlayer,
        humanPlayer,
        0,
        maxDepth,
        -Infinity,
        Infinity,
        context,
        gridSize,
        evaluateFn,
        useAlphaBetaPruning
      );

      moveEval.nodesVisited = context.nodesEvaluated - context.rootMoveStartNodes;
      moveEval.maxDepthReached = context.rootMoveMaxDepth;
      moveEval.branchesPruned = context.branchesPruned - context.rootMovePruneStart;
      moveEval.score = moveVal;
      
      if (moveVal > 50) {
        moveEval.outcome = 'win';
      } else if (moveVal < -50) {
        moveEval.outcome = 'loss';
      } else if (moveVal === 0) {
        moveEval.outcome = 'draw';
      } else {
        moveEval.outcome = 'unknown';
      }
      const outcomeDepth = deriveOutcomeDepth(moveEval.score, moveEval.outcome);
      moveEval.depth = outcomeDepth ?? context.rootMoveMaxDepth;
      
      evaluations.push(moveEval);
      context.activeRootEvaluation = null;
      board[i] = originalValue;

      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }

  const endTime = performance.now();
  const searchTime = endTime - startTime;

  const principalVariation: number[] = bestMove >= 0 ? [bestMove] : [];

  const thinking: ThinkingData = {
    chosenMove: bestMove,
    chosenScore: bestVal,
    evaluations,
    nodesEvaluated: context.nodesEvaluated,
    branchesPruned: context.branchesPruned,
    maxDepth: context.maxDepth,
    terminalStatesFound: context.terminalStates,
    searchTime,
    principalVariation,
  };

  return { move: bestMove, thinking };
}

