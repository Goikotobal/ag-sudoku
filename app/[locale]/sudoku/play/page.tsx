'use client';

import AISudoku from '../../../components/sudoku/AISudoku';

// This page goes directly to the game with Medium difficulty
// No menu screens - game starts immediately
export default function SudokuPlayPage() {
  return <AISudoku initialDifficulty="medium" />;
}
