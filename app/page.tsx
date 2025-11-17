'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/useGame';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import GameBoard from '@/components/GameBoard';
import SymbolSelector from '@/components/SymbolSelector';
import GameOverModal from '@/components/GameOverModal';
import ResetButton from '@/components/ResetButton';
import AIThinkingPanel from '@/components/AIThinkingPanel';

export default function Home() {
  const {
    gameState,
    selectSymbol,
    makePlayerMove,
    makeAIMove,
    reset,
    isHumanTurn,
    isAITurn,
    gridSize,
  } = useGame();

  const { calculateMove, getRandomCornerMove, thinkingData, clearThinking } = useAIPlayer(gridSize);
  const isProcessingAIMove = useRef(false);
  const [showThinkingPanel, setShowThinkingPanel] = useState(true);

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

  const handleReset = () => {
    clearThinking();
    reset();
  };

  const getGameOverMessage = () => {
    if (gameState.status === 'tie') {
      return "It's a Tie!";
    }
    if (gameState.winner === gameState.humanPlayer) {
      return 'You win!';
    }
    return 'You lose!';
  };

  const showSymbolSelector = gameState.status === 'symbol-selection';
  const showGameOver = gameState.status === 'won' || gameState.status === 'tie';
  const isClickable = isHumanTurn && gameState.status === 'playing';

  return (
    <div className="container">
      <div className="header">
        <span>TIC TAC TOE</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={showThinkingPanel}
            onChange={(e) => setShowThinkingPanel(e.target.checked)}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">Show AI Thinking</span>
        </label>
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
            />
            
            <ResetButton onReset={handleReset} />
          </div>

          {showThinkingPanel && (
            <AIThinkingPanel thinkingData={thinkingData} gridSize={gridSize} />
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

