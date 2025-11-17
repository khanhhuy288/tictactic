export type Player = 'X' | 'O';
export type CellValue = Player | number; // number represents empty cell index
export type Board = CellValue[];

export interface GameState {
  board: Board;
  currentPlayer: Player | null;
  humanPlayer: Player | null;
  aiPlayer: Player | null;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[] | null;
}

export type GameStatus = 'idle' | 'symbol-selection' | 'playing' | 'won' | 'draw';

export interface GameResult {
  winner: Player | null;
  winningCells: number[] | null;
  isDraw: boolean;
}

export interface MoveResult {
  move: number;
  result: GameResult | null;
}

