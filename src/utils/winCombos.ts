/**
 * Generate all the win combinations for a board.
 * @param n Length of the board's edge (e.g., 3 for 3×3, 4 for 4×4).
 * @returns Array of arrays, where each inner array contains cell indices that form a winning line.
 */
export function getWinCombos(n: number): number[][] {
  const result: number[][] = [];
  const row: number[] = [];
  const col: number[] = [];
  const diagonalLeft: number[] = [];
  const diagonalRight: number[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      row.push(n * i + j);
      col.push(i + n * j);
    }
    result.push([...row], [...col]);
    row.length = 0;
    col.length = 0;

    diagonalLeft.push((n + 1) * i);
    diagonalRight.push((n - 1) * (i + 1));
  }

  result.push(diagonalLeft, diagonalRight);

  return result;
}

