'use client';

import type { MouseEvent } from 'react';
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
  isFocused: boolean;
  isSelected: boolean;
  isChosen: boolean;
  onOverlayHover?: (moveIndex: number | null) => void;
  onOverlaySelect?: (moveIndex: number) => void;
}

function getOutcomeClass(outcome: 'win' | 'loss' | 'tie' | 'unknown' | null | undefined): string {
  if (!outcome) return '';
  if (outcome === 'win') return 'overlay-win';
  if (outcome === 'loss') return 'overlay-loss';
  if (outcome === 'tie') return 'overlay-draw';
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
  isFocused,
  isSelected,
  isChosen,
  onOverlayHover,
  onOverlaySelect,
}: CellProps) {
  const isEmpty = isEmptyCell(value);
  const player = isEmpty ? null : (value as Player);
  
  const handleClick = () => {
    if (isClickable && isEmpty) {
      onClick(index);
    }
  };

  const outcomeClass = getOutcomeClass(evaluation?.outcome ?? null);
  const overlayClasses = [
    'cell-overlay',
    outcomeClass,
    isFocused ? 'overlay-focused' : '',
    isSelected ? 'overlay-selected' : '',
    isChosen ? 'overlay-chosen' : '',
    evaluation?.pruned ? 'overlay-pruned' : '',
    evaluation?.fullyEvaluated === false ? 'overlay-partial' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleOverlayEnter = () => {
    if (isOverlayVisible && evaluation && onOverlayHover) {
      onOverlayHover(index);
    }
  };

  const handleOverlayLeave = () => {
    if (isOverlayVisible && onOverlayHover) {
      onOverlayHover(null);
    }
  };

  const handleOverlayClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!isOverlayVisible || !evaluation) return;
    event.stopPropagation();
    onOverlaySelect?.(index);
  };

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
        <button
          type="button"
          className={overlayClasses}
          onMouseEnter={handleOverlayEnter}
          onMouseLeave={handleOverlayLeave}
          onFocus={handleOverlayEnter}
          onBlur={handleOverlayLeave}
          onClick={handleOverlayClick}
          aria-label={`AI evaluation for cell ${index + 1}`}
        >
          <span className="overlay-score">{formatScore(evaluation.score)}</span>
          <span className="overlay-nodes">
            {evaluation.nodesVisited?.toLocaleString() ?? '—'} nodes
          </span>
          <span className="overlay-depth">depth {evaluation.maxDepthReached ?? evaluation.depth}</span>
          {evaluation.pruned && (
            <span className="overlay-flag" aria-label="Pruned early">
              ✂️
            </span>
          )}
        </button>
      )}
    </div>
  );
}

