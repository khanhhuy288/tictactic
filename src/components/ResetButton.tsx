'use client';

interface ResetButtonProps {
  onReset: () => void;
}

export default function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <div className="menu">
      <button className="icon-reset" onClick={onReset} aria-label="Reset game">
        <i className="icon-ccw"></i>
      </button>
    </div>
  );
}

