'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/useGame';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import GameBoard from '@/components/GameBoard';
import SymbolSelector from '@/components/SymbolSelector';
import GameOverModal from '@/components/GameOverModal';
import ResetButton from '@/components/ResetButton';
import AIThinkingPanel from '@/components/AIThinkingPanel';
import ModeSelector from '@/components/ModeSelector';
import { getMoveEvaluationMap } from '@/lib/ai/thinking';

export default function Home() {
  const [gridSize, setGridSize] = useState(3);
  
  const {
    gameState,
    selectSymbol,
    makePlayerMove,
    makeAIMove,
    reset,
    isHumanTurn,
    isAITurn,
  } = useGame(gridSize);

  const isProcessingAIMove = useRef(false);
  const [showThinkingPanel, setShowThinkingPanel] = useState(true);
  const [useAlphaBetaPruning, setUseAlphaBetaPruning] = useState(true);
  const [showStatsOverlay, setShowStatsOverlay] = useState(true);
  const { calculateMove, getRandomCornerMove, thinkingData, clearThinking } = useAIPlayer(gridSize, useAlphaBetaPruning);

  // Cumulative statistics tracking
  const [totalNodesEvaluated, setTotalNodesEvaluated] = useState(0);
  const [totalBranchesPruned, setTotalBranchesPruned] = useState(0);
  const [totalSearchTime, setTotalSearchTime] = useState(0);
  
  const handleGridSizeChange = (size: number) => {
    if (size === gridSize) {
      return;
    }
    setGridSize(size);
    clearThinking();
    setTotalNodesEvaluated(0);
    setTotalBranchesPruned(0);
    setTotalSearchTime(0);
    reset(size);
  };
  
  // Handle AI's first move when AI is X
  useEffect(() => {
    if (
      gameState.status === 'playing' &&
      gameState.currentPlayer === 'X' &&
      gameState.aiPlayer === 'X' &&
      gameState.board.every((cell) => typeof cell === 'number') &&
      !isProcessingAIMove.current
    ) {
      // AI goes first - use random corner move
      isProcessingAIMove.current = true;
      const cornerMove = getRandomCornerMove(gameState.board);
      makeAIMove(cornerMove);
      isProcessingAIMove.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status, gameState.currentPlayer, gameState.aiPlayer, gameState.board]);

  // Handle AI move after human move (but not the first move)
  useEffect(() => {
    if (
      isAITurn &&
      gameState.aiPlayer &&
      gameState.humanPlayer &&
      !gameState.board.every((cell) => typeof cell === 'number') && // Not the first move
      !isProcessingAIMove.current
    ) {
      isProcessingAIMove.current = true;
      const handleAIMove = async () => {
        try {
          const result = await calculateMove(
            gameState.board,
            gameState.aiPlayer!,
            gameState.humanPlayer!
          );
          makeAIMove(result.move);
        } finally {
          isProcessingAIMove.current = false;
        }
      };
      handleAIMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAITurn, gameState.board]);

  const handleCellClick = (index: number) => {
    if (isHumanTurn) {
      makePlayerMove(index);
    }
  };

  // Update cumulative statistics when thinking data changes
  useEffect(() => {
    if (thinkingData) {
      // Update cumulative statistics
      setTotalNodesEvaluated(prev => prev + thinkingData.nodesEvaluated);
      setTotalBranchesPruned(prev => prev + thinkingData.branchesPruned);
      if (thinkingData.searchTime !== undefined) {
        setTotalSearchTime(prev => prev + thinkingData.searchTime!);
      }
    }
  }, [thinkingData]);

  const handleReset = () => {
    clearThinking();
    // Reset cumulative statistics
    setTotalNodesEvaluated(0);
    setTotalBranchesPruned(0);
    setTotalSearchTime(0);
    reset();
  };

  const getGameOverMessage = () => {
    if (gameState.status === 'draw') {
      return "It's a Draw!";
    }
    if (gameState.winner === gameState.humanPlayer) {
      return 'You win!';
    }
    return 'You lose!';
  };

  const showSymbolSelector = gameState.status === 'symbol-selection';
  const showGameOver = gameState.status === 'won' || gameState.status === 'draw';
  const isClickable = isHumanTurn && gameState.status === 'playing';
  const moveEvaluationMap = thinkingData ? getMoveEvaluationMap(thinkingData) : {};

  return (
    <div className="container">
      <div className="header">
        <span>TIC TACTIC</span>
        <div className="header-toggles">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showThinkingPanel}
              onChange={(e) => setShowThinkingPanel(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Show AI Thinking</span>
          </label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={useAlphaBetaPruning}
              onChange={(e) => setUseAlphaBetaPruning(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Alpha-Beta Pruning</span>
          </label>
        </div>
      </div>
      
      <div className="content">
        <div className="game-container">
          <div className="game-area">
            <GameBoard
              board={gameState.board}
              gridSize={gridSize}
              winningCells={gameState.winningCells}
              onCellClick={handleCellClick}
              isClickable={isClickable}
              evaluations={moveEvaluationMap}
              showStatsOverlay={showStatsOverlay}
              chosenMove={thinkingData?.chosenMove ?? null}
            />
            
            <ResetButton onReset={handleReset} />
          </div>

          {showThinkingPanel && (
            <div className="sidebar-panel">
              <ModeSelector gridSize={gridSize} onGridSizeChange={handleGridSizeChange} />
              <div className="overlay-toggle">
                <label className="toggle-switch compact">
                  <input
                    type="checkbox"
                    checked={showStatsOverlay}
                    onChange={(e) => setShowStatsOverlay(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">Show stats overlay</span>
                </label>
              </div>
              <AIThinkingPanel 
                thinkingData={thinkingData} 
                gridSize={gridSize}
                totalNodesEvaluated={totalNodesEvaluated}
                totalBranchesPruned={totalBranchesPruned}
                totalSearchTime={totalSearchTime}
              />
            </div>
          )}
        </div>

        {showSymbolSelector && <SymbolSelector onSelect={selectSymbol} />}
        {showGameOver && (
          <GameOverModal message={getGameOverMessage()} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}

