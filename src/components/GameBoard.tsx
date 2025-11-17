'use client';

import type { Board } from '@/lib/game/types';
import type { ReplayStep, ReplayStepKind } from '@/lib/ai/thinking';
import Cell from './Cell';

interface GameBoardProps {
  board: Board;
  gridSize: number;
  winningCells: number[] | null;
  onCellClick: (index: number) => void;
  isClickable: boolean;
  currentReplayStep: number | null;
  replaySteps: ReplayStep[];
  replayPhase?: 'root' | 'pv' | null;
  currentPVStep?: number | null;
  principalVariation?: number[];
  aiPlayer?: string | null;
  humanPlayer?: string | null;
}

export default function GameBoard({
  board,
  gridSize,
  winningCells,
  onCellClick,
  isClickable,
  currentReplayStep,
  replaySteps,
  replayPhase,
  currentPVStep,
  principalVariation,
  aiPlayer,
  humanPlayer,
}: GameBoardProps) {
  // Calculate max nodes visited for intensity normalization
  const maxNodesVisited = replaySteps.reduce((max, step) => {
    return Math.max(max, step.nodesVisited || 0);
  }, 0);

  // Get all visited cells up to current step
  const getVisitedCells = () => {
    if (currentReplayStep === null) {
      return [];
    }
    // Show all visited cells up to and including current step
    return replaySteps.slice(0, currentReplayStep + 1);
  };

  // Find the replay state for each cell
  const getCellReplayState = (cellIndex: number) => {
    if (replayPhase === 'pv') {
      // PV phase: show ghost symbols and visited cells from root phase
      let ghostSymbol: 'X' | 'O' | null = null;
      let visited = false;
      let visitedKind: ReplayStepKind | null = null;
      let visitedStepNumber: number | undefined = undefined;
      let visitedOutcome: 'win' | 'loss' | 'tie' | 'unknown' | null = null;
      let visitedNodesVisited: number | undefined = undefined;
      
      // Show ghost symbol for current PV step
      if (currentPVStep !== null && currentPVStep !== undefined && principalVariation) {
        const pvMoveIndex = principalVariation[currentPVStep];
        if (pvMoveIndex !== undefined && pvMoveIndex === cellIndex) {
          // Determine which player's turn it is (alternating)
          const isAITurn = currentPVStep % 2 === 0;
          const player = (isAITurn ? aiPlayer : humanPlayer);
          ghostSymbol = (player === 'X' || player === 'O' ? player : null) as 'X' | 'O' | null;
        }
      }
      
      // Show all visited cells from root phase
      const visitedSteps = replaySteps; // Show all root steps in PV phase
      const visitedStep = visitedSteps.find(step => step.moveIndex === cellIndex);
      if (visitedStep) {
        visited = true;
        visitedKind = visitedStep.kind;
        visitedStepNumber = visitedStep.stepNumber;
        visitedOutcome = visitedStep.outcome || null;
        visitedNodesVisited = visitedStep.nodesVisited;
      }
      
      if (ghostSymbol || visited) {
        return {
          ghostSymbol,
          visited,
          visitedKind,
          visitedStepNumber,
          visitedOutcome,
          visitedNodesVisited,
        };
      }
      return null;
    }
    
    // Root phase: show all visited cells up to current step
    if (currentReplayStep === null) return null;
    
    const visitedSteps = getVisitedCells();
    const visitedStep = visitedSteps.find(step => step.moveIndex === cellIndex);
    
    if (visitedStep) {
      const isCurrent = visitedStep.moveIndex === replaySteps[currentReplayStep]?.moveIndex;
      return {
        visited: true,
        isCurrent,
        replayState: isCurrent ? visitedStep.kind : null,
        visitedKind: visitedStep.kind,
        replayStepNumber: isCurrent ? visitedStep.stepNumber : undefined,
        visitedStepNumber: visitedStep.stepNumber,
        replayOutcome: isCurrent ? visitedStep.outcome : undefined,
        visitedOutcome: visitedStep.outcome,
        replayNodesVisited: isCurrent ? visitedStep.nodesVisited : undefined,
        visitedNodesVisited: visitedStep.nodesVisited,
      };
    }
    return null;
  };

  return (
    <div className="game-board" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
      {board.map((cell, index) => {
        const replayInfo = getCellReplayState(index);
        return (
          <Cell
            key={index}
            index={index}
            value={cell}
            onClick={onCellClick}
            isWinning={winningCells?.includes(index) ?? false}
            isClickable={isClickable}
            replayState={replayInfo?.replayState ?? null}
            replayStepNumber={replayInfo?.replayStepNumber}
            replayOutcome={replayInfo?.replayOutcome ?? null}
            replayNodesVisited={replayInfo?.replayNodesVisited}
            maxNodesVisited={maxNodesVisited}
            ghostSymbol={replayInfo?.ghostSymbol ?? null}
            visited={replayInfo?.visited ?? false}
            visitedKind={replayInfo?.visitedKind ?? null}
            visitedStepNumber={replayInfo?.visitedStepNumber}
            visitedOutcome={replayInfo?.visitedOutcome ?? null}
            visitedNodesVisited={replayInfo?.visitedNodesVisited}
            isCurrent={replayInfo?.isCurrent ?? false}
          />
        );
      })}
    </div>
  );
}

