'use client';

import type { Board } from '@/lib/game/types';
import type { MoveEvaluation } from '@/lib/ai/thinking';
import Cell from './Cell';

interface GameBoardProps {
  board: Board;
  gridSize: number;
  winningCells: number[] | null;
  onCellClick: (index: number) => void;
  isClickable: boolean;
  evaluations: Record<number, MoveEvaluation>;
  showStatsOverlay: boolean;
  chosenMove?: number | null;
}

export default function GameBoard({
  board,
  gridSize,
  winningCells,
  onCellClick,
  isClickable,
  evaluations,
  showStatsOverlay,
  chosenMove = null,
}: GameBoardProps) {
  return (
    <div className="game-board" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
      {board.map((cell, index) => {
        const evaluation = evaluations[index];
        return (
          <Cell
            key={index}
            index={index}
            value={cell}
            onClick={onCellClick}
            isWinning={winningCells?.includes(index) ?? false}
            isClickable={isClickable}
            evaluation={evaluation}
            isOverlayVisible={showStatsOverlay}
            isChosen={chosenMove === index}
          />
        );
      })}
    </div>
  );
}

