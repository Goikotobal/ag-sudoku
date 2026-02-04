'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSudokuTranslations } from '@/hooks/useSudokuTranslations'

interface AISudokuProps {
    onQuit?: () => void;
    initialDifficulty?: 'medium' | 'expert' | 'pro';
}

export default function AISudoku({ onQuit, initialDifficulty }: AISudokuProps) {
    // Translations
    const t = useSudokuTranslations()

    // Router for navigation
    const router = useRouter()
    const quitToHome = useCallback(() => {
        onQuit?.()
        router.push('/')
    }, [onQuit, router])

    const [board, setBoard] = useState<number[][]>([])
    const [solution, setSolution] = useState<number[][]>([])
    const [initialBoard, setInitialBoard] = useState<number[][]>([])
    const [selectedCell, setSelectedCell] = useState<{
        row: number
        col: number
    } | null>(null)
    const [mistakes, setMistakes] = useState(0)
    const [maxMistakes, setMaxMistakes] = useState(3)
    const [hintsRemaining, setHintsRemaining] = useState(3)
    const [timer, setTimer] = useState(0)
    const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty || "expert")
    const [showWinModal, setShowWinModal] = useState(false)
    const [showGameOverModal, setShowGameOverModal] = useState(false)
    const [moveHistory, setMoveHistory] = useState<any[]>([])
    const [notes, setNotes] = useState<Set<number>[][]>(
        Array(9)
            .fill(null)
            .map(() =>
                Array(9)
                    .fill(null)
                    .map(() => new Set<number>())
            )
    )
    const [notesMode, setNotesMode] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [isAISolving, setIsAISolving] = useState(false)
    const [completedNumber, setCompletedNumber] = useState<number | null>(null)
    const [completedRows, setCompletedRows] = useState<Set<number>>(new Set())
    const [completedCols, setCompletedCols] = useState<Set<number>>(new Set())
    const [completedBoxes, setCompletedBoxes] = useState<Set<number>>(new Set())
    const [isAutoFinishing, setIsAutoFinishing] = useState(false)
    const [canAutoFinish, setCanAutoFinish] = useState(false)
    const [recentlyPlacedCells, setRecentlyPlacedCells] = useState<Set<string>>(
        new Set()
    )
    const [hintExplanation, setHintExplanation] = useState<{
        cell: { row: number; col: number }
        value: number
        reason: string
        technique: string
        conflictingCells?: string[] // Cells that block other numbers
    } | null>(null)
    const [flashingCells, setFlashingCells] = useState<Set<string>>(new Set())
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
    const [isDesktop, setIsDesktop] = useState(false)
    const [showHintHighlights, setShowHintHighlights] = useState<{
        cell: { row: number; col: number }
        value: number
        conflictingCells: string[]
    } | null>(null)

    // PRO UNLOCK SYSTEM - Unlock Pro by beating Expert in under 15 minutes
    const [isProUnlocked, setIsProUnlocked] = useState(false)
    const [bestExpertTime, setBestExpertTime] = useState<number | null>(null)

    // WELCOME SCREEN - Show before game starts (skip if initialDifficulty provided)
    const [showWelcomeScreen, setShowWelcomeScreen] = useState(!initialDifficulty)
    const [welcomeDifficulty, setWelcomeDifficulty] = useState<'medium' | 'expert' | 'pro'>(initialDifficulty || "medium")

    // UPDATED: Only 3 difficulty levels - removed "hard"
    const difficulties = {
        medium: 38, // ~38 empty cells (41 given)
        expert: 51, // ~51 empty cells (30 given) - was "hard"
        pro: 58, // ~58 empty cells (23 given)
    }

    // UPDATED: 3 difficulty rules
    const difficultyRules = {
        medium: {
            maxMistakes: 3,
            hints: 3,
            aiSolve: true,
            undo: false,
            autoFinish: true,
        },
        expert: {
            maxMistakes: 1,
            hints: 1,
            aiSolve: false,
            undo: true,
            autoFinish: true,
        },
        pro: {
            maxMistakes: 1, // UPDATED: 1 mistake = game over! (was 0 = infinite)
            hints: 1, // UPDATED: 1 hint allowed! (was 0)
            aiSolve: false,
            undo: true,
            autoFinish: false,
        },
    }

    // Calculate remaining count
    const getRemainingCount = useCallback(
        (num: number) => {
            if (num === 0) return 0

            let count = 0
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row]?.[col] === num) {
                        count++
                    }
                }
            }
            return Math.max(0, 9 - count)
        },
        [board]
    )

    // Detect desktop screen size
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024) // TABLETS IN LANDSCAPE USE HORIZONTAL!
        }

        checkDesktop()
        window.addEventListener("resize", checkDesktop)
        return () => window.removeEventListener("resize", checkDesktop)
    }, [])

    // AUTO-SAVE: Load saved game on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("ag-sudoku-save")
            if (saved) {
                const state = JSON.parse(saved)
                const savedTime = state.timestamp || 0
                const now = Date.now()
                const hoursSince = (now - savedTime) / (1000 * 60 * 60)

                // Only restore if saved within last 24 hours
                if (hoursSince < 24) {
                    setBoard(state.board)
                    setSolution(state.solution)
                    setInitialBoard(state.initialBoard)
                    setTimer(state.timer)
                    setMistakes(state.mistakes)
                    setHintsRemaining(state.hintsRemaining)
                    setCurrentDifficulty(state.difficulty)

                    // Restore notes if they exist
                    if (state.notes) {
                        const restoredNotes = state.notes.map((row: any[]) =>
                            row.map((cell: number[]) => new Set(cell))
                        )
                        setNotes(restoredNotes)
                    }

                    // Skip welcome screen when restoring saved game
                    setShowWelcomeScreen(false)
                } else {
                    // Clear old save
                    localStorage.removeItem("ag-sudoku-save")
                }
            }
        } catch (error) {
            console.error("Failed to load saved game:", error)
            localStorage.removeItem("ag-sudoku-save")
        }
    }, [])

    // PRO UNLOCK: Force Pro mode to always be unlocked
    useEffect(() => {
        try {
            // FORCE UNLOCK: Always set Pro as unlocked
            localStorage.setItem("ag-sudoku-pro-unlocked", "true")
            setIsProUnlocked(true)

            // Load best time if exists
            const bestTime = localStorage.getItem("ag-sudoku-best-expert-time")
            if (bestTime) {
                setBestExpertTime(parseInt(bestTime))
            }
        } catch (error) {
            console.error("Failed to load Pro unlock status:", error)
        }
    }, [])

    // AUTO-SAVE: Save game state every 5 seconds
    useEffect(() => {
        // Don't save if game is complete or hasn't started
        if (showWinModal || showGameOverModal || board.length === 0) {
            return
        }

        const saveGame = () => {
            try {
                const gameState = {
                    board,
                    solution,
                    initialBoard,
                    timer,
                    mistakes,
                    hintsRemaining,
                    difficulty: currentDifficulty,
                    notes: notes.map((row) =>
                        row.map((cell) => Array.from(cell))
                    ),
                    timestamp: Date.now(),
                }
                localStorage.setItem(
                    "ag-sudoku-save",
                    JSON.stringify(gameState)
                )
            } catch (error) {
                console.error("Failed to auto-save:", error)
            }
        }

        // Save immediately
        saveGame()

        // Then save every 5 seconds
        const interval = setInterval(saveGame, 5000)

        return () => clearInterval(interval)
    }, [
        board,
        solution,
        initialBoard,
        timer,
        mistakes,
        hintsRemaining,
        currentDifficulty,
        notes,
        showWinModal,
        showGameOverModal,
    ])

    // AUTO-SAVE: Clear save when game completes or new game starts
    useEffect(() => {
        if (showWinModal || showGameOverModal) {
            localStorage.removeItem("ag-sudoku-save")
            console.log("Auto-save cleared (game complete)")
        }
    }, [showWinModal, showGameOverModal])

    // KEYBOARD SUPPORT - Simple approach
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input field
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                console.log("Keyboard: Ignored (typing in input field)")
                return
            }

            const key = e.key.toLowerCase()
            console.log("Keyboard pressed:", key)

            // Number keys 1-9
            if (/^[1-9]$/.test(key)) {
                e.preventDefault()
                const num = parseInt(key)
                const btn = document.querySelector(
                    `button[data-number="${num}"]`
                ) as HTMLButtonElement
                console.log(
                    "Looking for button:",
                    num,
                    "Found:",
                    btn,
                    "Disabled:",
                    btn?.disabled
                )
                if (btn && !btn.disabled) {
                    console.log("Clicking button:", num)
                    btn.click()
                }
            }
            // Delete/Backspace/0
            else if (key === "0" || key === "backspace" || key === "delete") {
                e.preventDefault()
                const btn = document.querySelector(
                    `button[data-number="0"]`
                ) as HTMLButtonElement
                console.log("Clear button found:", btn)
                if (btn) {
                    console.log("Clicking clear button")
                    btn.click()
                }
            }
        }

        console.log("Keyboard support initialized!")
        window.addEventListener("keydown", handleKeyDown)
        return () => {
            console.log("Keyboard support removed")
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    // SCREENSHOT BLOCKING FOR PRO MODE
    useEffect(() => {
        if (currentDifficulty !== "pro") return

        const blockScreenshot = (e: KeyboardEvent) => {
            // Block common screenshot combinations
            if (
                e.key === "PrintScreen" ||
                (e.metaKey &&
                    e.shiftKey &&
                    (e.key === "3" || e.key === "4" || e.key === "5")) || // Mac: Cmd+Shift+3/4/5
                (e.ctrlKey && e.key === "PrintScreen") || // Windows: Ctrl+PrtScn
                (e.altKey && e.key === "PrintScreen") // Windows: Alt+PrtScn
            ) {
                e.preventDefault()
                alert("Screenshots are disabled in Pro mode!")
                console.log("Screenshot attempt blocked in Pro mode")
                return false
            }
        }

        document.addEventListener("keyup", blockScreenshot as any)
        document.addEventListener("keydown", blockScreenshot as any)

        return () => {
            document.removeEventListener("keyup", blockScreenshot as any)
            document.removeEventListener("keydown", blockScreenshot as any)
        }
    }, [currentDifficulty])

    // Add CSS animation
    useEffect(() => {
        const style = document.createElement("style")
        style.textContent = `
            @keyframes logoShine {
                0%, 90% {
                    filter: drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4));
                    transform: scale(1);
                }
                95% {
                    filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))
                           drop-shadow(0 0 40px rgba(236, 72, 153, 0.6));
                    transform: scale(1.05);
                }
                100% {
                    filter: drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4));
                    transform: scale(1);
                }
            }
            @keyframes cellFill {
                0% { transform: scale(0.8); opacity: 0; }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes sparkle {
                0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
            }
            @keyframes lineFlash {
                0%, 100% { background: transparent; }
                50% { background: rgba(102, 126, 234, 0.3); }
            }
            @keyframes boxGlow {
                0%, 100% { box-shadow: 0 0 0 rgba(102, 126, 234, 0); }
                50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.6); }
            }
            @keyframes numberComplete {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); filter: brightness(1.5); }
                100% { transform: scale(1); }
            }
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(15px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes auroraGradient {
                0%, 100% {
                    background-position: 0% 50%;
                }
                50% {
                    background-position: 100% 50%;
                }
            }
            @keyframes flashRed {
                0%, 100% {
                    color: inherit;
                    background-color: transparent;
                }
                25%, 75% {
                    color: #ef4444;
                    background-color: rgba(239, 68, 68, 0.1);
                }
                50% {
                    color: #dc2626;
                    background-color: rgba(220, 38, 38, 0.15);
                }
            }
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
            @keyframes hintPulse {
                0%, 100% {
                    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
                }
                50% {
                    box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
                }
            }
        `
        document.head.appendChild(style)
        return () => {
            document.head.removeChild(style)
        }
    }, [])

    // Generate solution
    const generateSolution = useCallback(() => {
        const board = Array(9)
            .fill(0)
            .map(() => Array(9).fill(0))

        const isValid = (
            board: number[][],
            row: number,
            col: number,
            num: number
        ) => {
            for (let x = 0; x < 9; x++) {
                if (board[row][x] === num) return false
            }
            for (let x = 0; x < 9; x++) {
                if (board[x][col] === num) return false
            }
            const startRow = row - (row % 3)
            const startCol = col - (col % 3)
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i + startRow][j + startCol] === num) return false
                }
            }
            return true
        }

        const solve = (board: number[][]) => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === 0) {
                        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
                            () => Math.random() - 0.5
                        )
                        for (let num of numbers) {
                            if (isValid(board, row, col, num)) {
                                board[row][col] = num
                                if (solve(board)) return true
                                board[row][col] = 0
                            }
                        }
                        return false
                    }
                }
            }
            return true
        }

        solve(board)
        return board
    }, [])

    // Create puzzle
    const createPuzzle = useCallback(
        (solution: number[][], cellsToRemove: number) => {
            const puzzle = solution.map((row) => [...row])
            let removed = 0

            while (removed < cellsToRemove) {
                const row = Math.floor(Math.random() * 9)
                const col = Math.floor(Math.random() * 9)

                if (puzzle[row][col] !== 0) {
                    puzzle[row][col] = 0
                    removed++
                }
            }

            return puzzle
        },
        []
    )

    // Clear notes in affected cells
    const clearNotesAfterPlacement = useCallback(
        (row: number, col: number, num: number) => {
            const newNotes = notes.map((r, rIdx) =>
                r.map((cell, cIdx) => {
                    const newSet = new Set(cell)

                    // Clear notes in same row/col
                    if (rIdx === row || cIdx === col) {
                        newSet.delete(num)
                    }

                    // Clear notes in same 3x3 box
                    const sameBox =
                        Math.floor(rIdx / 3) === Math.floor(row / 3) &&
                        Math.floor(cIdx / 3) === Math.floor(col / 3)
                    if (sameBox) {
                        newSet.delete(num)
                    }

                    // Clear all notes in the cell where number was placed
                    if (rIdx === row && cIdx === col) {
                        newSet.clear()
                    }

                    return newSet
                })
            )
            setNotes(newNotes)
        },
        [notes]
    )

    // Check if a number is completed (all 9 placed correctly)
    const checkNumberCompletion = useCallback(
        (currentBoard: number[][], num: number) => {
            let count = 0
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (
                        currentBoard[r][c] === num &&
                        currentBoard[r][c] === solution[r][c]
                    ) {
                        count++
                    }
                }
            }
            return count === 9
        },
        [solution]
    )

    // Check if a row is completed
    const checkRowCompletion = useCallback(
        (currentBoard: number[][], row: number) => {
            for (let c = 0; c < 9; c++) {
                if (
                    currentBoard[row][c] === 0 ||
                    currentBoard[row][c] !== solution[row][c]
                ) {
                    return false
                }
            }
            return true
        },
        [solution]
    )

    // Check if a column is completed
    const checkColCompletion = useCallback(
        (currentBoard: number[][], col: number) => {
            for (let r = 0; r < 9; r++) {
                if (
                    currentBoard[r][col] === 0 ||
                    currentBoard[r][col] !== solution[r][col]
                ) {
                    return false
                }
            }
            return true
        },
        [solution]
    )

    // Check if a 3x3 box is completed
    const checkBoxCompletion = useCallback(
        (currentBoard: number[][], boxIndex: number) => {
            const startRow = Math.floor(boxIndex / 3) * 3
            const startCol = (boxIndex % 3) * 3
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    if (
                        currentBoard[r][c] === 0 ||
                        currentBoard[r][c] !== solution[r][c]
                    ) {
                        return false
                    }
                }
            }
            return true
        },
        [solution]
    )

    // Check all completions after a move
    const checkCompletions = useCallback(
        (
            currentBoard: number[][],
            lastNum: number,
            row: number,
            col: number
        ) => {
            // Check if number completed
            if (checkNumberCompletion(currentBoard, lastNum)) {
                setCompletedNumber(lastNum)
                setTimeout(() => setCompletedNumber(null), 1500)
            }

            // Check row
            if (checkRowCompletion(currentBoard, row)) {
                setCompletedRows((prev) => new Set([...prev, row]))
                setTimeout(() => {
                    setCompletedRows((prev) => {
                        const newSet = new Set(prev)
                        newSet.delete(row)
                        return newSet
                    })
                }, 1500)
            }

            // Check column
            if (checkColCompletion(currentBoard, col)) {
                setCompletedCols((prev) => new Set([...prev, col]))
                setTimeout(() => {
                    setCompletedCols((prev) => {
                        const newSet = new Set(prev)
                        newSet.delete(col)
                        return newSet
                    })
                }, 1500)
            }

            // Check box
            const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3)
            if (checkBoxCompletion(currentBoard, boxIndex)) {
                setCompletedBoxes((prev) => new Set([...prev, boxIndex]))
                setTimeout(() => {
                    setCompletedBoxes((prev) => {
                        const newSet = new Set(prev)
                        newSet.delete(boxIndex)
                        return newSet
                    })
                }, 1500)
            }
        },
        [
            checkNumberCompletion,
            checkRowCompletion,
            checkColCompletion,
            checkBoxCompletion,
        ]
    )

    // ENHANCED: Find best hint with explanation and visual highlights
    const findBestHintWithExplanation = useCallback(
        (currentBoard: number[][]) => {
            // Try to find a naked single (cell with only one valid option)
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (currentBoard[row][col] === 0) {
                        const validNumbers = []
                        const conflictingCells: string[] = []

                        for (let num = 1; num <= 9; num++) {
                            let isValid = true
                            const conflicts: string[] = []

                            // Check row
                            for (let c = 0; c < 9; c++) {
                                if (currentBoard[row][c] === num) {
                                    isValid = false
                                    conflicts.push(`${row}-${c}`)
                                }
                            }

                            // Check column
                            if (isValid) {
                                for (let r = 0; r < 9; r++) {
                                    if (currentBoard[r][col] === num) {
                                        isValid = false
                                        conflicts.push(`${r}-${col}`)
                                    }
                                }
                            }

                            // Check 3x3 box
                            if (isValid) {
                                const boxRow = Math.floor(row / 3) * 3
                                const boxCol = Math.floor(col / 3) * 3
                                for (let r = boxRow; r < boxRow + 3; r++) {
                                    for (let c = boxCol; c < boxCol + 3; c++) {
                                        if (currentBoard[r][c] === num) {
                                            isValid = false
                                            conflicts.push(`${r}-${c}`)
                                            break
                                        }
                                    }
                                    if (!isValid) break
                                }
                            }

                            if (isValid) {
                                validNumbers.push(num)
                            } else {
                                // Track all cells that block numbers
                                conflictingCells.push(...conflicts)
                            }
                        }

                        // Found a naked single!
                        if (validNumbers.length === 1) {
                            return {
                                cell: { row, col },
                                value: validNumbers[0],
                                technique: "Naked Single",
                                reason: `This cell can only be ${validNumbers[0]}. All other numbers (1-9) are already placed in this cell's row, column, or 3x3 box. Check the highlighted cells on the board!`,
                                conflictingCells: [
                                    ...new Set(conflictingCells),
                                ], // Remove duplicates
                            }
                        }
                    }
                }
            }

            // If no naked single found, find any valid move (hidden single)
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (currentBoard[row][col] === 0) {
                        const correctNum = solution[row][col]
                        return {
                            cell: { row, col },
                            value: correctNum,
                            technique: "Hidden Single",
                            reason: `Number ${correctNum} must go here. While this cell has multiple possible candidates, ${correctNum} can only be placed in this specific cell within its region.`,
                            conflictingCells: [],
                        }
                    }
                }
            }

            return null
        },
        [solution]
    )

    // Find cells with only one valid number (obvious moves)
    const findObviousMove = useCallback((currentBoard: number[][]) => {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentBoard[row][col] === 0) {
                    const validNumbers = []

                    for (let num = 1; num <= 9; num++) {
                        let isValid = true

                        for (let c = 0; c < 9; c++) {
                            if (currentBoard[row][c] === num) {
                                isValid = false
                                break
                            }
                        }

                        if (isValid) {
                            for (let r = 0; r < 9; r++) {
                                if (currentBoard[r][col] === num) {
                                    isValid = false
                                    break
                                }
                            }
                        }

                        if (isValid) {
                            const boxRow = Math.floor(row / 3) * 3
                            const boxCol = Math.floor(col / 3) * 3
                            for (let r = boxRow; r < boxRow + 3; r++) {
                                for (let c = boxCol; c < boxCol + 3; c++) {
                                    if (currentBoard[r][c] === num) {
                                        isValid = false
                                        break
                                    }
                                }
                                if (!isValid) break
                            }
                        }

                        if (isValid) {
                            validNumbers.push(num)
                        }
                    }

                    if (validNumbers.length === 1) {
                        return { row, col, num: validNumbers[0] }
                    }
                }
            }
        }
        return null
    }, [])

    // Count how many obvious moves exist
    const countObviousMoves = useCallback(
        (currentBoard: number[][]) => {
            let count = 0
            let tempBoard = currentBoard.map((row) => [...row])

            while (true) {
                const move = findObviousMove(tempBoard)
                if (!move) break
                tempBoard[move.row][move.col] = move.num
                count++
            }

            return count
        },
        [findObviousMove]
    )

    // Auto-finish puzzle
    const autoFinishPuzzle = useCallback(async () => {
        setIsAutoFinishing(true)
        setCanAutoFinish(false)

        let currentBoard = board.map((row) => [...row])

        let move = findObviousMove(currentBoard)
        while (move) {
            await new Promise((resolve) => setTimeout(resolve, 400))

            currentBoard[move.row][move.col] = move.num
            setBoard([...currentBoard.map((row) => [...row])])

            const cellKey = `${move.row}-${move.col}`
            setRecentlyPlacedCells((prev) => new Set([...prev, cellKey]))
            setTimeout(() => {
                setRecentlyPlacedCells((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(cellKey)
                    return newSet
                })
            }, 1000)

            clearNotesAfterPlacement(move.row, move.col, move.num)

            move = findObviousMove(currentBoard)
        }

        setIsAutoFinishing(false)

        const isComplete = currentBoard.every((row, rIdx) =>
            row.every((cell, cIdx) => cell === solution[rIdx][cIdx])
        )

        if (isComplete) {
            setShowWinModal(true)

            // PRO UNLOCK: Unlock Pro if Expert completed in under 15 minutes
            if (currentDifficulty === "expert" && timer < 900) {
                // 900 seconds = 15 minutes
                if (!isProUnlocked) {
                    setIsProUnlocked(true)
                    localStorage.setItem("ag-sudoku-pro-unlocked", "true")
                    console.log(
                        "PRO MODE UNLOCKED! Expert completed in",
                        Math.floor(timer / 60),
                        "minutes!"
                    )
                }

                // Update best Expert time
                if (!bestExpertTime || timer < bestExpertTime) {
                    setBestExpertTime(timer)
                    localStorage.setItem(
                        "ag-sudoku-best-expert-time",
                        timer.toString()
                    )
                }
            }
        }
    }, [board, findObviousMove, solution, clearNotesAfterPlacement])

    // Start new game
    const newGame = useCallback(() => {
        const newSolution = generateSolution()
        const newBoard = createPuzzle(
            newSolution,
            difficulties[currentDifficulty as keyof typeof difficulties]
        )

        setSolution(newSolution)
        setBoard(newBoard)
        setInitialBoard(newBoard.map((row) => [...row]))

        const rules = difficultyRules[currentDifficulty as keyof typeof difficultyRules]
        setMaxMistakes(rules.maxMistakes)
        setHintsRemaining(rules.hints)
        setMistakes(0)
        setMoveHistory([])
        setTimer(0)
        setShowWinModal(false)
        setShowGameOverModal(false)
        setSelectedCell(null)
        setIsAISolving(false)
        setIsAutoFinishing(false)
        setCanAutoFinish(false)
        setRecentlyPlacedCells(new Set())
        setHintExplanation(null)
        setShowHintHighlights(null) // Clear hint highlights
        setNotes(
            Array(9)
                .fill(null)
                .map(() =>
                    Array(9)
                        .fill(null)
                        .map(() => new Set<number>())
                )
        )

        // Clear auto-save when starting new game
        localStorage.removeItem("ag-sudoku-save")
        console.log("Auto-save cleared (new game)")
    }, [currentDifficulty, generateSolution, createPuzzle])

    // Timer effect
    useEffect(() => {
        if (
            showWinModal ||
            showGameOverModal ||
            isPaused ||
            isAISolving ||
            isAutoFinishing
        )
            return

        const interval = setInterval(() => {
            setTimer((t) => t + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [
        showWinModal,
        showGameOverModal,
        isPaused,
        isAISolving,
        isAutoFinishing,
    ])

    // Initialize game - only if no welcome screen (auto-restored game)
    useEffect(() => {
        // Only start new game if board is empty and welcome screen is hidden (restored game case)
        if (!showWelcomeScreen && board.length === 0) {
            newGame()
        }
    }, [showWelcomeScreen])

    // Trigger new game when difficulty changes (only if game already started)
    useEffect(() => {
        if (!showWelcomeScreen && board.length > 0) {
            newGame()
        }
    }, [currentDifficulty])

    // Handle Play Now button click
    const handlePlayNow = useCallback(() => {
        setCurrentDifficulty(welcomeDifficulty)
        setShowWelcomeScreen(false)
        newGame()
    }, [welcomeDifficulty, newGame])

    // Place number or note
    const placeNumber = useCallback(
        (num: number) => {
            if (!selectedCell || isAISolving) return

            const { row, col } = selectedCell
            if (initialBoard[row][col] !== 0) return

            // Notes mode - SMART NOTES: Only allow valid numbers
            if (notesMode && num !== 0) {
                // Check if number is valid for this cell
                let isValid = true
                const conflictingCells: string[] = []

                // Check row
                for (let c = 0; c < 9; c++) {
                    if (board[row][c] === num) {
                        isValid = false
                        conflictingCells.push(`${row}-${c}`)
                    }
                }

                // Check column
                for (let r = 0; r < 9; r++) {
                    if (board[r][col] === num) {
                        isValid = false
                        conflictingCells.push(`${r}-${col}`)
                    }
                }

                // Check 3x3 box
                const boxRow = Math.floor(row / 3) * 3
                const boxCol = Math.floor(col / 3) * 3
                for (let r = boxRow; r < boxRow + 3; r++) {
                    for (let c = boxCol; c < boxCol + 3; c++) {
                        if (board[r][c] === num) {
                            const cellKey = `${r}-${c}`
                            if (!conflictingCells.includes(cellKey)) {
                                isValid = false
                                conflictingCells.push(cellKey)
                            }
                        }
                    }
                }

                // If invalid, flash the conflicting cells
                if (!isValid && conflictingCells.length > 0) {
                    setFlashingCells(new Set(conflictingCells))
                    setTimeout(() => {
                        setFlashingCells(new Set())
                    }, 900) // 3 flashes x 300ms = 900ms
                    return
                }

                // Only toggle note if the number is valid
                if (isValid) {
                    const newNotes = notes.map((r, rIdx) =>
                        r.map((cell, cIdx) => {
                            if (rIdx === row && cIdx === col) {
                                const newSet = new Set(cell)
                                if (newSet.has(num)) {
                                    newSet.delete(num)
                                } else {
                                    newSet.add(num)
                                }
                                return newSet
                            }
                            return cell
                        })
                    )
                    setNotes(newNotes)
                }
                return
            }

            // Regular number placement
            const newBoard = board.map((r) => [...r])
            const oldValue = newBoard[row][col]

            // Special case: If clicking the same wrong number, remove it (toggle)
            if (
                num !== 0 &&
                oldValue === num &&
                oldValue !== solution[row][col]
            ) {
                newBoard[row][col] = 0
                setBoard(newBoard)
                setMoveHistory((prev) => [
                    ...prev,
                    { row, col, oldValue, newValue: 0 },
                ])
                return
            }

            // Special case: If clicking X (num === 0) on a wrong number, remove it
            if (
                num === 0 &&
                oldValue !== 0 &&
                oldValue !== solution[row][col]
            ) {
                newBoard[row][col] = 0
                setBoard(newBoard)
                setMoveHistory((prev) => [
                    ...prev,
                    { row, col, oldValue, newValue: 0 },
                ])
                return
            }

            setMoveHistory((prev) => [
                ...prev,
                { row, col, oldValue, newValue: num },
            ])

            newBoard[row][col] = num
            setBoard(newBoard)

            // Clear notes after placing number
            if (num !== 0) {
                clearNotesAfterPlacement(row, col, num)
            }

            // Check for mistakes
            if (num !== 0 && num !== solution[row][col]) {
                const newMistakes = mistakes + 1
                setMistakes(newMistakes)
                if (newMistakes >= maxMistakes && maxMistakes > 0) {
                    setTimeout(() => {
                        setShowGameOverModal(true)
                    }, 100)
                }
            } else if (num !== 0) {
                // Correct placement - check for completions
                checkCompletions(newBoard, num, row, col)

                // Color fade effect
                const cellKey = `${row}-${col}`
                setRecentlyPlacedCells((prev) => new Set([...prev, cellKey]))
                setTimeout(() => {
                    setRecentlyPlacedCells((prev) => {
                        const newSet = new Set(prev)
                        newSet.delete(cellKey)
                        return newSet
                    })
                }, 1000)

                // Check if auto-finish should be enabled (stricter conditions)
                const rules = difficultyRules[currentDifficulty as keyof typeof difficultyRules]
                if (rules.autoFinish) {
                    // Count empty cells
                    let emptyCells = 0
                    for (let r = 0; r < 9; r++) {
                        for (let c = 0; c < 9; c++) {
                            if (newBoard[r][c] === 0) emptyCells++
                        }
                    }

                    // Only offer auto-finish when 3-10 cells left AND all are obvious
                    if (emptyCells >= 3 && emptyCells <= 10) {
                        const obviousCount = countObviousMoves(newBoard)
                        if (obviousCount === emptyCells && obviousCount > 0) {
                            setCanAutoFinish(true)
                        } else {
                            setCanAutoFinish(false)
                        }
                    } else {
                        setCanAutoFinish(false)
                    }
                }
            }

            // Check win
            setTimeout(() => {
                let isComplete = true
                for (let r = 0; r < 9; r++) {
                    for (let c = 0; c < 9; c++) {
                        if (newBoard[r][c] !== solution[r][c]) {
                            isComplete = false
                            break
                        }
                    }
                    if (!isComplete) break
                }
                if (isComplete) {
                    setShowWinModal(true)
                }
            }, 100)
        },
        [
            selectedCell,
            board,
            solution,
            initialBoard,
            mistakes,
            maxMistakes,
            newGame,
            notesMode,
            notes,
            isAISolving,
            clearNotesAfterPlacement,
            checkCompletions,
            currentDifficulty,
            countObviousMoves,
        ]
    )

    // ENHANCED: Give hint with explanation
    const giveHint = useCallback(() => {
        const rules = difficultyRules[currentDifficulty as keyof typeof difficultyRules]
        if (rules.hints === 0 || hintsRemaining <= 0) return

        const hint = findBestHintWithExplanation(board)

        if (hint) {
            setHintExplanation(hint)
        }
    }, [board, hintsRemaining, currentDifficulty, findBestHintWithExplanation])

    // Apply hint from explanation modal
    const applyHint = useCallback(() => {
        if (!hintExplanation) return

        const { cell, value, conflictingCells } = hintExplanation
        const newBoard = board.map((r) => [...r])
        newBoard[cell.row][cell.col] = value
        setBoard(newBoard)
        setHintsRemaining((h) => h - 1)

        // Close modal first
        setHintExplanation(null)

        // THEN show visual highlights on clear board for 3 seconds
        setShowHintHighlights({
            cell,
            value,
            conflictingCells: conflictingCells || [],
        })

        // Clear notes after hint
        clearNotesAfterPlacement(cell.row, cell.col, value)

        // Highlight the cell briefly
        const cellKey = `${cell.row}-${cell.col}`
        setRecentlyPlacedCells((prev) => new Set([...prev, cellKey]))

        // Remove highlights after 3 seconds
        setTimeout(() => {
            setShowHintHighlights(null)
            setRecentlyPlacedCells((prev) => {
                const newSet = new Set(prev)
                newSet.delete(cellKey)
                return newSet
            })
        }, 3000) // 3 seconds to study the board
    }, [hintExplanation, board, clearNotesAfterPlacement])

    // AI Solve with Animation
    const solvePuzzle = useCallback(async () => {
        const rules = difficultyRules[currentDifficulty as keyof typeof difficultyRules]
        if (!rules.aiSolve) return

        // Only allow if hints are exhausted
        if (hintsRemaining > 0) {
            alert("AI Solve unlocks after you use all hints!")
            return
        }

        setIsAISolving(true)

        // Find all empty cells
        const emptyCells: { row: number; col: number }[] = []
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    emptyCells.push({ row, col })
                }
            }
        }

        // Solve one cell at a time
        for (let i = 0; i < emptyCells.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 2000))

            const cell = emptyCells[i]
            const newBoard = board.map((r) => [...r])
            newBoard[cell.row][cell.col] = solution[cell.row][cell.col]
            setBoard(newBoard)
        }

        setTimeout(() => {
            alert("AI Solved! Starting new game...")
            newGame()
        }, 1000)
    }, [solution, currentDifficulty, board, hintsRemaining, newGame])

    // Undo
    const undo = useCallback(() => {
        if (moveHistory.length === 0) return

        const lastMove = moveHistory[moveHistory.length - 1]
        const newBoard = board.map((r) => [...r])
        newBoard[lastMove.row][lastMove.col] = lastMove.oldValue
        setBoard(newBoard)
        setMoveHistory((prev) => prev.slice(0, -1))
    }, [moveHistory, board])

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0")
        const secs = (seconds % 60).toString().padStart(2, "0")
        return `${mins}:${secs}`
    }

    const rules = difficultyRules[currentDifficulty as keyof typeof difficultyRules]

    // RENDER COMPONENTS
    const renderHeader = () => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: isDesktop ? 8 : 6,
                width: "100%",
                marginBottom: isDesktop ? 6 : 4,
                padding: isDesktop ? "6px 0" : "4px 0",
            }}
        >
            {/* Left: Logo + Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                    src="https://i.imgur.com/yQMrFMl.png"
                    crossOrigin="anonymous"
                    alt="AG Logo"
                    style={{
                        height: isDesktop ? 36 : 28,
                        width: "auto",
                        objectFit: "contain",
                        filter: "drop-shadow(0 2px 8px rgba(168, 85, 247, 0.4))",
                    }}
                />
                <div>
                    <h1
                        style={{
                            fontSize: isDesktop ? "18px" : "16px",
                            margin: 0,
                            fontWeight: 700,
                        }}
                    >
                        <span style={{
                            background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            AG Sudoku
                        </span>
                    </h1>
                    <div
                        style={{
                            background: "linear-gradient(90deg, #064e3b 0%, #10b981 50%, #064e3b 100%)",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: 12,
                            fontSize: isDesktop ? "8px" : "7px",
                            fontWeight: 600,
                            display: "inline-block",
                            marginTop: 2,
                        }}
                    >
                        AI-Powered
                    </div>
                </div>
            </div>

            {/* Right: Profile Badge + Home Button */}
            <div style={{ display: "flex", alignItems: "center", gap: isDesktop ? 12 : 8 }}>
                {/* Profile Badge */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <div
                        style={{
                            width: isDesktop ? 42 : 36,
                            height: isDesktop ? 42 : 36,
                            borderRadius: 10,
                            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                            border: "2px dashed #d1d5db",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isDesktop ? 18 : 16,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        title="Profile (Coming Soon)"
                    >
                        👤
                    </div>
                    <div
                        style={{
                            fontSize: "8px",
                            fontWeight: 600,
                            color: "#64748b",
                            background: "#f1f5f9",
                            padding: "1px 5px",
                            borderRadius: 6,
                        }}
                    >
                        Lvl 1
                    </div>
                </div>

                {/* Home Button */}
                <button
                    onClick={quitToHome}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 10,
                        padding: isDesktop ? '8px 12px' : '6px 10px',
                        cursor: 'pointer',
                        color: '#dc2626',
                        fontSize: isDesktop ? 14 : 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                >
                    <span style={{ fontSize: isDesktop ? 14 : 12 }}>🏠</span>
                </button>
            </div>
        </div>
    )

    const renderStats = () => (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: isDesktop ? 4 : 2,
                width: "100%",
                marginBottom: isDesktop ? 4 : 2,
            }}
        >
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    padding: "4px 6px",
                    borderRadius: 8,
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        fontSize: "clamp(8px, 1.8vw, 9px)",
                        opacity: 0.9,
                    }}
                >
                    {t.stats.time}
                </div>
                <div
                    style={{
                        fontSize: "clamp(14px, 3.5vw, 18px)",
                        fontWeight: 700,
                        marginTop: 1,
                    }}
                >
                    {formatTime(timer)}
                </div>
            </div>
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    padding: "4px 6px",
                    borderRadius: 8,
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        fontSize: "clamp(8px, 1.8vw, 9px)",
                        opacity: 0.9,
                    }}
                >
                    {t.stats.mistakes}
                </div>
                <div
                    style={{
                        fontSize: "clamp(14px, 3.5vw, 18px)",
                        fontWeight: 700,
                        marginTop: 1,
                    }}
                >
                    {mistakes}/{maxMistakes || "∞"}
                </div>
            </div>
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    padding: "4px 6px",
                    borderRadius: 8,
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        fontSize: "clamp(8px, 1.8vw, 9px)",
                        opacity: 0.9,
                    }}
                >
                    {t.stats.hints}
                </div>
                <div
                    style={{
                        fontSize: "clamp(14px, 3.5vw, 18px)",
                        fontWeight: 700,
                        marginTop: 1,
                    }}
                >
                    {hintsRemaining}/{rules.hints || 0}
                </div>
            </div>
        </div>
    )

    const renderDifficultySelector = () => (
        <div
            style={{
                display: "flex",
                gap: isDesktop ? 3 : 1,
                background: "#f7fafc",
                padding: isDesktop ? 2 : 1,
                borderRadius: 8,
                width: "100%",
                marginBottom: isDesktop ? 4 : 2,
            }}
        >
            {(["medium", "expert", "pro"] as const).map((diff) => {
                const isProLocked = diff === "pro" && !isProUnlocked

                return (
                    <button
                        key={diff}
                        onClick={() => {
                            if (diff === "pro" && !isProUnlocked) {
                                alert(t.difficulties.locked)
                                return
                            }
                            setCurrentDifficulty(diff)
                        }}
                        disabled={isAISolving}
                        style={{
                            flex: 1,
                            padding: isDesktop ? "4px 6px" : "3px 4px",
                            border: "none",
                            background:
                                currentDifficulty === diff
                                    ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                                    : isProLocked
                                        ? "#e2e8f0"
                                        : "transparent",
                            borderRadius: 6,
                            cursor: isAISolving ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            fontSize: isDesktop ? "11px" : "10px",
                            color:
                                currentDifficulty === diff
                                    ? "white"
                                    : isProLocked
                                        ? "#94a3b8"
                                        : "#4a5568",
                            textTransform: "capitalize",
                            transition: "all 0.2s ease",
                            opacity: isAISolving ? 0.5 : 1,
                            minHeight: isDesktop ? "28px" : "24px",
                            touchAction: "manipulation",
                        }}
                    >
                        {diff === "pro" && !isProUnlocked && "🔒 "}
                        {t.difficulties[diff as keyof typeof t.difficulties]}
                    </button>
                )
            })}
        </div>
    )

    const renderSudokuGrid = () => (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(9, 1fr)",
                gap: 1,
                background: notesMode ? "#f3e8ff" : "#cbd5e0",
                border: notesMode ? "3px solid #a855f7" : "3px solid #2d3748",
                borderRadius: 0,
                overflow: "hidden",
                aspectRatio: "1 / 1",
                filter: isPaused ? "blur(8px)" : "none",
                pointerEvents: isPaused || isAISolving ? "none" : "auto",
                opacity: isPaused ? 0.5 : 1,
                transition: "all 0.3s ease",
                maxWidth: isDesktop ? "500px" : "none",
                width: isDesktop ? "500px" : "85vw",
                maxHeight: isDesktop ? "500px" : "85vw",
                margin: "0 auto",
                marginTop: isDesktop ? 2 : 0,
                marginBottom: isDesktop ? 4 : 6,
                boxSizing: "border-box",
            }}
        >
            {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                    const index = rowIndex * 9 + colIndex
                    const isSelected =
                        selectedCell?.row === rowIndex &&
                        selectedCell?.col === colIndex
                    const isGiven = initialBoard[rowIndex][colIndex] !== 0
                    const isError =
                        cell !== 0 &&
                        cell !== solution[rowIndex][colIndex] &&
                        !isGiven
                    const isSameNumber =
                        (selectedCell &&
                            cell !== 0 &&
                            cell ===
                            board[selectedCell.row][selectedCell.col]) ||
                        (selectedNumber !== null && cell === selectedNumber)
                    const isInSameRow = selectedCell?.row === rowIndex
                    const isInSameCol = selectedCell?.col === colIndex
                    const isInSameBox =
                        selectedCell &&
                        Math.floor(rowIndex / 3) ===
                        Math.floor(selectedCell.row / 3) &&
                        Math.floor(colIndex / 3) ===
                        Math.floor(selectedCell.col / 3)

                    const isCorrectNumber =
                        solution.length > 0 &&
                        cell !== 0 &&
                        cell === solution[rowIndex]?.[colIndex] &&
                        !isGiven

                    // Check if this cell is part of a completed element
                    const boxIndex =
                        Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3)
                    const isInCompletedRow = completedRows.has(rowIndex)
                    const isInCompletedCol = completedCols.has(colIndex)
                    const isInCompletedBox = completedBoxes.has(boxIndex)
                    const isCompletedNum =
                        cell !== 0 && completedNumber === cell

                    // Check if recently placed (for color fade)
                    const cellKey = `${rowIndex}-${colIndex}`
                    const isRecentlyPlaced = recentlyPlacedCells.has(cellKey)

                    // Check if this cell is flashing (conflict indicator)
                    const isFlashing = flashingCells.has(cellKey)

                    // HINT HIGHLIGHTING: Check if this is the hint cell or conflicts (AFTER applying hint)
                    const isHintCell =
                        showHintHighlights &&
                        showHintHighlights.cell.row === rowIndex &&
                        showHintHighlights.cell.col === colIndex
                    const isConflictCell =
                        showHintHighlights &&
                        showHintHighlights.conflictingCells?.includes(cellKey)

                    return (
                        <div
                            key={index}
                            onClick={() => {
                                setSelectedCell({
                                    row: rowIndex,
                                    col: colIndex,
                                })
                                // Set selected number to cell's value for note highlighting
                                if (cell !== 0) {
                                    setSelectedNumber(cell)
                                } else {
                                    setSelectedNumber(null)
                                }
                            }}
                            style={{
                                aspectRatio: "1",
                                overflow: "hidden",
                                background: isHintCell
                                    ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" // Yellow for hint cell
                                    : isConflictCell
                                        ? "rgba(239, 68, 68, 0.15)" // Light red for conflicts
                                        : isSelected
                                            ? notesMode
                                                ? "#e9d5ff"
                                                : "#e6fffa"
                                            : isSameNumber
                                                ? "#dbeafe"
                                                : isInSameRow ||
                                                    isInSameCol ||
                                                    isInSameBox
                                                    ? notesMode
                                                        ? "#faf5ff"
                                                        : "#f7fafc"
                                                    : isGiven
                                                        ? notesMode
                                                            ? "#faf5ff"
                                                            : "#f7fafc"
                                                        : isError
                                                            ? "#fff5f5"
                                                            : notesMode
                                                                ? "#fefaff"
                                                                : "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: isDesktop
                                    ? 28
                                    : "clamp(18px, 5vw, 28px)", // BIGGER NUMBERS!
                                fontWeight: 700,
                                cursor: "pointer",
                                color: isGiven
                                    ? "#2d3748"
                                    : isError
                                        ? "#e53e3e"
                                        : isRecentlyPlaced && isCorrectNumber
                                            ? "#10b981"
                                            : isCorrectNumber
                                                ? "#2d3748"
                                                : notesMode
                                                    ? "#a855f7"
                                                    : "#667eea",
                                borderRight:
                                    colIndex === 2 || colIndex === 5
                                        ? "2px solid #2d3748"
                                        : "none",
                                borderBottom:
                                    rowIndex === 2 || rowIndex === 5
                                        ? "2px solid #2d3748"
                                        : "none",
                                outline: isHintCell
                                    ? "4px solid #f59e0b"
                                    : isSelected
                                        ? notesMode
                                            ? "3px solid #a855f7"
                                            : "3px solid #10b981"
                                        : "none",
                                outlineOffset: "-3px",
                                boxSizing: "border-box",
                                transition:
                                    "color 1s ease, background 0.3s ease",
                                position: "relative",
                                animation: isFlashing
                                    ? "flashRed 0.3s ease-in-out 3"
                                    : isHintCell
                                        ? "hintPulse 1.5s ease-in-out infinite"
                                        : isInCompletedRow || isInCompletedCol
                                            ? "lineFlash 1.5s ease-in-out"
                                            : isInCompletedBox
                                                ? "boxGlow 1.5s ease-in-out"
                                                : isCompletedNum
                                                    ? "numberComplete 0.6s ease-in-out"
                                                    : "none",
                                touchAction: "manipulation", // PREVENT ZOOM!
                                WebkitTapHighlightColor: "transparent", // NO TAP HIGHLIGHT!
                            }}
                        >
                            {cell ? (
                                <span
                                    style={{
                                        animation: isCompletedNum
                                            ? "sparkle 0.6s ease-in-out"
                                            : "none",
                                    }}
                                >
                                    {cell}
                                </span>
                            ) : notes[rowIndex][colIndex].size > 0 ? (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gridTemplateRows: "repeat(3, 1fr)",
                                        gap: "0px",
                                        width: "100%",
                                        height: "100%",
                                        padding: "2px",
                                        overflow: "hidden",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                                        const hasNote =
                                            notes[rowIndex][colIndex].has(n)
                                        const isHighlighted =
                                            selectedNumber === n

                                        return (
                                            <div
                                                key={n}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "10px",
                                                    fontWeight: 600,
                                                    color: hasNote
                                                        ? isHighlighted
                                                            ? "#ffffff"
                                                            : "#2d3748"
                                                        : "transparent",
                                                    lineHeight: 1,
                                                    background:
                                                        hasNote && isHighlighted
                                                            ? "#7c3aed"
                                                            : "transparent",
                                                    border:
                                                        hasNote && isHighlighted
                                                            ? "1px solid #6d28d9"
                                                            : "none",
                                                    borderRadius: "3px",
                                                    margin: "1px",
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                {hasNote ? n : ""}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                ""
                            )}
                        </div>
                    )
                })
            )}
        </div>
    )

    const renderControls = () => (
        <>
            {/* AI Solving Indicator */}
            {isAISolving && (
                <div
                    style={{
                        background: "#10b981",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: 10,
                        marginBottom: 10,
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: 13,
                        animation: "pulse 1.5s ease-in-out infinite",
                    }}
                >
                    {t.messages.aiSolving}
                </div>
            )}
            {/* Slide-in Auto-Finish Button */}
            {canAutoFinish && !isAutoFinishing && (
                <div
                    style={{
                        marginBottom: 12,
                        animation:
                            "slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        overflow: "hidden",
                    }}
                >
                    <button
                        onClick={autoFinishPuzzle}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "none",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            background:
                                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                            color: "white",
                            boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            transition: "all 0.2s ease",
                        }}
                    >
                        {t.messages.autoFinish}
                    </button>
                </div>
            )}
            {/* Number Controls */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: isDesktop ? 4 : 1.5, // TIGHTER!
                    marginBottom: isDesktop ? 4 : 3, // SPACE TO CONTROL BUTTONS!
                    opacity: isPaused || isAISolving ? 0.5 : 1,
                    pointerEvents: isPaused || isAISolving ? "none" : "auto",
                    transition: "opacity 0.3s ease",
                    maxWidth: isDesktop ? "100%" : "none",
                    width: isDesktop ? "100%" : "92vw", // MATCH BOARD!
                    margin: "0 auto",
                }}
            >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => {
                    const remaining = getRemainingCount(num)
                    const isComplete = num !== 0 && remaining === 0

                    return (
                        <button
                            key={num}
                            data-number={num}
                            onClick={() => {
                                setSelectedNumber(num === 0 ? null : num)
                                placeNumber(num)
                            }}
                            disabled={isComplete}
                            style={{
                                padding: isDesktop ? "6px 4px" : "3px 1px", // MUCH SMALLER!
                                border: "2px solid #e2e8f0",
                                background: isComplete ? "#f7fafc" : "white",
                                borderRadius: 6,
                                cursor: isComplete ? "not-allowed" : "pointer",
                                fontSize: isDesktop
                                    ? "22px"
                                    : "clamp(18px, 4vw, 22px)", // BIGGER!
                                fontWeight: 700,
                                color: isComplete ? "#cbd5e0" : "#2d3748",
                                transition: "all 0.15s ease",
                                opacity: isComplete ? 0.5 : 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 1,
                                minHeight: isDesktop ? "50px" : "40px", // TALLER FOR BIG NUMBERS!
                                touchAction: "manipulation",
                                WebkitTapHighlightColor: "transparent",
                            }}
                        >
                            <span>{num === 0 ? "X" : num}</span>
                            {num !== 0 && (
                                <span
                                    style={{
                                        fontSize: isDesktop
                                            ? "12px"
                                            : "clamp(10px, 2.2vw, 12px)", // READABLE!
                                        fontWeight: 600, // BOLDER!
                                        color:
                                            remaining === 0
                                                ? "#cbd5e0"
                                                : "#94a3b8",
                                    }}
                                >
                                    {remaining}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
            {/* BIGGER GAP to show aurora background on mobile/tablet */}
            <div style={{ marginBottom: isDesktop ? 6 : 15 }} />{" "}
            {/* MOBILE: 15px gap to show aurora (more compact) */}
            {/* Bottom row: Notes + Pause + Hint + New Game - 4 BUTTONS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: isDesktop ? 4 : 2,
                    maxWidth: isDesktop ? "100%" : "none",
                    width: isDesktop ? "100%" : "92vw", // MATCH BOARD!
                    margin: "0 auto",
                }}
            >
                {/* Notes Button */}
                <button
                    onClick={() => setNotesMode(!notesMode)}
                    disabled={isAISolving}
                    style={{
                        padding: isDesktop ? "8px 6px" : "6px 4px", // SMALLER!
                        border: "2px solid #e2e8f0",
                        background: notesMode
                            ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                            : "white",
                        borderRadius: 8,
                        cursor: isAISolving ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: isDesktop
                            ? "12px"
                            : "clamp(9px, 2.2vw, 11px)", // SMALLER!
                        color: notesMode ? "white" : "#4a5568",
                        opacity: isAISolving ? 0.5 : 1,
                        touchAction: "manipulation",
                        minHeight: isDesktop ? "42px" : "36px", // SHORTER!
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}
                >
                    <span style={{ fontSize: isDesktop ? "16px" : "14px" }}>
                        ✏️
                    </span>{" "}
                    {/* SMALLER ICON! */}
                    <span
                        style={{
                            fontSize: isDesktop
                                ? "9px"
                                : "clamp(7px, 1.8vw, 8px)",
                        }}
                    >
                        {t.controls.notes}
                    </span>
                </button>

                {/* Pause Button */}
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    disabled={isAISolving}
                    style={{
                        padding: isDesktop ? "8px 6px" : "6px 4px", // BIGGER!
                        border: "2px solid rgba(168, 85, 247, 0.3)",
                        background: isPaused
                            ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                            : "white",
                        color: isPaused ? "white" : "#a855f7",
                        borderRadius: 8,
                        cursor: isAISolving ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: isDesktop
                            ? "12px"
                            : "clamp(9px, 2.2vw, 11px)", // BIGGER!
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        opacity: isAISolving ? 0.5 : 1,
                        minHeight: isDesktop ? "42px" : "36px", // TALLER!
                        touchAction: "manipulation",
                    }}
                >
                    <span style={{ fontSize: isDesktop ? "16px" : "14px" }}>
                        {isPaused ? "▶️" : "⏸️"}
                    </span>
                    <span
                        style={{
                            fontSize: isDesktop
                                ? "9px"
                                : "clamp(7px, 1.8vw, 8px)",
                        }}
                    >
                        {" "}
                        {/* BIGGER! */}
                        {isPaused ? t.controls.resume : t.controls.pause}
                    </span>
                </button>

                {/* Hint Button */}
                <button
                    onClick={giveHint}
                    disabled={
                        rules.hints === 0 || hintsRemaining === 0 || isAISolving
                    }
                    style={{
                        padding: isDesktop ? "8px 6px" : "6px 4px", // BIGGER!
                        border: "none",
                        borderRadius: 8,
                        cursor:
                            rules.hints === 0 ||
                                hintsRemaining === 0 ||
                                isAISolving
                                ? "not-allowed"
                                : "pointer",
                        fontWeight: 600,
                        fontSize: isDesktop
                            ? "12px"
                            : "clamp(9px, 2.2vw, 11px)", // BIGGER!
                        background:
                            "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                        color: "white",
                        opacity:
                            rules.hints === 0 ||
                                hintsRemaining === 0 ||
                                isAISolving
                                ? 0.3
                                : 1,
                        touchAction: "manipulation",
                        minHeight: isDesktop ? "42px" : "36px", // TALLER!
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                    }}
                >
                    <span style={{ fontSize: isDesktop ? "16px" : "14px" }}>
                        💡
                    </span>
                    <span
                        style={{
                            fontSize: isDesktop
                                ? "9px"
                                : "clamp(7px, 1.8vw, 8px)",
                        }}
                    >
                        {" "}
                        {/* BIGGER! */}
                        {rules.hints === 0
                            ? t.controls.none
                            : hintsRemaining === 0
                                ? t.controls.none
                                : t.controls.hint}
                    </span>
                </button>

                {/* New Game Button */}
                <button
                    onClick={newGame}
                    disabled={isAISolving}
                    style={{
                        padding: isDesktop ? "8px 6px" : "6px 4px", // BIGGER!
                        border: "2px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: isAISolving ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: isDesktop
                            ? "12px"
                            : "clamp(9px, 2.2vw, 11px)", // BIGGER!
                        background: "white",
                        color: "#4a5568",
                        opacity: isAISolving ? 0.5 : 1,
                        touchAction: "manipulation",
                        minHeight: isDesktop ? "42px" : "36px", // TALLER!
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                    }}
                >
                    <span style={{ fontSize: isDesktop ? "16px" : "14px" }}>
                        🎮
                    </span>
                    <span
                        style={{
                            fontSize: isDesktop
                                ? "9px"
                                : "clamp(7px, 1.8vw, 8px)",
                        }}
                    >
                        {t.controls.new}
                    </span>{" "}
                    {/* BIGGER! */}
                </button>
            </div>
        </>
    )

    return (
        <div
            style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                backgroundImage: "url(/images/Frame1.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "100%",
                height: "100vh",
                overflow: "auto", // ALLOW SCROLLING - FRAMER FIX!
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: isDesktop ? "center" : "flex-start", // CENTER ON DESKTOP!
                padding: isDesktop ? "0.5rem" : "0",
                paddingTop: isDesktop
                    ? "0.3rem"
                    : "max(4px, env(safe-area-inset-top))",
                paddingBottom: isDesktop
                    ? "1rem"
                    : "max(4px, env(safe-area-inset-bottom))",
                paddingLeft: isDesktop ? "0.5rem" : "0", // NO MOBILE PADDING!
                paddingRight: isDesktop ? "0.5rem" : "0", // NO MOBILE PADDING!
                boxSizing: "border-box",
                position: "relative",
                touchAction: "manipulation", // PREVENT ZOOM ON TAP!
                WebkitTapHighlightColor: "transparent", // NO TAP HIGHLIGHT!
            }}
        >
            {/* Aurora Background Animation */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: "none",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: isDesktop ? "60%" : "50%", // Shifted down on desktop
                        left: "50%",
                        width: "200%",
                        height: "200%",
                        background:
                            "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
                        animation: "aurora1 20s ease-in-out infinite",
                        filter: "blur(60px)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: isDesktop ? "60%" : "50%", // Shifted down on desktop
                        left: "50%",
                        width: "180%",
                        height: "180%",
                        background:
                            "radial-gradient(ellipse at center, rgba(5, 150, 105, 0.12) 0%, transparent 70%)",
                        animation: "aurora2 25s ease-in-out infinite",
                        filter: "blur(70px)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: isDesktop ? "60%" : "50%", // Shifted down on desktop
                        left: "50%",
                        width: "220%",
                        height: "220%",
                        background:
                            "radial-gradient(ellipse at center, rgba(168, 85, 247, 0.08) 0%, transparent 70%)",
                        animation: "aurora3 30s ease-in-out infinite",
                        filter: "blur(80px)",
                    }}
                />
            </div>

            {/* WELCOME SCREEN - Glassmorphism Design */}
            {showWelcomeScreen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                }}>
                    {/* Modal with glassmorphism */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        borderRadius: isDesktop ? '32px' : '24px',
                        padding: isDesktop ? '48px 40px' : '32px 24px',
                        maxWidth: '520px',
                        width: '90%',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 80px rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                    }}>
                        {/* Logo */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '24px',
                        }}>
                            <img
                                src="/images/ag-logo-trans.png"
                                alt="AG Logo"
                                style={{
                                    width: isDesktop ? '110px' : '90px',
                                    height: isDesktop ? '110px' : '90px',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))',
                                }}
                            />
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontSize: isDesktop ? '48px' : '38px',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textAlign: 'center',
                            letterSpacing: '-1px',
                            margin: 0,
                            marginBottom: '16px',
                            filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.5))',
                        }}>
                            AG Sudoku
                        </h1>

                        {/* AI Badge */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '28px',
                        }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(16, 185, 129, 0.18)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                color: '#ffffff',
                                padding: '8px 20px',
                                borderRadius: '24px',
                                fontSize: '14px',
                                fontWeight: '700',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                            }}>
                                <span style={{ fontSize: '16px' }}>✨</span>
                                <span>AI-Powered</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p style={{
                            color: '#ffffff',
                            fontSize: isDesktop ? '17px' : '15px',
                            lineHeight: '1.6',
                            textAlign: 'center',
                            textShadow: '0 2px 12px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.8)',
                            fontWeight: '500',
                            margin: 0,
                            marginBottom: '32px',
                        }}>
                            Challenge your mind with our AI-enhanced Sudoku puzzle game.
                            Get smart hints that teach you solving techniques!
                        </p>

                        {/* Features Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                            gap: '12px',
                            marginBottom: '32px',
                        }}>
                            {[
                                'AI-powered hints that teach solving techniques',
                                '3 difficulty levels: Medium, Expert, Pro',
                                'Works offline - play anywhere',
                                'Auto-save your progress',
                                'Smart notes system',
                                'Track your best times',
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        padding: '12px 14px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '12px',
                                        fontSize: isDesktop ? '13px' : '12px',
                                        color: '#ffffff',
                                        textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                                        fontWeight: '500',
                                    }}
                                >
                                    <span style={{
                                        color: '#10b981',
                                        fontSize: '16px',
                                        flexShrink: 0,
                                        filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.6))',
                                    }}>✓</span>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Difficulty Selector */}
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '20px',
                        }}>
                            {(['medium', 'expert', 'pro'] as const).map((diffKey) => {
                                const diff = diffKey.charAt(0).toUpperCase() + diffKey.slice(1)
                                const isSelected = welcomeDifficulty === diffKey
                                return (
                                    <button
                                        key={diff}
                                        onClick={() => setWelcomeDifficulty(diffKey)}
                                        style={{
                                            flex: 1,
                                            padding: '14px 12px',
                                            background: isSelected
                                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                : 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)',
                                            color: '#ffffff',
                                            border: isSelected
                                                ? '1px solid rgba(255, 255, 255, 0.3)'
                                                : '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: isSelected
                                                ? '0 4px 16px rgba(16, 185, 129, 0.4)'
                                                : '0 2px 8px rgba(0, 0, 0, 0.15)',
                                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
                                                e.currentTarget.style.transform = 'translateY(-1px)'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                                                e.currentTarget.style.transform = 'translateY(0)'
                                            }
                                        }}
                                    >
                                        {diff}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Play Now Button */}
                        <button
                            onClick={handlePlayNow}
                            style={{
                                width: '100%',
                                padding: '18px 28px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '20px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                        >
                            Play Now
                        </button>

                        {/* Back to Home Button */}
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                color: '#ffffff',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                                e.currentTarget.style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            ← Back to Home
                        </button>

                        {/* Difficulty Info */}
                        <div style={{
                            marginTop: '20px',
                            padding: '12px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '10px',
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.85)',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#10b981',
                                boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                            }}></span>
                            <span>
                                <strong>{welcomeDifficulty === 'medium' ? 'Medium' : welcomeDifficulty === 'expert' ? 'Expert' : 'Pro'}:</strong>
                                {' '}
                                {welcomeDifficulty === 'medium' && '3 mistakes allowed, 3 hints, AI solve available'}
                                {welcomeDifficulty === 'expert' && '1 mistake allowed, 1 hint'}
                                {welcomeDifficulty === 'pro' && '1 mistake = game over, 1 hint only'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* RESPONSIVE LAYOUT: Desktop vs Mobile */}
            {!showWelcomeScreen && (
            <div style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: isDesktop ? "900px" : "100%",
                margin: "0 auto",
                padding: isDesktop ? "0 16px" : "0 4px",
            }}>
                {renderHeader()}
                {renderStats()}
                {renderDifficultySelector()}

                {isDesktop ? (
                    // DESKTOP/LANDSCAPE: Horizontal layout (board left, controls right)
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "1.5rem",
                            maxWidth: "100%",
                            margin: "0 auto",
                            padding: "0.5rem",
                        }}
                    >
                        {/* LEFT: Game Board */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                flex: "0 0 auto", // Don't grow/shrink
                            }}
                        >
                            {renderSudokuGrid()}
                        </div>

                        {/* RIGHT: Controls */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                                width: "350px", // Fixed width
                                flex: "0 0 auto", // Don't grow/shrink
                            }}
                        >
                            {renderControls()}
                        </div>
                    </div>
                ) : (
                    // MOBILE/PORTRAIT: Vertical layout - FRAMER FIX: Allow scrolling!
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "0",
                            paddingBottom: "20px", // Space at bottom for scrolling
                        }}
                    >
                        {renderSudokuGrid()}
                        {renderControls()}
                    </div>
                )}
            </div>
            )}

            {/* HINT EXPLANATION MODAL - Comprehensive Educational Design */}
            {hintExplanation && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: isDesktop ? 20 : 10,
                    }}
                    onClick={() => setHintExplanation(null)}
                >
                    <div
                        style={{
                            background: "white",
                            borderRadius: 16,
                            width: isDesktop ? "min(580px, 95vw)" : "95vw",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            padding: isDesktop ? "20px 24px 16px" : "16px 16px 12px",
                            borderBottom: "1px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: isDesktop ? 28 : 24 }}>💡</span>
                                <h2 style={{
                                    fontSize: isDesktop ? 22 : 18,
                                    fontWeight: 700,
                                    background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    margin: 0,
                                }}>
                                    {t.modals.hint.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setHintExplanation(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: 22,
                                    cursor: "pointer",
                                    color: "#9ca3af",
                                    padding: 4,
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Target Number Display */}
                        <div style={{
                            margin: isDesktop ? "20px 24px" : "16px",
                            padding: isDesktop ? "20px" : "16px",
                            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                            borderRadius: 12,
                            border: "3px solid #f59e0b",
                            display: "flex",
                            alignItems: "center",
                            gap: isDesktop ? 20 : 14,
                        }}>
                            <div style={{
                                width: isDesktop ? 72 : 56,
                                height: isDesktop ? 72 : 56,
                                background: "white",
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: isDesktop ? 42 : 32,
                                fontWeight: 800,
                                color: "#92400e",
                                border: "3px solid #f59e0b",
                                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                                flexShrink: 0,
                            }}>
                                {hintExplanation.value}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: isDesktop ? 11 : 10,
                                    color: "#92400e",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: 4,
                                }}>
                                    {t.modals.hint.placeHere}
                                </div>
                                <div style={{
                                    fontSize: isDesktop ? 18 : 15,
                                    fontWeight: 700,
                                    color: "#78350f",
                                    marginBottom: 8,
                                }}>
                                    {t.modals.hint.getRowCol(hintExplanation.cell.row + 1, hintExplanation.cell.col + 1)}
                                </div>
                                <div style={{
                                    display: "inline-block",
                                    padding: "4px 12px",
                                    background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                    color: "white",
                                    borderRadius: 16,
                                    fontSize: isDesktop ? 12 : 10,
                                    fontWeight: 600,
                                }}>
                                    {hintExplanation.technique}
                                </div>
                            </div>
                        </div>

                        {/* Full 9x9 Visual Guide */}
                        <div style={{ padding: isDesktop ? "0 24px 20px" : "0 16px 16px" }}>
                            <h3 style={{
                                fontSize: isDesktop ? 13 : 11,
                                fontWeight: 600,
                                color: "#6b7280",
                                textTransform: "uppercase",
                                marginBottom: 12,
                                letterSpacing: "0.5px",
                            }}>
                                {t.modals.hint.visualTitle}
                            </h3>

                            {/* 9x9 Grid */}
                            <div style={{
                                width: isDesktop ? 324 : "min(280px, 85vw)",
                                height: isDesktop ? 324 : "min(280px, 85vw)",
                                margin: "0 auto 14px",
                                display: "grid",
                                gridTemplateColumns: "repeat(9, 1fr)",
                                gridTemplateRows: "repeat(9, 1fr)",
                                border: "2px solid #374151",
                                borderRadius: 4,
                                overflow: "hidden",
                            }}>
                                {board.map((rowData, rowIdx) =>
                                    rowData.map((cellValue, colIdx) => {
                                        const isTarget = rowIdx === hintExplanation.cell.row && colIdx === hintExplanation.cell.col
                                        const isInRow = rowIdx === hintExplanation.cell.row
                                        const isInCol = colIdx === hintExplanation.cell.col
                                        const isInBox = Math.floor(rowIdx / 3) === Math.floor(hintExplanation.cell.row / 3) &&
                                                       Math.floor(colIdx / 3) === Math.floor(hintExplanation.cell.col / 3)
                                        const isRelated = (isInRow || isInCol || isInBox) && !isTarget
                                        const isConflict = hintExplanation.conflictingCells?.includes(`${rowIdx}-${colIdx}`)
                                        const hasValue = cellValue !== 0
                                        const isGiven = initialBoard[rowIdx]?.[colIdx] !== 0

                                        // Determine cell styling
                                        let bgColor = "#ffffff"
                                        let textColor = "#1f2937"

                                        if (isTarget) {
                                            bgColor = "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                                            textColor = "#92400e"
                                        } else if (isConflict) {
                                            bgColor = "#fee2e2"
                                            textColor = "#dc2626"
                                        } else if (isRelated && hasValue) {
                                            bgColor = "#dbeafe"
                                            textColor = "#1e40af"
                                        } else if (isRelated) {
                                            bgColor = "#f0f9ff"
                                        }

                                        // Section borders
                                        const borderRight = colIdx % 3 === 2 && colIdx !== 8 ? "2px solid #374151" : "1px solid #d1d5db"
                                        const borderBottom = rowIdx % 3 === 2 && rowIdx !== 8 ? "2px solid #374151" : "1px solid #d1d5db"

                                        return (
                                            <div
                                                key={`${rowIdx}-${colIdx}`}
                                                style={{
                                                    background: bgColor,
                                                    borderRight,
                                                    borderBottom,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: isDesktop ? 16 : 13,
                                                    fontWeight: hasValue ? (isGiven ? 700 : 600) : 400,
                                                    color: textColor,
                                                    position: "relative",
                                                }}
                                            >
                                                {isTarget ? (
                                                    <span style={{
                                                        fontWeight: 800,
                                                        fontSize: isDesktop ? 20 : 16,
                                                        color: "#92400e",
                                                    }}>
                                                        {hintExplanation.value}
                                                    </span>
                                                ) : hasValue ? (
                                                    cellValue
                                                ) : null}
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Legend */}
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                flexWrap: "wrap",
                                gap: isDesktop ? 20 : 12,
                                fontSize: isDesktop ? 12 : 10,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <div style={{
                                        width: isDesktop ? 22 : 18,
                                        height: isDesktop ? 22 : 18,
                                        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                        border: "2px solid #f59e0b",
                                        borderRadius: 3,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        fontSize: isDesktop ? 12 : 10,
                                        color: "#92400e",
                                    }}>
                                        {hintExplanation.value}
                                    </div>
                                    <span style={{ color: "#4b5563", fontWeight: 500 }}>{t.modals.hint.legend.target}</span>
                                </div>

                                {hintExplanation.conflictingCells && hintExplanation.conflictingCells.length > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <div style={{
                                            width: isDesktop ? 22 : 18,
                                            height: isDesktop ? 22 : 18,
                                            background: "#fee2e2",
                                            border: "2px solid #ef4444",
                                            borderRadius: 3,
                                        }}></div>
                                        <span style={{ color: "#4b5563", fontWeight: 500 }}>{t.modals.hint.legend.conflicts}</span>
                                    </div>
                                )}

                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <div style={{
                                        width: isDesktop ? 22 : 18,
                                        height: isDesktop ? 22 : 18,
                                        background: "#dbeafe",
                                        border: "1px solid #3b82f6",
                                        borderRadius: 3,
                                    }}></div>
                                    <span style={{ color: "#4b5563", fontWeight: 500 }}>{t.modals.hint.legend.related}</span>
                                </div>
                            </div>
                        </div>

                        {/* Step-by-Step Logic */}
                        <div style={{
                            padding: isDesktop ? "16px 24px 20px" : "12px 16px 16px",
                            background: "#f9fafb",
                        }}>
                            <h3 style={{
                                fontSize: isDesktop ? 14 : 12,
                                fontWeight: 600,
                                color: "#1f2937",
                                marginBottom: 12,
                            }}>
                                {t.modals.hint.logicTitle}
                            </h3>

                            <div style={{
                                background: "white",
                                padding: isDesktop ? 16 : 12,
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                            }}>
                                <div style={{
                                    fontSize: isDesktop ? 13 : 11,
                                    lineHeight: 1.7,
                                    color: "#4b5563",
                                }}>
                                    <div style={{ marginBottom: 10 }}>
                                        <strong style={{ color: "#1f2937" }}>1. {t.modals.hint.whereToPlace} {hintExplanation.value}</strong>
                                    </div>

                                    <div style={{ marginBottom: 10 }}>
                                        <strong style={{ color: "#1f2937" }}>2. {t.modals.hint.logic.checkRow} {hintExplanation.cell.row + 1}:</strong>
                                        <div style={{ marginLeft: 16, marginTop: 4, color: "#10b981" }}>
                                            ✓ R{hintExplanation.cell.row + 1}C{hintExplanation.cell.col + 1} {t.modals.hint.logic.canAccept} {hintExplanation.value}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 10 }}>
                                        <strong style={{ color: "#1f2937" }}>3. {t.modals.hint.logic.checkColumn} {hintExplanation.cell.col + 1}:</strong>
                                        <div style={{ marginLeft: 16, marginTop: 4, color: "#10b981" }}>
                                            ✓ {t.modals.hint.logic.getNoExists(hintExplanation.value)} {t.modals.hint.column.toLowerCase()}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 10 }}>
                                        <strong style={{ color: "#1f2937" }}>4. {t.modals.hint.logic.checkBox}:</strong>
                                        <div style={{ marginLeft: 16, marginTop: 4, color: "#10b981" }}>
                                            ✓ {t.modals.hint.logic.getNoIn(hintExplanation.value)} {t.modals.hint.box.toLowerCase()}
                                        </div>
                                    </div>

                                    <div style={{
                                        marginTop: 12,
                                        padding: "10px 12px",
                                        background: "#ecfdf5",
                                        borderRadius: 6,
                                        border: "1px solid #a7f3d0",
                                    }}>
                                        <strong style={{ color: "#047857" }}>✓ {t.modals.hint.logic.conclusion}:</strong>
                                        <span style={{ color: "#065f46", marginLeft: 6 }}>
                                            {t.modals.hint.logic.getMustBe(hintExplanation.cell.row + 1, hintExplanation.cell.col + 1, hintExplanation.value)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* After Applying Info */}
                        <div style={{
                            margin: isDesktop ? "0 24px 20px" : "0 16px 16px",
                            padding: isDesktop ? "14px 16px" : "10px 12px",
                            background: "#d1fae5",
                            borderRadius: 8,
                            fontSize: isDesktop ? 13 : 11,
                            color: "#065f46",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}>
                            <span style={{ fontSize: isDesktop ? 18 : 14 }}>✓</span>
                            <span>
                                <strong>{t.modals.hint.afterApply3}</strong> — {t.modals.hint.afterApplying.instruction}
                            </span>
                        </div>

                        {/* Buttons */}
                        <div style={{
                            padding: isDesktop ? "16px 24px 24px" : "12px 16px 16px",
                            display: "flex",
                            gap: 10,
                            borderTop: "1px solid #e5e7eb",
                        }}>
                            <button
                                onClick={() => setHintExplanation(null)}
                                style={{
                                    flex: 1,
                                    padding: isDesktop ? "14px 20px" : "12px 16px",
                                    background: "white",
                                    border: "2px solid #d1d5db",
                                    borderRadius: 10,
                                    fontSize: isDesktop ? 14 : 12,
                                    fontWeight: 600,
                                    color: "#6b7280",
                                    cursor: "pointer",
                                }}
                            >
                                {t.modals.hint.closeBtn}
                            </button>
                            <button
                                onClick={applyHint}
                                style={{
                                    flex: 2,
                                    padding: isDesktop ? "14px 20px" : "12px 16px",
                                    background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                    border: "none",
                                    borderRadius: 10,
                                    fontSize: isDesktop ? 14 : 12,
                                    fontWeight: 700,
                                    color: "white",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
                                }}
                            >
                                {t.modals.hint.applyBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pause Modal */}
            {isPaused && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: 20,
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: isDesktop ? 40 : 20, // MOBILE: Less padding
                            borderRadius: 20,
                            textAlign: "center",
                            maxWidth: isDesktop ? 400 : "90%", // MOBILE: 90% width
                            width: "100%",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                fontSize: isDesktop ? 48 : 36,
                                marginBottom: isDesktop ? 20 : 10,
                            }}
                        >
                            ⏸️
                        </div>
                        <h2
                            style={{
                                color: "#2d3748",
                                marginBottom: isDesktop ? 30 : 15, // MOBILE: Less margin
                                fontSize: isDesktop ? 28 : 22, // MOBILE: Smaller text
                                fontWeight: 700,
                            }}
                        >
                            {t.modals.pause.title}
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: isDesktop ? 15 : 8, // MOBILE: Tighter gap
                                marginBottom: isDesktop ? 30 : 15, // MOBILE: Less margin
                            }}
                        >
                            <div
                                style={{
                                    background:
                                        "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", // Light green!
                                    padding: isDesktop ? 15 : 10, // MOBILE: Less padding
                                    borderRadius: 12,
                                    border: "2px solid #10b981", // Green border
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: isDesktop ? 11 : 9, // MOBILE: Smaller
                                        color: "#047857", // Dark green
                                        marginBottom: 5,
                                        fontWeight: 600,
                                    }}
                                >
                                    {t.modals.pause.time}
                                </div>
                                <div
                                    style={{
                                        fontSize: isDesktop ? 20 : 16, // MOBILE: Smaller
                                        fontWeight: 700,
                                        color: "#064e3b", // Dark green
                                    }}
                                >
                                    {formatTime(timer)}
                                </div>
                            </div>
                            <div
                                style={{
                                    background:
                                        "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", // Light green!
                                    padding: isDesktop ? 15 : 10,
                                    borderRadius: 12,
                                    border: "2px solid #10b981",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: isDesktop ? 11 : 9,
                                        color: "#047857",
                                        marginBottom: 5,
                                        fontWeight: 600,
                                    }}
                                >
                                    {t.modals.pause.mistakes}
                                </div>
                                <div
                                    style={{
                                        fontSize: isDesktop ? 20 : 16,
                                        fontWeight: 700,
                                        color: "#064e3b",
                                    }}
                                >
                                    {mistakes}/{maxMistakes || "∞"}
                                </div>
                            </div>
                            <div
                                style={{
                                    background:
                                        "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", // Light green!
                                    padding: isDesktop ? 15 : 10,
                                    borderRadius: 12,
                                    border: "2px solid #10b981",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: isDesktop ? 11 : 9,
                                        color: "#047857",
                                        marginBottom: 5,
                                        fontWeight: 600,
                                    }}
                                >
                                    {t.modals.pause.difficulty}
                                </div>
                                <div
                                    style={{
                                        fontSize: isDesktop ? 16 : 13, // MOBILE: Smaller to fit
                                        fontWeight: 700,
                                        color: "#064e3b",
                                    }}
                                >
                                    {t.difficulties[currentDifficulty as keyof typeof t.difficulties]}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: isDesktop ? 12 : 8, // MOBILE: Tighter gap
                            }}
                        >
                            <button
                                onClick={() => setIsPaused(false)}
                                style={{
                                    padding: isDesktop
                                        ? "14px 24px"
                                        : "12px 20px", // MOBILE: Compact
                                    border: "none",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: isDesktop ? 16 : 14, // MOBILE: Smaller
                                    background:
                                        "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                    color: "white",
                                }}
                            >
                                {t.modals.pause.resumeBtn}
                            </button>
                            <button
                                onClick={() => {
                                    if (
                                        confirm(t.modals.pause.confirmRestart)
                                    ) {
                                        setIsPaused(false)
                                        newGame()
                                    }
                                }}
                                style={{
                                    padding: isDesktop
                                        ? "12px 24px"
                                        : "10px 20px", // MOBILE: Compact
                                    border: "2px solid #e2e8f0",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: isDesktop ? 14 : 12, // MOBILE: Smaller
                                    background: "white",
                                    color: "#64748b",
                                }}
                            >
                                {t.modals.pause.restartBtn}
                            </button>
                            <button
                                onClick={() => {
                                    setIsPaused(false)
                                    quitToHome()
                                }}
                                style={{
                                    padding: isDesktop
                                        ? "12px 24px"
                                        : "10px 20px",
                                    border: "2px solid #ef4444",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: isDesktop ? 14 : 12,
                                    background: "white",
                                    color: "#ef4444",
                                }}
                            >
                                {t.modals.pause.quitBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Win Modal */}
            {showWinModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: 20,
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: 40,
                            borderRadius: 20,
                            textAlign: "center",
                            maxWidth: 420,
                            width: "100%",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
                        <h2
                            style={{
                                color: "#10b981",
                                marginBottom: 12,
                                fontSize: 32,
                                fontWeight: 700,
                            }}
                        >
                            {t.modals.win.title}
                        </h2>
                        <p
                            style={{
                                color: "#64748b",
                                marginBottom: 24,
                                fontSize: 16,
                            }}
                        >
                            {t.modals.win.message}
                        </p>

                        <div
                            style={{
                                background: "#f0fdf4",
                                padding: 20,
                                borderRadius: 12,
                                marginBottom: 24,
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 16,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#64748b",
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {t.modals.win.time}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: "#10b981",
                                        }}
                                    >
                                        {formatTime(timer)}
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#64748b",
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {t.modals.win.mistakes}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: "#10b981",
                                        }}
                                    >
                                        {mistakes}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            {currentDifficulty !== "pro" && (
                                <button
                                    onClick={() => {
                                        setShowWinModal(false)
                                        const diffOrder = [
                                            "medium",
                                            "expert",
                                            "pro",
                                        ] as const
                                        const currentIndex =
                                            diffOrder.indexOf(currentDifficulty)
                                        if (
                                            currentIndex <
                                            diffOrder.length - 1
                                        ) {
                                            setCurrentDifficulty(
                                                diffOrder[currentIndex + 1]
                                            )
                                        }
                                    }}
                                    style={{
                                        padding: "14px 24px",
                                        border: "none",
                                        borderRadius: 10,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        fontSize: 15,
                                        background:
                                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                        color: "white",
                                        boxShadow:
                                            "0 4px 12px rgba(16, 185, 129, 0.3)",
                                    }}
                                >
                                    {t.modals.win.tryHarderBtn}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowWinModal(false)
                                    newGame()
                                }}
                                style={{
                                    padding: "14px 24px",
                                    border: "2px solid #e2e8f0",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    background: "white",
                                    color: "#64748b",
                                }}
                            >
                                {t.modals.win.playAgainBtn}
                            </button>
                            <button
                                onClick={() => {
                                    setShowWinModal(false)
                                    quitToHome()
                                }}
                                style={{
                                    padding: "14px 24px",
                                    border: "2px solid #64748b",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    background: "white",
                                    color: "#64748b",
                                }}
                            >
                                {t.modals.win.quitBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over Modal */}
            {showGameOverModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: 20,
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: 40,
                            borderRadius: 20,
                            textAlign: "center",
                            maxWidth: 420,
                            width: "100%",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: 80, marginBottom: 20 }}>😔</div>
                        <h2
                            style={{
                                color: "#ef4444",
                                marginBottom: 12,
                                fontSize: 32,
                                fontWeight: 700,
                            }}
                        >
                            {t.modals.gameOver.title}
                        </h2>
                        <p
                            style={{
                                color: "#64748b",
                                marginBottom: 24,
                                fontSize: 16,
                            }}
                        >
                            {t.modals.gameOver.getMessage(maxMistakes)}
                        </p>

                        <div
                            style={{
                                background: "#fef2f2",
                                padding: 20,
                                borderRadius: 12,
                                marginBottom: 24,
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 16,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#64748b",
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {t.modals.gameOver.time}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: "#ef4444",
                                        }}
                                    >
                                        {formatTime(timer)}
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#64748b",
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {t.modals.gameOver.difficulty}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 700,
                                            color: "#ef4444",
                                        }}
                                    >
                                        {t.difficulties[currentDifficulty as keyof typeof t.difficulties]}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            <button
                                onClick={() => {
                                    setShowGameOverModal(false)
                                    newGame()
                                }}
                                style={{
                                    padding: "14px 24px",
                                    border: "none",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    background:
                                        "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                    color: "white",
                                    boxShadow:
                                        "0 4px 12px rgba(168, 85, 247, 0.3)",
                                }}
                            >
                                {t.modals.gameOver.tryAgainBtn}
                            </button>
                            {currentDifficulty !== "medium" && (
                                <button
                                    onClick={() => {
                                        setShowGameOverModal(false)
                                        const diffOrder = [
                                            "medium",
                                            "expert",
                                            "pro",
                                        ] as const
                                        const currentIndex =
                                            diffOrder.indexOf(currentDifficulty)
                                        if (currentIndex > 0) {
                                            setCurrentDifficulty(
                                                diffOrder[currentIndex - 1]
                                            )
                                        }
                                    }}
                                    style={{
                                        padding: "14px 24px",
                                        border: "2px solid #e2e8f0",
                                        borderRadius: 10,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        fontSize: 15,
                                        background: "white",
                                        color: "#64748b",
                                    }}
                                >
                                    {t.modals.gameOver.tryEasierBtn}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowGameOverModal(false)
                                    quitToHome()
                                }}
                                style={{
                                    padding: "14px 24px",
                                    border: "2px solid #64748b",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    background: "white",
                                    color: "#64748b",
                                }}
                            >
                                {t.modals.gameOver.quitBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
