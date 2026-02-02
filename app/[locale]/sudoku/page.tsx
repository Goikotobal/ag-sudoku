'use client';

import AISudoku from '../../components/sudoku/AISudoku';

// This page now goes directly to the game with Medium difficulty
// No intermediate menus or difficulty selection screens
export default function SudokuPage() {
  return <AISudoku initialDifficulty="medium" />;
}
