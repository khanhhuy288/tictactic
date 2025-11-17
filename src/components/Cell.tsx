'use client';

import type { Player, CellValue } from '@/lib/game/types';
import { isEmptyCell } from '@/lib/game/board';
import type { MoveEvaluation } from '@/lib/ai/thinking';

interface CellProps {
  index: number;
  value: CellValue;
  onClick: (index: number) => void;
  isWinning: boolean;
  isClickable: boolean;
  evaluation?: MoveEvaluation;
  isOverlayVisible: boolean;
  isChosen: boolean;
}

function getOutcomeClass(outcome: 'win' | 'loss' | 'draw' | 'unknown' | null | undefined): string {
  if (!outcome) return '';
  if (outcome === 'win') return 'overlay-win';
  if (outcome === 'loss') return 'overlay-loss';
  if (outcome === 'draw') return 'overlay-draw';
  return '';
}

function formatScore(score: number): string {
  if (score > 0) return `+${score}`;
  return `${score}`;
}

export default function Cell({ 
  index, 
  value, 
  onClick, 
  isWinning, 
  isClickable,
  evaluation,
  isOverlayVisible,
  isChosen,
}: CellProps) {
  const isEmpty = isEmptyCell(value);
  const player = isEmpty ? null : (value as Player);
  const nodesLabel = evaluation?.nodesVisited?.toLocaleString() ?? '—';
  const showPartial = evaluation?.fullyEvaluated === false;
  
  const handleClick = () => {
    if (isClickable && isEmpty) {
      onClick(index);
    }
  };

  const outcomeClass = getOutcomeClass(evaluation?.outcome ?? null);
  const overlayClasses = [
    'cell-overlay',
    outcomeClass,
    isChosen ? 'overlay-chosen' : '',
    showPartial ? 'overlay-partial' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`cell ${isEmpty ? 'empty' : ''} ${isWinning ? 'winning' : ''} ${isClickable && isEmpty ? 'clickable' : ''}`}
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
      {isOverlayVisible && evaluation && (
        <div
          className={overlayClasses}
          aria-hidden="true"
        >
          <div className="overlay-top">
            <span className="overlay-score">{formatScore(evaluation.score)}</span>
          </div>
          <div className="overlay-metrics">
            <span className="overlay-chip">
              <span className="chip-label">Nodes</span>
              <span className="chip-value">{nodesLabel}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
