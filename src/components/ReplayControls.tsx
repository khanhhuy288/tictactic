'use client';

interface ReplayControlsProps {
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleAutoPlay: () => void;
  disabled: boolean;
  isToggled: boolean;
  isActive: boolean;
  isAutoPlaying: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export default function ReplayControls({
  onToggle,
  onPrevious,
  onNext,
  onToggleAutoPlay,
  disabled,
  isToggled,
  isActive,
  isAutoPlaying,
  canGoPrevious,
  canGoNext,
}: ReplayControlsProps) {
  return (
    <div className="replay-controls-container">
      <button
        className="replay-button"
        onClick={onToggle}
        disabled={disabled}
        title={isToggled ? 'Hide replay controls' : 'Show replay controls'}
      >
        {isToggled ? '▼ Replay AI Thinking' : '▶️ Replay AI Thinking'}
      </button>
      
      {isToggled && (
        <div className="replay-controls">
          <button
            className="replay-control-button"
            onClick={onPrevious}
            disabled={!isActive || !canGoPrevious}
            title="Previous step"
          >
            ⏮️ Previous
          </button>
          <button
            className="replay-control-button"
            onClick={onToggleAutoPlay}
            disabled={disabled && !isActive}
            title={isAutoPlaying ? 'Pause auto-play' : isActive ? 'Start auto-play' : 'Start replay'}
          >
            {isAutoPlaying ? '⏸️ Pause' : '▶️ Auto-play'}
          </button>
          <button
            className="replay-control-button"
            onClick={onNext}
            disabled={disabled && !isActive}
            title={isActive ? 'Next step' : 'Start replay'}
          >
            Next ⏭️
          </button>
        </div>
      )}
    </div>
  );
}

