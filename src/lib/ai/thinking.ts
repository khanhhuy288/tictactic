import type { Board, Player } from '../game/types';

export interface MoveEvaluation {
  position: number;
  score: number;
  depth: number;
  outcome: 'win' | 'loss' | 'tie' | 'unknown';
  pruned: boolean;
  nodesVisited?: number;
  maxDepthReached?: number;
  pruningDepth?: number; // Depth at which pruning occurred (if pruned early)
}

export interface ThinkingData {
  chosenMove: number;
  chosenScore: number;
  evaluations: MoveEvaluation[];
  nodesEvaluated: number;
  branchesPruned: number;
  maxDepth: number;
  terminalStatesFound: {
    wins: number;
    losses: number;
    ties: number;
  };
  searchTime?: number;
  principalVariation?: number[]; // Sequence of move indices representing the best line
}

export type ReplayStepKind = 'consider' | 'pruned' | 'chosen';

export interface ReplayStep {
  moveIndex: number;
  kind: ReplayStepKind;
  stepNumber?: number;
  score?: number;
  nodesVisited?: number;
  maxDepth?: number;
  outcome?: 'win' | 'loss' | 'tie' | 'unknown';
  pruningDepth?: number;
}

/**
 * Get emoji for outcome type.
 */
function getOutcomeEmoji(outcome: string): string {
  if (outcome.includes('Win')) return '👑';
  if (outcome.includes('Advantage')) return '👍';
  if (outcome.includes('Draw')) return '⚖️';
  if (outcome.includes('Disadvantage')) return '👎';
  if (outcome.includes('Loss')) return '💀';
  return '🤔';
}

/**
 * Get emoji for move outcome.
 */
function getMoveOutcomeEmoji(outcome: string): string {
  if (outcome === 'win') return '👑';
  if (outcome === 'loss') return '💀';
  if (outcome === 'tie') return '⚖️';
  return '➖';
}

/**
 * Format thinking data into readable text for display.
 * @param thinkingData The thinking data to format.
 * @param gridSize The size of the grid (for position formatting).
 * @param totalNodesEvaluated Optional cumulative total of nodes evaluated across all moves.
 * @param totalBranchesPruned Optional cumulative total of branches pruned across all moves.
 * @param totalSearchTime Optional cumulative total of search time across all moves.
 * @returns Formatted text string with emojis and formatting.
 */
export function formatThinkingData(
  thinkingData: ThinkingData,
  gridSize: number = 3,
  totalNodesEvaluated?: number,
  totalBranchesPruned?: number,
  totalSearchTime?: number
): string {
  const lines: string[] = [];
    
  // Chosen move (convert to 1-based: Cell 1-9)
  const humanPosition = thinkingData.chosenMove + 1;
  const row = Math.floor(thinkingData.chosenMove / gridSize);
  const col = thinkingData.chosenMove % gridSize;
  const outcomeDesc = getOutcomeDescription(thinkingData.chosenScore);
  const outcomeEmoji = getOutcomeEmoji(outcomeDesc);
  
  lines.push(`📍 **My Move:** Cell ${humanPosition} (Row ${row + 1}, Col ${col + 1})`);
  lines.push(`${outcomeEmoji} **Outcome:** ${outcomeDesc}`);
  lines.push(`📊 **Score:** ${thinkingData.chosenScore > 0 ? '+' : ''}${thinkingData.chosenScore}`);
  if (thinkingData.searchTime !== undefined) {
    const timeText = `⏱️ **Time:** ${thinkingData.searchTime.toFixed(2)}ms`;
    const timeWithTotal = totalSearchTime !== undefined 
      ? `${timeText} (Total: ${totalSearchTime.toFixed(2)}ms)`
      : timeText;
    lines.push(timeWithTotal);
  }
  lines.push('');
  
  // Statistics
  lines.push('📈 **Search Statistics**');
  const pruningEfficiency = ((thinkingData.branchesPruned / (thinkingData.nodesEvaluated + thinkingData.branchesPruned)) * 100);
  const nodesEvaluatedText = `  • Nodes Evaluated: ${thinkingData.nodesEvaluated.toLocaleString()}`;
  const nodesEvaluatedWithTotal = totalNodesEvaluated !== undefined 
    ? `${nodesEvaluatedText} (Total: ${totalNodesEvaluated.toLocaleString()})`
    : nodesEvaluatedText;
  lines.push(nodesEvaluatedWithTotal);
  
  const branchesPrunedBase = `  • Branches Pruned: ${thinkingData.branchesPruned.toLocaleString()}`;
  const emoji = pruningEfficiency > 50 ? ' 🚀' : '';
  const branchesPrunedWithTotal = totalBranchesPruned !== undefined 
    ? `${branchesPrunedBase} (Total: ${totalBranchesPruned.toLocaleString()})${emoji}`
    : `${branchesPrunedBase}${emoji}`;
  lines.push(branchesPrunedWithTotal);
  lines.push(`  • Max Depth: ${thinkingData.maxDepth} levels`);
  lines.push(`  • Pruning Efficiency: ${pruningEfficiency.toFixed(1)}% ${pruningEfficiency > 70 ? '✨' : ''}`);
  lines.push('');
  
  // Terminal states
  lines.push('🎯 **Terminal States Found**');
  lines.push(`  • Wins: ${thinkingData.terminalStatesFound.wins} 👑`);
  lines.push(`  • Losses: ${thinkingData.terminalStatesFound.losses} 💀`);
  lines.push(`  • Ties: ${thinkingData.terminalStatesFound.ties} ⚖️`);
  lines.push('');
  
  // Move evaluations (top moves)
  const sortedEvaluations = [...thinkingData.evaluations]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  if (sortedEvaluations.length > 0) {
    lines.push('🔍 **Top Move Evaluations**');
    sortedEvaluations.forEach((moveEval) => {
      const humanPos = moveEval.position + 1; // Convert to 1-based
      const evalRow = Math.floor(moveEval.position / gridSize);
      const evalCol = moveEval.position % gridSize;
      const moveEmoji = getMoveOutcomeEmoji(moveEval.outcome);
      const pruned = moveEval.pruned ? ' ✂️ (pruned)' : '';
      lines.push(`  • Cell ${humanPos} (${evalRow + 1},${evalCol + 1}): ${moveEmoji} Score ${moveEval.score > 0 ? '+' : ''}${moveEval.score}${pruned}`);
    });
  }
  
  return lines.join('\n');
}

function getOutcomeDescription(score: number): string {
  if (score > 50) return 'Guaranteed Win';
  if (score > 0) return 'Advantageous Position';
  if (score === 0) return 'Draw';
  if (score > -50) return 'Disadvantageous Position';
  return 'Guaranteed Loss';
}

/**
 * Generate replay steps from thinking data.
 * Converts the evaluation sequence into animated replay steps.
 * @param thinkingData The thinking data from AI move calculation.
 * @returns Array of replay steps in evaluation order.
 */
export function generateReplaySteps(thinkingData: ThinkingData): ReplayStep[] {
  const steps: ReplayStep[] = [];
  let stepNumber = 1;

  // Process evaluations in order (preserves evaluation sequence)
  for (const evaluation of thinkingData.evaluations) {
    let kind: ReplayStepKind;
    
    if (evaluation.position === thinkingData.chosenMove) {
      kind = 'chosen';
    } else if (evaluation.pruned) {
      kind = 'pruned';
    } else {
      kind = 'consider';
    }

    steps.push({
      moveIndex: evaluation.position,
      kind,
      stepNumber: kind === 'consider' || kind === 'chosen' ? stepNumber++ : undefined,
      score: evaluation.score,
      nodesVisited: evaluation.nodesVisited,
      maxDepth: evaluation.maxDepthReached,
      outcome: evaluation.outcome,
      pruningDepth: evaluation.pruningDepth,
    });
  }

  return steps;
}

