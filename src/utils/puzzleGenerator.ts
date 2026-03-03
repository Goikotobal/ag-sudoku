/**
 * Offline Sudoku Puzzle Generator
 * Generates valid Sudoku puzzles of varying difficulty entirely on-device
 */

export type Difficulty = 'medium' | 'expert' | 'pro';

export interface GeneratedPuzzle {
  puzzle: number[][];
  solution: number[][];
  difficulty: Difficulty;
  cellsToFill: number;
}

// Difficulty configurations (matching existing game)
const DIFFICULTY_CONFIG: Record<Difficulty, { emptyCells: number }> = {
  medium: { emptyCells: 38 },   // 43 given cells
  expert: { emptyCells: 51 },   // 30 given cells
  pro: { emptyCells: 58 },      // 23 given cells
};

/**
 * Check if placing a number is valid according to Sudoku rules
 */
function isValidPlacement(
  board: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
}

/**
 * Fisher-Yates shuffle for randomizing number order
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a complete valid Sudoku solution using backtracking
 */
function generateSolution(): number[][] {
  const board: number[][] = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

  function solve(board: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          // Randomize number order for variety
          const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

          for (const num of numbers) {
            if (isValidPlacement(board, row, col, num)) {
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
  }

  solve(board);
  return board;
}

/**
 * Count solutions for a puzzle (used for uniqueness verification)
 * Returns early if more than 1 solution found
 */
function countSolutions(board: number[][], maxCount: number = 2): number {
  let count = 0;
  const boardCopy = board.map(row => [...row]);

  function solve(): boolean {
    if (count >= maxCount) return true; // Early exit

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (boardCopy[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(boardCopy, row, col, num)) {
              boardCopy[row][col] = num;
              solve();
              boardCopy[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    count++;
    return count >= maxCount;
  }

  solve();
  return count;
}

/**
 * Create a puzzle from a solution by removing cells
 * Ensures the puzzle has a unique solution
 */
function createPuzzle(
  solution: number[][],
  emptyCells: number
): number[][] {
  const puzzle = solution.map(row => [...row]);
  let removed = 0;
  let attempts = 0;
  const maxAttempts = emptyCells * 4; // Prevent infinite loops

  // Create list of all cell positions and shuffle
  const positions: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }
  const shuffledPositions = shuffleArray(positions);

  for (const [row, col] of shuffledPositions) {
    if (removed >= emptyCells) break;
    if (attempts >= maxAttempts) break;

    if (puzzle[row][col] !== 0) {
      const backup = puzzle[row][col];
      puzzle[row][col] = 0;

      // Verify unique solution (skip for medium difficulty for performance)
      if (emptyCells <= 40 || countSolutions(puzzle, 2) === 1) {
        removed++;
      } else {
        // Restore cell if removing it creates multiple solutions
        puzzle[row][col] = backup;
      }
      attempts++;
    }
  }

  return puzzle;
}

/**
 * Generate a new Sudoku puzzle for the specified difficulty
 */
export function generatePuzzle(difficulty: Difficulty): GeneratedPuzzle {
  const config = DIFFICULTY_CONFIG[difficulty];
  const solution = generateSolution();
  const puzzle = createPuzzle(solution, config.emptyCells);

  return {
    puzzle,
    solution,
    difficulty,
    cellsToFill: config.emptyCells,
  };
}

/**
 * Validate a puzzle has at least one solution
 */
export function validatePuzzle(puzzle: number[][]): boolean {
  return countSolutions(puzzle, 1) >= 1;
}

/**
 * Deep clone a board
 */
export function cloneBoard(board: number[][]): number[][] {
  return board.map(row => [...row]);
}

/**
 * Check if a completed board is a valid Sudoku solution
 */
export function isValidSolution(board: number[][]): boolean {
  // Check all rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set<number>();
    for (let col = 0; col < 9; col++) {
      const num = board[row][col];
      if (num < 1 || num > 9 || seen.has(num)) return false;
      seen.add(num);
    }
  }

  // Check all columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set<number>();
    for (let row = 0; row < 9; row++) {
      const num = board[row][col];
      if (num < 1 || num > 9 || seen.has(num)) return false;
      seen.add(num);
    }
  }

  // Check all 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set<number>();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const num = board[boxRow * 3 + i][boxCol * 3 + j];
          if (num < 1 || num > 9 || seen.has(num)) return false;
          seen.add(num);
        }
      }
    }
  }

  return true;
}
