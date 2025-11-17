'use client';

interface ReplayButtonProps {
  onReplay: () => void;
  disabled: boolean;
  isReplaying: boolean;
}

export default function ReplayButton({ onReplay, disabled, isReplaying }: ReplayButtonProps) {
  return (
    <button
      className="replay-button"
      onClick={onReplay}
      disabled={disabled || isReplaying}
      title={isReplaying ? 'Replay in progress...' : 'Watch how the AI evaluated moves'}
    >
      {isReplaying ? '⏳ Replaying...' : '▶️ Replay AI Thinking'}
    </button>
  );
}

