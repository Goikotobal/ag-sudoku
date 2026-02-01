'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSudokuTranslations } from '@/hooks/useSudokuTranslations';

interface AISudokuProps {
  onQuit?: () => void;
}

type Difficulty = 'medium' | 'expert' | 'pro';
type Board = number[][];

const difficulties: Record<Difficulty, number> = {
  medium: 45,
  expert: 52,
  pro: 58
};

const difficultyRules: Record<Difficulty, { maxMistakes: number; hints: number }> = {
  medium: { maxMistakes: 5, hints: 3 },
  expert: { maxMistakes: 3, hints: 1 },
  pro: { maxMistakes: 1, hints: 0 }
};

export default function AISudoku({ onQuit }: AISudokuProps) {
  const t = useSudokuTranslations();

  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState<Set<number>[][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showWinModal, setShowWinModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [hintCell, setHintCell] = useState<{ row: number; col: number } | null>(null);
  const [proUnlocked, setProUnlocked] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Inject aurora animation CSS
  useEffect(() => {
    const styleId = 'aurora-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes aurora1 {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translate(-48%, -52%) rotate(5deg) scale(1.1);
            opacity: 0.4;
          }
          66% {
            transform: translate(-52%, -48%) rotate(-3deg) scale(0.95);
            opacity: 0.35;
          }
        }
        @keyframes aurora2 {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(120deg) scale(1);
            opacity: 0.25;
          }
          33% {
            transform: translate(-52%, -48%) rotate(125deg) scale(1.15);
            opacity: 0.3;
          }
          66% {
            transform: translate(-48%, -52%) rotate(115deg) scale(0.9);
            opacity: 0.28;
          }
        }
        @keyframes aurora3 {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(240deg) scale(1);
            opacity: 0.2;
          }
          33% {
            transform: translate(-48%, -52%) rotate(245deg) scale(0.95);
            opacity: 0.25;
          }
          66% {
            transform: translate(-52%, -48%) rotate(235deg) scale(1.1);
            opacity: 0.22;
          }
        }
        @keyframes auroraGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);

  // Responsive breakpoint - 1024px as per Framer
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Generate a valid Sudoku solution
  const generateSolution = useCallback((): Board => {
    const board: Board = Array(9).fill(0).map(() => Array(9).fill(0));

    const isValid = (board: Board, row: number, col: number, num: number): boolean => {
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
      }
      for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
      }
      const startRow = row - row % 3;
      const startCol = col - col % 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i + startRow][j + startCol] === num) return false;
        }
      }
      return true;
    };

    const solve = (board: Board): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of numbers) {
              if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (solve(board)) return true;
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve(board);
    return board;
  }, []);

  // Create puzzle by removing cells
  const createPuzzle = useCallback((solution: Board, cellsToRemove: number): Board => {
    const puzzle = solution.map(row => [...row]);
    let removed = 0;

    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);

      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }

    return puzzle;
  }, []);

  // Start new game
  const newGame = useCallback((diff: Difficulty = difficulty) => {
    const newSolution = generateSolution();
    const newBoard = createPuzzle(newSolution, difficulties[diff]);

    setSolution(newSolution);
    setBoard(newBoard.map(row => [...row]));
    setInitialBoard(newBoard.map(row => [...row]));
    setNotes(Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>())));
    setMistakes(0);
    setHintsRemaining(difficultyRules[diff].hints);
    setTimer(0);
    setIsPaused(false);
    setSelectedCell(null);
    setShowWinModal(false);
    setShowGameOverModal(false);
    setShowPauseModal(false);
    setHintCell(null);
    setDifficulty(diff);
  }, [difficulty, generateSolution, createPuzzle]);

  // Initialize game on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unlocked = localStorage.getItem('agSudokuProUnlocked') === 'true';
      setProUnlocked(unlocked);
    }
    newGame('medium');
  }, []);

  // Timer effect
  useEffect(() => {
    if (isPaused || showWinModal || showGameOverModal) return;

    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, showWinModal, showGameOverModal]);

  // Check for win
  useEffect(() => {
    if (board.length === 0) return;

    const isComplete = board.every((row, r) =>
      row.every((cell, c) => cell === solution[r]?.[c])
    );

    if (isComplete && solution.length > 0) {
      setShowWinModal(true);
      if (difficulty === 'expert' && timer < 900 && !proUnlocked) {
        setProUnlocked(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('agSudokuProUnlocked', 'true');
        }
      }
    }
  }, [board, solution, difficulty, timer, proUnlocked]);

  // Place number
  const placeNumber = (num: number) => {
    if (!selectedCell || initialBoard[selectedCell.row]?.[selectedCell.col] !== 0) return;

    const { row, col } = selectedCell;

    if (notesMode && num !== 0) {
      const newNotes = notes.map(r => r.map(c => new Set(c)));
      if (newNotes[row][col].has(num)) {
        newNotes[row][col].delete(num);
      } else {
        newNotes[row][col].add(num);
      }
      setNotes(newNotes);
      return;
    }

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    if (num !== 0) {
      const newNotes = notes.map(r => r.map(c => new Set(c)));
      newNotes[row][col].clear();
      setNotes(newNotes);
    }

    if (num !== 0 && num !== solution[row][col]) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= difficultyRules[difficulty].maxMistakes) {
        setShowGameOverModal(true);
      }
    }
  };

  // Give hint
  const giveHint = () => {
    if (hintsRemaining <= 0) return;

    const emptyCells: { row: number; col: number }[] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newBoard = board.map(r => [...r]);
      newBoard[randomCell.row][randomCell.col] = solution[randomCell.row][randomCell.col];
      setBoard(newBoard);
      setHintCell(randomCell);
      setHintsRemaining(h => h - 1);

      setTimeout(() => setHintCell(null), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleDifficultyChange = (newDiff: Difficulty) => {
    if (newDiff === 'pro' && !proUnlocked) {
      alert(t.difficulties.locked);
      return;
    }
    newGame(newDiff);
  };

  // Render Sudoku Grid
  const renderSudokuGrid = () => (
    <div style={{
      maxWidth: isDesktop ? '500px' : 'none',
      width: isDesktop ? '500px' : '92vw',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(9, 1fr)',
        gap: '1px',
        background: '#2d3748',
        border: '3px solid #2d3748',
        borderRadius: '12px',
        overflow: 'hidden',
        aspectRatio: '1',
      }}>
        {Array.from({ length: 81 }).map((_, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;
          const value = board[row]?.[col] || 0;
          const isGiven = initialBoard[row]?.[col] !== 0;
          const isSelected = selectedCell?.row === row && selectedCell?.col === col;
          const isError = value !== 0 && value !== solution[row]?.[col];
          const isHintHighlight = hintCell?.row === row && hintCell?.col === col;
          const cellNotes = notes[row]?.[col] || new Set<number>();

          return (
            <div
              key={index}
              onClick={() => !isGiven && setSelectedCell({ row, col })}
              style={{
                aspectRatio: '1',
                background: isHintHighlight ? '#fef3c7' : isSelected ? '#d1fae5' : isError ? '#fee2e2' : isGiven ? '#f7fafc' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isDesktop ? '28px' : 'clamp(18px, 5vw, 28px)',
                fontWeight: isGiven ? '700' : '600',
                cursor: isGiven ? 'default' : 'pointer',
                color: isError ? '#dc2626' : isGiven ? '#2d3748' : '#10b981',
                borderRight: (col + 1) % 3 === 0 && col !== 8 ? '2px solid #2d3748' : 'none',
                borderBottom: (row + 1) % 3 === 0 && row !== 8 ? '2px solid #2d3748' : 'none',
                transition: 'background 0.15s',
                position: 'relative',
              }}
            >
              {value || (cellNotes.size > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  fontSize: isDesktop ? '10px' : '8px',
                  color: '#a0aec0',
                  position: 'absolute',
                  inset: '2px',
                }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <span key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cellNotes.has(n) ? n : ''}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Controls
  const renderControls = () => (
    <div style={{
      width: isDesktop ? '350px' : '92vw',
      maxWidth: isDesktop ? '350px' : '500px',
      margin: '0 auto',
      paddingTop: isDesktop ? '0' : '16px',
    }}>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '16px',
      }}>
        {[
          { label: t.stats.time, value: formatTime(timer) },
          { label: t.stats.mistakes, value: `${mistakes}/${difficultyRules[difficulty].maxMistakes}` },
          { label: t.stats.hints, value: hintsRemaining.toString() }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '12px 8px',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700', marginTop: '2px' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Difficulty Selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        background: 'rgba(247, 250, 252, 0.9)',
        padding: '6px',
        borderRadius: '12px',
      }}>
        {(['medium', 'expert', 'pro'] as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => handleDifficultyChange(diff)}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              background: difficulty === diff ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              color: difficulty === diff ? 'white' : '#4a5568',
              boxShadow: difficulty === diff ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s',
              opacity: diff === 'pro' && !proUnlocked ? 0.5 : 1,
            }}
          >
            {diff === 'pro' && !proUnlocked ? '🔒 ' : ''}{t.difficulties[diff]}
          </button>
        ))}
      </div>

      {/* Number Pad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        marginBottom: '12px',
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
          <button
            key={num}
            onClick={() => placeNumber(num)}
            style={{
              padding: '14px 8px',
              border: '2px solid #e2e8f0',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: '700',
              color: '#2d3748',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.color = '#2d3748';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {num || 'X'}
          </button>
        ))}
      </div>

      {/* Action Buttons Row 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '10px',
      }}>
        <button
          onClick={() => setNotesMode(!notesMode)}
          style={{
            padding: '12px',
            border: '2px solid #e2e8f0',
            background: notesMode ? '#10b981' : 'rgba(255, 255, 255, 0.9)',
            color: notesMode ? 'white' : '#4a5568',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
        >
          {t.controls.notes}: {notesMode ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => {
            setIsPaused(true);
            setShowPauseModal(true);
          }}
          style={{
            padding: '12px',
            border: '2px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#4a5568',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          {t.controls.pause}
        </button>
      </div>

      {/* Action Buttons Row 2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
      }}>
        <button
          onClick={giveHint}
          disabled={hintsRemaining <= 0}
          style={{
            padding: '12px',
            border: 'none',
            borderRadius: '10px',
            cursor: hintsRemaining > 0 ? 'pointer' : 'not-allowed',
            fontWeight: '600',
            fontSize: '14px',
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            color: 'white',
            opacity: hintsRemaining > 0 ? 1 : 0.5,
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
          }}
        >
          {t.controls.hint} ({hintsRemaining})
        </button>
        <button
          onClick={() => newGame(difficulty)}
          style={{
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#4a5568',
          }}
        >
          {t.controls.new}
        </button>
      </div>
    </div>
  );

  // Render Modal
  const renderModal = (
    show: boolean,
    title: string,
    content: React.ReactNode,
    buttons: React.ReactNode
  ) => {
    if (!show) return null;
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
        }}>
          <h2 style={{ color: '#2d3748', marginBottom: '15px', fontSize: '24px' }}>
            {title}
          </h2>
          {content}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {buttons}
          </div>
        </div>
      </div>
    );
  };

  const modalButtonPrimary = {
    padding: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
  };

  const modalButtonSecondary = {
    padding: '12px',
    background: '#f7fafc',
    color: '#4a5568',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111827',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Aurora Background Animation */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: isDesktop ? '60%' : '50%',
          left: '50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          animation: 'aurora1 20s ease-in-out infinite',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute',
          top: isDesktop ? '60%' : '50%',
          left: '50%',
          width: '180%',
          height: '180%',
          background: 'radial-gradient(ellipse at center, rgba(5, 150, 105, 0.12) 0%, transparent 70%)',
          animation: 'aurora2 25s ease-in-out infinite',
          filter: 'blur(70px)',
        }} />
        <div style={{
          position: 'absolute',
          top: isDesktop ? '60%' : '50%',
          left: '50%',
          width: '220%',
          height: '220%',
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
          animation: 'aurora3 30s ease-in-out infinite',
          filter: 'blur(80px)',
        }} />
      </div>

      {/* Main Content */}
      <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'transparent',
        width: '100%',
        minHeight: '100vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isDesktop ? 'center' : 'flex-start',
        padding: isDesktop ? '0.5rem' : '0',
        paddingTop: isDesktop ? '0.3rem' : 'max(4px, env(safe-area-inset-top))',
        paddingBottom: isDesktop ? '1rem' : 'max(4px, env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px', paddingTop: isDesktop ? '0' : '12px' }}>
          <h1 style={{
            fontSize: isDesktop ? '32px' : '28px',
            fontWeight: '700',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t.title}
            </span>
          </h1>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'linear-gradient(90deg, #064e3b 0%, #10b981 25%, #34d399 50%, #10b981 75%, #064e3b 100%)',
            backgroundSize: '200% 100%',
            animation: 'auroraGradient 4s ease-in-out infinite',
            color: 'white',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            ✨ {t.subtitle}
          </div>
        </div>

        {/* Game Layout */}
        {isDesktop ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '1.5rem',
            maxWidth: '100%',
            margin: '0 auto',
            padding: '0.5rem',
          }}>
            <div style={{ flex: '0 0 auto' }}>
              {renderSudokuGrid()}
            </div>
            <div style={{ width: '350px', flex: '0 0 auto' }}>
              {renderControls()}
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {renderSudokuGrid()}
            {renderControls()}
          </div>
        )}
      </div>

      {/* Win Modal */}
      {renderModal(
        showWinModal,
        t.modals.win.title,
        <>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎉</div>
          <p style={{ color: '#718096', marginBottom: '20px' }}>{t.modals.win.message}</p>
          <p style={{ marginBottom: '10px' }}><strong>{t.modals.win.time}:</strong> {formatTime(timer)}</p>
          <p style={{ marginBottom: '20px' }}><strong>{t.modals.win.mistakes}:</strong> {mistakes}</p>
        </>,
        <>
          {difficulty !== 'pro' && (
            <button
              onClick={() => {
                const nextDiff = difficulty === 'medium' ? 'expert' : 'pro';
                if (nextDiff === 'pro' && !proUnlocked) {
                  alert(t.difficulties.locked);
                  return;
                }
                newGame(nextDiff);
              }}
              style={modalButtonPrimary}
            >
              {t.modals.win.tryHarderBtn}
            </button>
          )}
          <button onClick={() => newGame(difficulty)} style={modalButtonSecondary}>
            {t.modals.win.playAgainBtn}
          </button>
          {onQuit && (
            <button onClick={onQuit} style={modalButtonSecondary}>
              {t.modals.win.quitBtn}
            </button>
          )}
        </>
      )}

      {/* Game Over Modal */}
      {renderModal(
        showGameOverModal,
        t.modals.gameOver.title,
        <p style={{ color: '#718096', marginBottom: '20px' }}>
          {t.modals.gameOver.getMessage(difficultyRules[difficulty].maxMistakes)}
        </p>,
        <>
          <button onClick={() => newGame(difficulty)} style={modalButtonPrimary}>
            {t.modals.gameOver.tryAgainBtn}
          </button>
          {difficulty !== 'medium' && (
            <button
              onClick={() => newGame(difficulty === 'pro' ? 'expert' : 'medium')}
              style={modalButtonSecondary}
            >
              {t.modals.gameOver.tryEasierBtn}
            </button>
          )}
          {onQuit && (
            <button onClick={onQuit} style={modalButtonSecondary}>
              {t.modals.gameOver.quitBtn}
            </button>
          )}
        </>
      )}

      {/* Pause Modal */}
      {renderModal(
        showPauseModal,
        t.modals.pause.title,
        <>
          <p style={{ marginBottom: '10px' }}><strong>{t.modals.pause.time}:</strong> {formatTime(timer)}</p>
          <p style={{ marginBottom: '10px' }}><strong>{t.modals.pause.mistakes}:</strong> {mistakes}/{difficultyRules[difficulty].maxMistakes}</p>
          <p style={{ marginBottom: '20px' }}><strong>{t.modals.pause.difficulty}:</strong> {t.difficulties[difficulty]}</p>
        </>,
        <>
          <button
            onClick={() => {
              setIsPaused(false);
              setShowPauseModal(false);
            }}
            style={modalButtonPrimary}
          >
            {t.modals.pause.resumeBtn}
          </button>
          <button
            onClick={() => {
              if (confirm(t.modals.pause.confirmRestart)) {
                newGame(difficulty);
              }
            }}
            style={modalButtonSecondary}
          >
            {t.modals.pause.restartBtn}
          </button>
          {onQuit && (
            <button onClick={onQuit} style={modalButtonSecondary}>
              {t.modals.pause.quitBtn}
            </button>
          )}
        </>
      )}
    </div>
  );
}
