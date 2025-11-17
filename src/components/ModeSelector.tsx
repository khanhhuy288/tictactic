'use client';

interface ModeSelectorProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

export default function ModeSelector({ gridSize, onGridSizeChange }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <div className="mode-selector-label">Game Mode:</div>
      <div className="mode-selector-buttons">
        <button
          className={`mode-button ${gridSize === 3 ? 'active' : ''}`}
          onClick={() => onGridSizeChange(3)}
          aria-label="3x3 mode"
        >
          3×3
        </button>
        <button
          className={`mode-button ${gridSize === 4 ? 'active' : ''}`}
          onClick={() => onGridSizeChange(4)}
          aria-label="4x4 mode"
        >
          4×4
        </button>
      </div>
    </div>
  );
}

