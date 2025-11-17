/**
 * Generate all the win combinations for a board.
 * @param n Length of the board's edge (e.g., 3 for 3×3, 4 for 4×4).
 * @param winLength Number of consecutive cells required to win (default: same as n).
 * @returns Array of arrays, where each inner array contains cell indices that form a winning line.
 */
export function getWinCombos(n: number, winLength: number = n): number[][] {
  const result: number[][] = [];

  // For 3x3, winLength is 3 (full rows/columns/diagonals)
  // For 4x4, winLength is 4 (full rows/columns/diagonals)
  // This function generates all sequences of winLength consecutive cells

  // Horizontal sequences
  for (let row = 0; row < n; row++) {
    for (let startCol = 0; startCol <= n - winLength; startCol++) {
      const sequence: number[] = [];
      for (let offset = 0; offset < winLength; offset++) {
        sequence.push(n * row + startCol + offset);
      }
      result.push(sequence);
    }
  }

  // Vertical sequences
  for (let col = 0; col < n; col++) {
    for (let startRow = 0; startRow <= n - winLength; startRow++) {
      const sequence: number[] = [];
      for (let offset = 0; offset < winLength; offset++) {
        sequence.push(n * (startRow + offset) + col);
      }
      result.push(sequence);
    }
  }

  // Diagonal sequences (top-left to bottom-right)
  for (let startRow = 0; startRow <= n - winLength; startRow++) {
    for (let startCol = 0; startCol <= n - winLength; startCol++) {
      const sequence: number[] = [];
      for (let offset = 0; offset < winLength; offset++) {
        sequence.push(n * (startRow + offset) + (startCol + offset));
      }
      result.push(sequence);
    }
  }

  // Diagonal sequences (top-right to bottom-left)
  for (let startRow = 0; startRow <= n - winLength; startRow++) {
    for (let startCol = winLength - 1; startCol < n; startCol++) {
      const sequence: number[] = [];
      for (let offset = 0; offset < winLength; offset++) {
        sequence.push(n * (startRow + offset) + (startCol - offset));
      }
      result.push(sequence);
    }
  }

  return result;
}

