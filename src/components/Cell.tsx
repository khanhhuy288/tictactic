'use client';

import type { Player, CellValue } from '@/lib/game/types';
import { isEmptyCell } from '@/lib/game/board';

interface CellProps {
  index: number;
  value: CellValue;
  onClick: (index: number) => void;
  isWinning: boolean;
  isClickable: boolean;
}

export default function Cell({ index, value, onClick, isWinning, isClickable }: CellProps) {
  const isEmpty = isEmptyCell(value);
  const player = isEmpty ? null : (value as Player);
  
  const handleClick = () => {
    if (isClickable && isEmpty) {
      onClick(index);
    }
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
    </div>
  );
}

