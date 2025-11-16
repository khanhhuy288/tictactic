'use client';

interface GameOverModalProps {
  message: string;
  onReset: () => void;
}

export default function GameOverModal({ message, onReset }: GameOverModalProps) {
  return (
    <div className="popup endgame">
      <p className="text">{message}</p>
      <button className="icon-reset" onClick={onReset} aria-label="Reset game">
        <i className="icon-ccw"></i>
      </button>
    </div>
  );
}

