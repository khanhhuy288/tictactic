'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/useGame';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import GameBoard from '@/components/GameBoard';
import SymbolSelector from '@/components/SymbolSelector';
import GameOverModal from '@/components/GameOverModal';
import ResetButton from '@/components/ResetButton';
import AIThinkingPanel from '@/components/AIThinkingPanel';
import ReplayCaption from '@/components/ReplayCaption';
import ReplayControls from '@/components/ReplayControls';
import ModeSelector from '@/components/ModeSelector';
import { generateReplaySteps, type ReplayStep } from '@/lib/ai/thinking';

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
  const { calculateMove, getRandomCornerMove, thinkingData, clearThinking } = useAIPlayer(gridSize, useAlphaBetaPruning);

  // Reset game and clear thinking data when gridSize changes
  useEffect(() => {
    clearThinking();
    setReplaySteps([]);
    setCurrentReplayStep(null);
    setIsReplaying(false);
    setIsAutoPlaying(false);
    isAutoPlayingRef.current = false;
    setReplayPhase(null);
    setCurrentPVStep(null);
    setTotalNodesEvaluated(0);
    setTotalBranchesPruned(0);
    setTotalSearchTime(0);
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
    // Game reset is handled by useGame hook's useEffect
  }, [gridSize, clearThinking]);
  
  // Cumulative statistics tracking
  const [totalNodesEvaluated, setTotalNodesEvaluated] = useState(0);
  const [totalBranchesPruned, setTotalBranchesPruned] = useState(0);
  const [totalSearchTime, setTotalSearchTime] = useState(0);
  
  // Replay state
  const [isReplayToggled, setIsReplayToggled] = useState(false);
  const [replaySteps, setReplaySteps] = useState<ReplayStep[]>([]);
  const [currentReplayStep, setCurrentReplayStep] = useState<number | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [replayPhase, setReplayPhase] = useState<'root' | 'pv' | null>(null);
  const [currentPVStep, setCurrentPVStep] = useState<number | null>(null);
  const replayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoPlayingRef = useRef(false);

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

  // Generate replay steps when thinking data changes and update cumulative statistics
  useEffect(() => {
    if (thinkingData) {
      const steps = generateReplaySteps(thinkingData);
      setReplaySteps(steps);
      
      // Update cumulative statistics
      setTotalNodesEvaluated(prev => prev + thinkingData.nodesEvaluated);
      setTotalBranchesPruned(prev => prev + thinkingData.branchesPruned);
      if (thinkingData.searchTime !== undefined) {
        setTotalSearchTime(prev => prev + thinkingData.searchTime!);
      }
    } else {
      setReplaySteps([]);
    }
    // Reset replay state when thinking data changes
    setCurrentReplayStep(null);
    setIsReplaying(false);
    setIsAutoPlaying(false);
    isAutoPlayingRef.current = false;
    setReplayPhase(null);
    setCurrentPVStep(null);
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
  }, [thinkingData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
      }
    };
  }, []);

  const handleReplayToggle = () => {
    const newToggledState = !isReplayToggled;
    setIsReplayToggled(newToggledState);
    
    // When toggling off, reset replay state
    if (!newToggledState) {
      setIsReplaying(false);
      setCurrentReplayStep(null);
      setIsAutoPlaying(false);
      isAutoPlayingRef.current = false;
      setReplayPhase(null);
      setCurrentPVStep(null);
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
        replayTimeoutRef.current = null;
      }
    }
  };

  const handleReplayStart = () => {
    if (replaySteps.length === 0 || !thinkingData) return;

    setIsReplaying(true);
    setCurrentReplayStep(0);
    setReplayPhase('root');
    setCurrentPVStep(null);
    setIsAutoPlaying(false);
  };

  const handleReplayPrevious = () => {
    if (!isReplaying) return;

    if (replayPhase === 'pv' && currentPVStep !== null) {
      // In PV phase
      if (currentPVStep > 0) {
        setCurrentPVStep(currentPVStep - 1);
      } else {
        // Go back to last root step
        setReplayPhase('root');
        setCurrentReplayStep(replaySteps.length - 1);
        setCurrentPVStep(null);
      }
    } else if (replayPhase === 'root' && currentReplayStep !== null) {
      // In root phase
      if (currentReplayStep > 0) {
        setCurrentReplayStep(currentReplayStep - 1);
      }
    }
    setIsAutoPlaying(false);
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
  };

  const handleReplayNext = () => {
    // If replay hasn't started, start it first
    if (!isReplaying) {
      handleReplayStart();
      return;
    }

    if (replayPhase === 'pv' && currentPVStep !== null && thinkingData?.principalVariation) {
      // In PV phase
      if (currentPVStep < thinkingData.principalVariation.length - 1) {
        setCurrentPVStep(currentPVStep + 1);
      } else {
        // PV complete, end replay
        setIsReplaying(false);
        setReplayPhase(null);
        setCurrentPVStep(null);
      }
    } else if (replayPhase === 'root' && currentReplayStep !== null) {
      // In root phase
      if (currentReplayStep < replaySteps.length - 1) {
        setCurrentReplayStep(currentReplayStep + 1);
      } else {
        // Root moves complete, start PV phase if available
        if (thinkingData?.principalVariation && thinkingData.principalVariation.length > 1) {
          setReplayPhase('pv');
          setCurrentReplayStep(null);
          setCurrentPVStep(0);
        } else {
          // No PV, end replay
          setIsReplaying(false);
          setReplayPhase(null);
        }
      }
    }
    setIsAutoPlaying(false);
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
  };

  const handleToggleAutoPlay = () => {
    // If replay hasn't started, start it first
    if (!isReplaying) {
      handleReplayStart();
      // Then start auto-play
      setIsAutoPlaying(true);
      isAutoPlayingRef.current = true;
      return;
    }

    if (isAutoPlaying) {
      // Pause
      setIsAutoPlaying(false);
      isAutoPlayingRef.current = false;
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
        replayTimeoutRef.current = null;
      }
    } else {
      // Start auto-play (will be handled by useEffect)
      setIsAutoPlaying(true);
      isAutoPlayingRef.current = true;
    }
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || !isReplaying || !thinkingData) {
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
        replayTimeoutRef.current = null;
      }
      return;
    }

    // Phase 1: Root moves
    const animateRootStep = (stepIndex: number) => {
      if (!isAutoPlayingRef.current) return; // Stop if auto-play was paused

      if (stepIndex >= replaySteps.length) {
        // Root moves complete, start PV phase if available
        if (thinkingData.principalVariation && thinkingData.principalVariation.length > 1) {
          setReplayPhase('pv');
          setCurrentReplayStep(null);
          animatePVStep(0);
        } else {
          // No PV, end replay
          setIsReplaying(false);
          setIsAutoPlaying(false);
          isAutoPlayingRef.current = false;
          setReplayPhase(null);
          replayTimeoutRef.current = setTimeout(() => {
            setCurrentReplayStep(null);
          }, 500);
        }
        return;
      }

      setCurrentReplayStep(stepIndex);
      replayTimeoutRef.current = setTimeout(() => {
        if (isAutoPlayingRef.current) {
          animateRootStep(stepIndex + 1);
        }
      }, 400);
    };

    // Phase 2: Principal Variation
    const animatePVStep = (pvIndex: number) => {
      if (!isAutoPlayingRef.current) return; // Stop if auto-play was paused

      if (!thinkingData.principalVariation || pvIndex >= thinkingData.principalVariation.length) {
        // PV complete
        setIsReplaying(false);
        setIsAutoPlaying(false);
        isAutoPlayingRef.current = false;
        setReplayPhase(null);
        setCurrentPVStep(null);
        replayTimeoutRef.current = setTimeout(() => {
          setCurrentReplayStep(null);
        }, 500);
        return;
      }

      setCurrentPVStep(pvIndex);
      replayTimeoutRef.current = setTimeout(() => {
        if (isAutoPlayingRef.current) {
          animatePVStep(pvIndex + 1);
        }
      }, 600);
    };

    // Start from current position
    if (replayPhase === 'pv' && currentPVStep !== null) {
      animatePVStep(currentPVStep);
    } else if (replayPhase === 'root' && currentReplayStep !== null) {
      animateRootStep(currentReplayStep);
    } else {
      animateRootStep(0);
    }

    return () => {
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
        replayTimeoutRef.current = null;
      }
    };
  }, [isAutoPlaying, isReplaying, replayPhase, currentReplayStep, currentPVStep, replaySteps.length, thinkingData]);

  const handleReset = () => {
    clearThinking();
    setReplaySteps([]);
    setCurrentReplayStep(null);
    setIsReplaying(false);
    setIsAutoPlaying(false);
    isAutoPlayingRef.current = false;
    setReplayPhase(null);
    setCurrentPVStep(null);
    // Reset cumulative statistics
    setTotalNodesEvaluated(0);
    setTotalBranchesPruned(0);
    setTotalSearchTime(0);
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
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
              currentReplayStep={currentReplayStep}
              replaySteps={replaySteps}
              replayPhase={replayPhase}
              currentPVStep={currentPVStep}
              principalVariation={thinkingData?.principalVariation}
              aiPlayer={gameState.aiPlayer}
              humanPlayer={gameState.humanPlayer}
            />
            
            {isReplayToggled && isReplaying && currentReplayStep !== null && replayPhase === 'root' && (
              <ReplayCaption
                currentStep={replaySteps[currentReplayStep]}
                stepIndex={currentReplayStep}
                totalSteps={replaySteps.length}
                gridSize={gridSize}
              />
            )}
            
            <ReplayControls
              onToggle={handleReplayToggle}
              onPrevious={handleReplayPrevious}
              onNext={handleReplayNext}
              onToggleAutoPlay={handleToggleAutoPlay}
              disabled={!thinkingData || replaySteps.length === 0}
              isToggled={isReplayToggled}
              isActive={isReplaying}
              isAutoPlaying={isAutoPlaying}
              canGoPrevious={
                (replayPhase === 'root' && currentReplayStep !== null && currentReplayStep > 0) ||
                (replayPhase === 'pv' && currentPVStep !== null && currentPVStep > 0) ||
                (replayPhase === 'pv' && currentPVStep === 0)
              }
              canGoNext={
                (replayPhase === 'root' && currentReplayStep !== null && currentReplayStep < replaySteps.length - 1) ||
                (replayPhase === 'pv' && currentPVStep !== null && thinkingData?.principalVariation && currentPVStep < thinkingData.principalVariation.length - 1) ||
                (replayPhase === 'root' && currentReplayStep === replaySteps.length - 1 && (thinkingData?.principalVariation?.length ?? 0) > 1)
              }
            />
            
            <ResetButton onReset={handleReset} />
          </div>

          {showThinkingPanel && (
            <div>
              <ModeSelector gridSize={gridSize} onGridSizeChange={setGridSize} />
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

