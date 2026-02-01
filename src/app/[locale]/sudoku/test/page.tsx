'use client';

import FramerSudoku from '@/components/sudoku/FramerSudoku'

export default function SudokuTestPage() {
  return (
    <div
      suppressHydrationWarning
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#0f172a',
        position: 'relative',
      }}
    >
      <FramerSudoku />
    </div>
  )
}