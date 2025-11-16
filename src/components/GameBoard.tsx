'use client';

import type { Board } from '@/lib/game/types';
import Cell from './Cell';

interface GameBoardProps {
  board: Board;
  gridSize: number;
  winningCells: number[] | null;
  onCellClick: (index: number) => void;
  isClickable: boolean;
}

export default function GameBoard({
  board,
  gridSize,
  winningCells,
  onCellClick,
  isClickable,
}: GameBoardProps) {
  return (
    <div className="game-board" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
      {board.map((cell, index) => (
        <Cell
          key={index}
          index={index}
          value={cell}
          onClick={onCellClick}
          isWinning={winningCells?.includes(index) ?? false}
          isClickable={isClickable}
        />
      ))}
    </div>
  );
}

