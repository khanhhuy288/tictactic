'use client';

import type { Player } from '@/lib/game/types';

interface SymbolSelectorProps {
  onSelect: (player: Player) => void;
}

export default function SymbolSelector({ onSelect }: SymbolSelectorProps) {
  return (
    <div className="popup select-sym">
      <p>Select</p>
      <div className="symbol-buttons">
        <button className="icon-x" onClick={() => onSelect('X')}>
          X
        </button>
        <button className="icon-o" onClick={() => onSelect('O')}>
          O
        </button>
      </div>
    </div>
  );
}

