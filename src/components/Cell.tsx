'use client';

import type { Player, CellValue } from '@/lib/game/types';
import { isEmptyCell } from '@/lib/game/board';
import type { ReplayStepKind } from '@/lib/ai/thinking';

interface CellProps {
  index: number;
  value: CellValue;
  onClick: (index: number) => void;
  isWinning: boolean;
  isClickable: boolean;
  replayState?: ReplayStepKind | null;
  replayStepNumber?: number;
  replayOutcome?: 'win' | 'loss' | 'tie' | 'unknown' | null;
  replayNodesVisited?: number;
  maxNodesVisited?: number;
  ghostSymbol?: Player | null;
  visited?: boolean;
  visitedKind?: ReplayStepKind | null;
  visitedStepNumber?: number;
  visitedOutcome?: 'win' | 'loss' | 'tie' | 'unknown' | null;
  visitedNodesVisited?: number;
  isCurrent?: boolean;
}

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

function getReplayEmoji(kind: ReplayStepKind | null | undefined, stepNumber?: number): string | null {
  if (!kind) return null;
  
  if (kind === 'chosen') return '✅';
  if (kind === 'pruned') return '✂️';
  if (kind === 'consider' && stepNumber !== undefined) {
    return NUMBER_EMOJIS[stepNumber - 1] || null;
  }
  return null;
}

function getOutcomeClass(outcome: 'win' | 'loss' | 'tie' | 'unknown' | null | undefined): string {
  if (!outcome) return '';
  if (outcome === 'win') return 'replay-win';
  if (outcome === 'loss') return 'replay-loss';
  if (outcome === 'tie') return 'replay-draw';
  return '';
}

function calculateIntensity(nodesVisited?: number, maxNodes?: number): number {
  if (!nodesVisited || !maxNodes || maxNodes === 0) return 0.5;
  const normalized = Math.min(1, nodesVisited / maxNodes);
  return 0.3 + (normalized * 0.7);
}

export default function Cell({ 
  index, 
  value, 
  onClick, 
  isWinning, 
  isClickable,
  replayState,
  replayStepNumber,
  replayOutcome,
  replayNodesVisited,
  maxNodesVisited,
  ghostSymbol,
  visited,
  visitedKind,
  visitedStepNumber,
  visitedOutcome,
  visitedNodesVisited,
  isCurrent,
}: CellProps) {
  const isEmpty = isEmptyCell(value);
  const player = isEmpty ? null : (value as Player);
  
  const handleClick = () => {
    if (isClickable && isEmpty) {
      onClick(index);
    }
  };

  // Determine which state to show (current step takes priority)
  const showCurrent = isCurrent && replayState;
  const kind = showCurrent ? replayState : (visitedKind || null);
  const stepNumber = showCurrent ? replayStepNumber : visitedStepNumber;
  const outcome = showCurrent ? replayOutcome : (visitedOutcome || null);
  const nodesVisited = showCurrent ? replayNodesVisited : visitedNodesVisited;

  const replayEmoji = getReplayEmoji(kind, stepNumber);
  const replayClass = showCurrent && replayState ? `replay-${replayState}` : '';
  const outcomeClass = getOutcomeClass(outcome);
  const intensity = calculateIntensity(nodesVisited, maxNodesVisited);
  const intensityStyle = outcome && nodesVisited ? {
    opacity: intensity,
  } : {};
  const hasGhost = ghostSymbol && isEmpty;
  
  // Add visited class for all visited cells
  const visitedClass = visited ? 'cell-visited' : '';
  const visitedKindClass = visited && visitedKind ? `visited-${visitedKind}` : '';

  return (
    <div
      className={`cell ${isEmpty ? 'empty' : ''} ${isWinning ? 'winning' : ''} ${isClickable && isEmpty ? 'clickable' : ''} ${replayClass} ${outcomeClass} ${visitedClass} ${visitedKindClass} ${hasGhost ? 'has-ghost' : ''} ${isCurrent ? 'replay-current' : ''}`}
      style={intensityStyle}
      onClick={handleClick}
      role="button"
      tabIndex={isClickable && isEmpty ? 0 : -1}
      aria-label={isEmpty ? `Empty cell ${index}` : `Cell ${index} with ${player}`}
    >
      {!isEmpty && (
        <span className={`symbol ${player === 'X' ? 'x' : 'o'}`}>
          {player}
        </span>
      )}
      {hasGhost && (
        <span className={`symbol ghost ${ghostSymbol === 'X' ? 'x' : 'o'}`}>
          {ghostSymbol}
        </span>
      )}
      {replayEmoji && isCurrent && (
        <span className="replay-indicator" aria-label={`Replay: ${kind}`}>
          {replayEmoji}
        </span>
      )}
      {visited && !isCurrent && (
        <span className="visited-indicator" aria-label={`Visited: ${visitedKind}`}>
          {visitedKind === 'pruned' ? '✂️' : visitedKind === 'chosen' ? '✅' : visitedStepNumber ? NUMBER_EMOJIS[visitedStepNumber - 1] || '•' : '•'}
        </span>
      )}
    </div>
  );
}

