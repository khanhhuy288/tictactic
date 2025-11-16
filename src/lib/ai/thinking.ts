import type { Board, Player } from '../game/types';

export interface MoveEvaluation {
  position: number;
  score: number;
  depth: number;
  outcome: 'win' | 'loss' | 'tie' | 'unknown';
  pruned: boolean;
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
 * @returns Formatted text string with emojis and formatting.
 */
export function formatThinkingData(
  thinkingData: ThinkingData,
  gridSize: number = 3
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
  if (thinkingData.searchTime) {
    lines.push(`⏱️ **Time:** ${thinkingData.searchTime.toFixed(2)}ms`);
  }
  lines.push('');
  
  // Statistics
  lines.push('📈 **Search Statistics**');
  const pruningEfficiency = ((thinkingData.branchesPruned / (thinkingData.nodesEvaluated + thinkingData.branchesPruned)) * 100);
  lines.push(`  • Nodes Evaluated: ${thinkingData.nodesEvaluated.toLocaleString()}`);
  lines.push(`  • Branches Pruned: ${thinkingData.branchesPruned.toLocaleString()} ${pruningEfficiency > 50 ? '🚀' : ''}`);
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

