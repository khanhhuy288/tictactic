import { getWinCombos } from '@/utils/winCombos';

describe('winCombos', () => {
  describe('getWinCombos', () => {
    it('should generate correct win combos for 3x3', () => {
      const combos = getWinCombos(3);
      expect(combos).toHaveLength(8); // 3 rows + 3 cols + 2 diagonals
      
      // Check first row
      expect(combos[0]).toEqual([0, 1, 2]);
      // Check first column
      expect(combos[1]).toEqual([0, 3, 6]);
      // Check diagonal
      expect(combos[6]).toEqual([0, 4, 8]);
    });

    it('should generate correct win combos for 4x4', () => {
      const combos = getWinCombos(4);
      expect(combos).toHaveLength(10); // 4 rows + 4 cols + 2 diagonals
      
      // Check first row
      expect(combos[0]).toEqual([0, 1, 2, 3]);
      // Check first column
      expect(combos[1]).toEqual([0, 4, 8, 12]);
    });
  });
});

