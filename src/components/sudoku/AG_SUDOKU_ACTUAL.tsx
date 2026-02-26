import { useState, useEffect, useCallback, useRef } from "react"
import { useGameStats, GameEndResult } from "@/hooks/useGameStats"

export default function AISudoku() {
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
    const [currentDifficulty, setCurrentDifficulty] = useState("expert")
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

    // 🎯 CUSTOM CONFIRM MODAL - Replaces native confirm()
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean
        title: string
        message: string
        onConfirm: () => void
    } | null>(null)

    // Helper function to show custom confirm dialog
    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({ show: true, title, message, onConfirm })
    }

    // 🏆 PRO UNLOCK SYSTEM - Unlock Pro by beating Expert in under 15 minutes
    const [isProUnlocked, setIsProUnlocked] = useState(false)
    const [bestExpertTime, setBestExpertTime] = useState<number | null>(null)

    // 📊 CLOUD STATS - XP & Level tracking
    const { user, profile, authProfile, levelInfo, isLoggedIn, recordGameResult } = useGameStats()
    const [lastGameXP, setLastGameXP] = useState<number>(0)
    const [showLevelUp, setShowLevelUp] = useState(false)
    const gameResultRecorded = useRef(false)

    // 🔓 PRO ACCESS: Either subscription tier is 'pro' OR local unlock achieved
    const hasProAccess = authProfile?.subscription_tier === 'pro' || isProUnlocked

    // 🎯 UPDATED: Only 3 difficulty levels - removed "hard"
    const difficulties = {
        medium: 38, // ~38 empty cells (41 given)
        expert: 51, // ~51 empty cells (30 given) - was "hard"
        pro: 58, // ~58 empty cells (23 given)
    }

    // 🎯 UPDATED: 3 difficulty rules
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
            maxMistakes: 1, // 🔥 UPDATED: 1 mistake = game over! (was 0 = infinite)
            hints: 1, // 🔥 UPDATED: 1 hint allowed! (was 0)
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

    // 🖥️ Detect desktop screen size
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024) // 🔥 TABLETS IN LANDSCAPE USE HORIZONTAL!
        }

        checkDesktop()
        window.addEventListener("resize", checkDesktop)
        return () => window.removeEventListener("resize", checkDesktop)
    }, [])

    // 💾 AUTO-SAVE: Load saved game on mount
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

                    console.log("✅ Game restored from auto-save")
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

    // 🏆 PRO UNLOCK: Force Pro mode to always be unlocked
    useEffect(() => {
        try {
            // 🔓 FORCE UNLOCK: Always set Pro as unlocked
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

    // 💾 AUTO-SAVE: Save game state every 5 seconds
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

    // 💾 AUTO-SAVE: Clear save when game completes or new game starts
    useEffect(() => {
        if (showWinModal || showGameOverModal) {
            localStorage.removeItem("ag-sudoku-save")
            console.log("🗑️ Auto-save cleared (game complete)")
        }
    }, [showWinModal, showGameOverModal])

    // 📊 RECORD GAME STATS: Save to local and cloud when game ends
    useEffect(() => {
        if (!showWinModal && !showGameOverModal) {
            // Reset flag when modals are closed
            gameResultRecorded.current = false
            return
        }

        if (gameResultRecorded.current) return
        gameResultRecorded.current = true

        const isWin = showWinModal
        const difficulty = currentDifficulty as 'medium' | 'expert' | 'pro'

        // Calculate hints used (initial - remaining)
        const rules = difficultyRules[difficulty]
        const hintsUsed = rules.hints - hintsRemaining

        // Record the game result
        recordGameResult(difficulty, timer, mistakes, hintsUsed, isWin).then((result) => {
            setLastGameXP(result.xpEarned)
            if (result.leveledUp) {
                setShowLevelUp(true)
                setTimeout(() => setShowLevelUp(false), 3000)
            }
            console.log(`📊 Game recorded: ${isWin ? 'WIN' : 'LOSS'} +${result.xpEarned} XP`)
        }).catch((err) => {
            console.error('Failed to record game:', err)
        })
    }, [showWinModal, showGameOverModal, currentDifficulty, timer, mistakes, hintsRemaining, recordGameResult])

    // ⌨️ KEYBOARD SUPPORT - Simple approach
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input field
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                console.log("⌨️ Keyboard: Ignored (typing in input field)")
                return
            }

            const key = e.key.toLowerCase()
            console.log("⌨️ Keyboard pressed:", key)

            // Number keys 1-9
            if (/^[1-9]$/.test(key)) {
                e.preventDefault()
                const num = parseInt(key)
                const btn = document.querySelector(
                    `button[data-number="${num}"]`
                ) as HTMLButtonElement
                console.log(
                    "⌨️ Looking for button:",
                    num,
                    "Found:",
                    btn,
                    "Disabled:",
                    btn?.disabled
                )
                if (btn && !btn.disabled) {
                    console.log("⌨️ Clicking button:", num)
                    btn.click()
                }
            }
            // Delete/Backspace/0
            else if (key === "0" || key === "backspace" || key === "delete") {
                e.preventDefault()
                const btn = document.querySelector(
                    `button[data-number="0"]`
                ) as HTMLButtonElement
                console.log("⌨️ Clear button found:", btn)
                if (btn) {
                    console.log("⌨️ Clicking clear button")
                    btn.click()
                }
            }
        }

        console.log("⌨️ Keyboard support initialized!")
        window.addEventListener("keydown", handleKeyDown)
        return () => {
            console.log("⌨️ Keyboard support removed")
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    // 📸 SCREENSHOT BLOCKING FOR PRO MODE
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
                alert("🔒 Screenshots are disabled in Pro mode!")
                console.log("🚫 Screenshot attempt blocked in Pro mode")
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

    // 💡 ENHANCED: Find best hint with explanation and visual highlights
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
                                reason: `This cell can only be ${validNumbers[0]}. All other numbers (1-9) are already placed in this cell's row, column, or 3×3 box. Check the highlighted cells on the board!`,
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

            // 🏆 PRO UNLOCK: Unlock Pro if Expert completed in under 15 minutes
            if (currentDifficulty === "expert" && timer < 900) {
                // 900 seconds = 15 minutes
                if (!isProUnlocked) {
                    setIsProUnlocked(true)
                    localStorage.setItem("ag-sudoku-pro-unlocked", "true")
                    console.log(
                        "🎉 PRO MODE UNLOCKED! Expert completed in",
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
            difficulties[currentDifficulty]
        )

        setSolution(newSolution)
        setBoard(newBoard)
        setInitialBoard(newBoard.map((row) => [...row]))

        const rules = difficultyRules[currentDifficulty]
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
        console.log("🗑️ Auto-save cleared (new game)")
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

    // Initialize game
    useEffect(() => {
        newGame()
    }, [])

    // Trigger new game when difficulty changes
    useEffect(() => {
        newGame()
    }, [currentDifficulty])

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
                const rules = difficultyRules[currentDifficulty]
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

    // 💡 ENHANCED: Give hint with explanation
    const giveHint = useCallback(() => {
        const rules = difficultyRules[currentDifficulty]
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
        const rules = difficultyRules[currentDifficulty]
        if (!rules.aiSolve) return

        // Only allow if hints are exhausted
        if (hintsRemaining > 0) {
            alert("🤖 AI Solve unlocks after you use all hints!")
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
            alert("AI Solved! 🤖 Starting new game...")
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

    const rules = difficultyRules[currentDifficulty]

    // 🎨 RENDER COMPONENTS
    const renderHeader = () => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: isDesktop ? 8 : 4, // 🔥 MOBILE: Compact
                marginBottom: isDesktop ? 0 : 4, // 🔥 MOBILE: Space to stats!
                justifyContent: "space-between",
                maxWidth: isDesktop ? "100%" : "none",
                width: isDesktop ? "100%" : "92vw", // 🔥 MATCH BOARD!
                margin: isDesktop ? "0" : "0 auto",
                marginBottom: isDesktop ? 4 : 0,
            }}
        >
            {/* Left: Home Button + Logo + Title */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: 1,
                }}
            >
                {/* Home Button */}
                <button
                    onClick={() => {
                        showConfirm(
                            "Quit to Home",
                            "Are you sure you want to quit? Your progress will be saved.",
                            () => {
                                // Reset to welcome screen by clearing the board
                                setBoard([])
                                setSolution([])
                                setInitialBoard([])
                                setTimer(0)
                                setMistakes(0)
                                setSelectedCell(null)
                                setNotesMode(false)
                                setHintExplanation(null)
                                setShowHintHighlights(null)
                            }
                        )
                    }}
                    style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        borderRadius: 10,
                        padding: isDesktop ? "8px 12px" : "6px 10px",
                        color: "#64748b",
                        fontSize: isDesktop ? 14 : 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                    }}
                    title="Back to Home"
                >
                    ← {isDesktop ? "Home" : ""}
                </button>

                <img
                    src="https://i.imgur.com/yQMrFMl.png"
                    crossOrigin="anonymous"
                    alt="AG Logo"
                    style={{
                        height: isDesktop ? 40 : 32, // 🔥 BIGGER LOGO!
                        width: "auto",
                        objectFit: "contain",
                        filter: "drop-shadow(0 2px 8px rgba(168, 85, 247, 0.4))",
                        animation: "logoShine 10s ease-in-out infinite",
                    }}
                />

                <div>
                    <h1
                        style={{
                            color: "#2d3748",
                            fontSize: "clamp(16px, 4vw, 20px)",
                            margin: 0,
                            marginBottom: 4,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <span
                            style={{
                                background:
                                    "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                fontWeight: 800,
                            }}
                        >
                            AG
                        </span>
                        <span
                            style={{
                                background:
                                    "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                fontWeight: 700,
                            }}
                        >
                            Sudoku
                        </span>
                    </h1>
                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, #064e3b 0%, #10b981 25%, #34d399 50%, #10b981 75%, #064e3b 100%)",
                            backgroundSize: "200% 100%",
                            animation: "auroraGradient 4s ease-in-out infinite",
                            color: "white",
                            padding: "3px 8px",
                            borderRadius: 20,
                            fontSize: "clamp(8px, 2vw, 9px)",
                            fontWeight: 600,
                            display: "inline-block",
                        }}
                    >
                        ⚡ AI-Powered
                    </div>
                </div>
            </div>

            {/* Right: Profile Badge */}
            {isLoggedIn && authProfile ? (
                <a
                    href="https://goiko-avatar.vercel.app/en/profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        textDecoration: "none",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <img
                            src={`/avatars/${authProfile.avatar_id || 'shadow'}.png`}
                            alt="Avatar"
                            style={{
                                width: isDesktop ? 56 : 44,
                                height: isDesktop ? 56 : 44,
                                borderRadius: 14,
                                border: authProfile.subscription_tier === 'pro'
                                    ? "3px solid #a855f7"
                                    : "2px solid #e5e7eb",
                                objectFit: "cover",
                                background: "#f3f4f6",
                            }}
                        />
                        {authProfile.subscription_tier === 'pro' && (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: -4,
                                    right: -4,
                                    background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                    color: "white",
                                    fontSize: 8,
                                    fontWeight: 700,
                                    padding: "2px 5px",
                                    borderRadius: 6,
                                    textTransform: "uppercase",
                                }}
                            >
                                PRO
                            </div>
                        )}
                    </div>
                    <div
                        style={{
                            fontSize: isDesktop ? 11 : 9,
                            fontWeight: 600,
                            color: "#4a5568",
                            maxWidth: isDesktop ? 70 : 50,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                        }}
                    >
                        {authProfile.display_name || (authProfile.full_name || '').split(' ')[0] || 'Player'}
                    </div>
                </a>
            ) : (
                <a
                    href="https://goiko-avatar.vercel.app/en/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        textDecoration: "none",
                        flexShrink: 0,
                        padding: "8px 12px",
                        borderRadius: 12,
                        background: "rgba(168, 85, 247, 0.1)",
                        border: "1px dashed rgba(168, 85, 247, 0.3)",
                    }}
                >
                    <div style={{ fontSize: isDesktop ? 20 : 16 }}>👤</div>
                    <div
                        style={{
                            fontSize: isDesktop ? 10 : 8,
                            fontWeight: 600,
                            color: "#a855f7",
                            textAlign: "center",
                            lineHeight: 1.2,
                        }}
                    >
                        Sign in at<br />alexgoiko.com
                    </div>
                </a>
            )}
        </div>
    )

    const renderStats = () => (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: isDesktop ? 4 : 2,
                marginBottom: isDesktop ? 0 : 4,
                maxWidth: isDesktop ? "100%" : "none",
                width: isDesktop ? "100%" : "92vw", // 🔥 MATCH BOARD!
                margin: isDesktop ? "0" : "0 auto",
                marginBottom: isDesktop ? 4 : 0,
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
                    TIME
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
                    MISTAKES
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
                    HINTS
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
                gap: isDesktop ? 3 : 1, // 🔥 MOBILE: Tighter
                marginBottom: isDesktop ? 0 : 8, // 🔥 MOBILE: Space to board!
                background: "#f7fafc",
                padding: isDesktop ? 2 : 0.5, // 🔥 MOBILE: Minimal padding
                borderRadius: 8,
                maxWidth: isDesktop ? "100%" : "none",
                width: isDesktop ? "100%" : "92vw", // 🔥 MATCH BOARD!
                margin: isDesktop ? "0" : "0 auto",
                marginBottom: isDesktop ? 4 : 4,
            }}
        >
            {/* 🎯 UPDATED: Only 3 difficulty buttons */}
            {["medium", "expert", "pro"].map((diff) => {
                const isProLocked = diff === "pro" && !hasProAccess

                return (
                    <button
                        key={diff}
                        onClick={() => {
                            if (diff === "pro" && !hasProAccess) {
                                alert(
                                    "🔒 PRO MODE LOCKED!\n\nUnlock Pro mode by:\n• Getting a Pro subscription at alexgoiko.com\n• Or beat Expert difficulty in under 15 minutes"
                                )
                                return
                            }
                            setCurrentDifficulty(diff)
                        }}
                        disabled={isAISolving}
                        style={{
                            flex: 1,
                            padding: isDesktop ? "6px 6px" : "4px 4px", // 🔥 SMALLER!
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
                            fontSize: isDesktop
                                ? "12px"
                                : "clamp(10px, 2.5vw, 11px)", // 🔥 SMALLER!
                            color:
                                currentDifficulty === diff
                                    ? "white"
                                    : isProLocked
                                        ? "#94a3b8"
                                        : "#4a5568",
                            textTransform: "capitalize",
                            transition: "all 0.2s ease",
                            opacity: isAISolving ? 0.5 : 1,
                            minHeight: isDesktop ? "32px" : "28px", // 🔥 SHORTER!
                            touchAction: "manipulation",
                        }}
                    >
                        {diff === "pro" && !hasProAccess && "🔒 "}
                        {diff}
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
                borderRadius: 0, // 🔥 SQUARE CORNERS!
                overflow: "hidden",
                marginBottom: 6,
                aspectRatio: "1",
                filter: isPaused ? "blur(8px)" : "none",
                pointerEvents: isPaused || isAISolving ? "none" : "auto",
                opacity: isPaused ? 0.5 : 1,
                transition: "all 0.3s ease",
                maxWidth: isDesktop ? "500px" : "none",
                width: isDesktop ? "500px" : "92vw", // 🔥 SIMPLE: 92% of screen width!
                margin: "0 auto",
                marginTop: isDesktop ? 2 : 0,
                marginBottom: isDesktop ? 4 : 0,
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

                    // 💡 HINT HIGHLIGHTING: Check if this is the hint cell or conflicts (AFTER applying hint)
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
                                    : "clamp(18px, 5vw, 28px)", // 🔥 BIGGER NUMBERS!
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
                                touchAction: "manipulation", // 🔥 PREVENT ZOOM!
                                WebkitTapHighlightColor: "transparent", // 🔥 NO TAP HIGHLIGHT!
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
                    🤖 AI is solving... Please wait
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
                        ✨ Auto-Finish Puzzle
                    </button>
                </div>
            )}
            {/* Number Controls */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: isDesktop ? 4 : 1.5, // 🔥 TIGHTER!
                    marginBottom: isDesktop ? 4 : 3, // 🔥 SPACE TO CONTROL BUTTONS!
                    opacity: isPaused || isAISolving ? 0.5 : 1,
                    pointerEvents: isPaused || isAISolving ? "none" : "auto",
                    transition: "opacity 0.3s ease",
                    maxWidth: isDesktop ? "100%" : "none",
                    width: isDesktop ? "100%" : "92vw", // 🔥 MATCH BOARD!
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
                                padding: isDesktop ? "6px 4px" : "3px 1px", // 🔥 MUCH SMALLER!
                                border: "2px solid #e2e8f0",
                                background: isComplete ? "#f7fafc" : "white",
                                borderRadius: 6,
                                cursor: isComplete ? "not-allowed" : "pointer",
                                fontSize: isDesktop
                                    ? "22px"
                                    : "clamp(18px, 4vw, 22px)", // 🔥 BIGGER!
                                fontWeight: 700,
                                color: isComplete ? "#cbd5e0" : "#2d3748",
                                transition: "all 0.15s ease",
                                opacity: isComplete ? 0.5 : 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 1,
                                minHeight: isDesktop ? "50px" : "40px", // 🔥 TALLER FOR BIG NUMBERS!
                                touchAction: "manipulation",
                                WebkitTapHighlightColor: "transparent",
                            }}
                        >
                            <span>{num === 0 ? "✕" : num}</span>
                            {num !== 0 && (
                                <span
                                    style={{
                                        fontSize: isDesktop
                                            ? "12px"
                                            : "clamp(10px, 2.2vw, 12px)", // 🔥 READABLE!
                                        fontWeight: 600, // 🔥 BOLDER!
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
            {/* 🔥 MOBILE: 15px gap to show aurora (more compact) */}
            {/* Bottom row: Notes + Pause + Hint + New Game - 4 BUTTONS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: isDesktop ? 4 : 2,
                    maxWidth: isDesktop ? "100%" : "none",
                    width: isDesktop ? "100%" : "92vw", // 🔥 MATCH BOARD!
                    margin: "0 auto",
                }}
            >
                {/* Notes Button */}
                <button
                    onClick={() => setNotesMode(!notesMode)}
                    disabled={isAISolving}
                    style={{
                        padding: isDesktop ? "8px 6px" : "6px 4px", // 🔥 SMALLER!
                        border: "2px solid #e2e8f0",
                        background: notesMode
                            ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                            : "white",
                        borderRadius: 8,
                        cursor: isAISolving ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: isDesktop
                            ? "12px"
                            : "clamp(9px, 2.2vw, 11px)", // 🔥 SMALLER!
                        color: notesMode ? "white" : "#4a5568",
                        opacity: isAISolving ? 0.5 : 1,
                        touchAction: "manipulation",
                        minHeight: isDesktop ? "42px" : "36px", // 🔥 SHORTER!
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
                    {/* 🔥 SMALLER ICON! */}
                    <span
                        style={{
                            fontSize: isDesktop
                                ? "9px"
                                : "clamp(7px, 1.8vw, 8px)",
                        }}
                    >
                        Notes
                    </span>
                </button>

                {/* Pause Button */}
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    disabled={isAISolving}
                    style={{
                        padding: isDesktop ? "8px 6px" : "6px 4px", // 🔥 BIGGER!
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
                            : "clamp(9px, 2.2vw, 11px)", // 🔥 BIGGER!
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        opacity: isAISolving ? 0.5 : 1,
                        minHeight: isDesktop ? "42px" : "36px", // 🔥 TALLER!
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
                        {/* 🔥 BIGGER! */}
                        {isPaused ? "Resume" : "Pause"}
                    </span>
                </button>

                {/* Hint Button */}
                <button
                    onClick={giveHint}
                    disabled={
                        rules.hints === 0 || hintsRemaining === 0 || isAISolving
                    }
                    style={{
                        padding: isDesktop ? "8px 6px" : "6px 4px", // 🔥 BIGGER!
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
                            : "clamp(9px, 2.2vw, 11px)", // 🔥 BIGGER!
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
                        minHeight: isDesktop ? "42px" : "36px", // 🔥 TALLER!
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
                        {/* 🔥 BIGGER! */}
                        {rules.hints === 0
                            ? "None"
                            : hintsRemaining === 0
                                ? "None"
                                : `Hint`}
                    </span>
                </button>

                {/* New Game Button */}
                <button
                    onClick={newGame}
                    disabled={isAISolving}
                    style={{
                        padding: isDesktop ? "8px 6px" : "6px 4px", // 🔥 BIGGER!
                        border: "2px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: isAISolving ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: isDesktop
                            ? "12px"
                            : "clamp(9px, 2.2vw, 11px)", // 🔥 BIGGER!
                        background: "white",
                        color: "#4a5568",
                        opacity: isAISolving ? 0.5 : 1,
                        touchAction: "manipulation",
                        minHeight: isDesktop ? "42px" : "36px", // 🔥 TALLER!
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
                        New
                    </span>{" "}
                    {/* 🔥 BIGGER! */}
                </button>
            </div>
        </>
    )

    return (
        <div
            style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                background: "transparent",
                width: "100%",
                height: "100vh",
                overflow: "auto", // 🔥 ALLOW SCROLLING IF NEEDED!
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: isDesktop ? "center" : "flex-start", // 🔥 CENTER ON DESKTOP!
                padding: isDesktop ? "0.5rem" : "0",
                paddingTop: isDesktop
                    ? "0.3rem"
                    : "max(4px, env(safe-area-inset-top))",
                paddingBottom: isDesktop
                    ? "1rem"
                    : "max(4px, env(safe-area-inset-bottom))",
                paddingLeft: isDesktop ? "0.5rem" : "0", // 🔥 NO MOBILE PADDING!
                paddingRight: isDesktop ? "0.5rem" : "0", // 🔥 NO MOBILE PADDING!
                boxSizing: "border-box",
                position: "relative",
                touchAction: "manipulation", // 🔥 PREVENT ZOOM ON TAP!
                WebkitTapHighlightColor: "transparent", // 🔥 NO TAP HIGHLIGHT!
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

            {/* 🖥️ RESPONSIVE LAYOUT: Desktop vs Mobile */}
            <div style={{ position: "relative", zIndex: 1 }}>
                {renderHeader()}
                {renderStats()}
                {renderDifficultySelector()}

                {isDesktop ? (
                    // 🖥️ DESKTOP/LANDSCAPE: Horizontal layout (board left, controls right)
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-start", // 🔥 Align to top
                            gap: "1.5rem", // 🔥 Moderate gap
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
                                width: "350px", // 🔥 Fixed width
                                flex: "0 0 auto", // Don't grow/shrink
                            }}
                        >
                            {renderControls()}
                        </div>
                    </div>
                ) : (
                    // 📱 MOBILE/PORTRAIT: Vertical layout
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center", // 🔥 CENTER EVERYTHING!
                            gap: "0",
                        }}
                    >
                        {renderSudokuGrid()}
                        {renderControls()}
                    </div>
                )}
            </div>

            {/* 💡 HINT EXPLANATION MODAL */}
            {hintExplanation && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.75)", // Standard darkness
                        backdropFilter: "blur(4px)", // Standard blur
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: 20,
                    }}
                    onClick={() => setHintExplanation(null)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: 20,
                            borderRadius: 16,
                            textAlign: "center",
                            maxWidth: 420,
                            width: "100%",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                            maxHeight: "85vh",
                            overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ fontSize: 36, marginBottom: 8 }}>💡</div>
                        <h2
                            style={{
                                color: "#a855f7",
                                marginBottom: 12,
                                fontSize: 20,
                                fontWeight: 700,
                            }}
                        >
                            Found a Move!
                        </h2>

                        {/* Target Cell - Compact */}
                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                border: "2px solid #f59e0b",
                                padding: "8px 12px",
                                borderRadius: 8,
                                marginBottom: 10,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                            }}
                        >
                            <div style={{ textAlign: "left" }}>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "#92400e",
                                        marginBottom: 2,
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Place Here
                                </div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: "#78350f",
                                    }}
                                >
                                    Row {hintExplanation.cell.row + 1}, Col{" "}
                                    {hintExplanation.cell.col + 1}
                                </div>
                            </div>
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    background: "white",
                                    border: "2px solid #f59e0b",
                                    borderRadius: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: "#f59e0b",
                                }}
                            >
                                {hintExplanation.value}
                            </div>
                        </div>

                        {/* Technique */}
                        <div
                            style={{
                                background: "#f3e8ff",
                                padding: 8,
                                borderRadius: 8,
                                marginBottom: 10,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#a855f7",
                                    fontWeight: 600,
                                }}
                            >
                                📚 {hintExplanation.technique}
                            </div>
                        </div>

                        {/* LOGICAL EXPLANATION - Why this number goes here */}
                        <div
                            style={{
                                background: "#f8fafc",
                                border: "2px solid #e2e8f0",
                                padding: 12,
                                borderRadius: 10,
                                marginBottom: 10,
                                textAlign: "left",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: "#64748b",
                                    marginBottom: 6,
                                    textAlign: "center",
                                }}
                            >
                                🧠 Logic Explanation
                            </div>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: 12,
                                    lineHeight: 1.5,
                                    margin: 0,
                                }}
                            >
                                {hintExplanation.reason}
                            </p>
                        </div>

                        {/* COMPACT Visual Diagram */}
                        <div
                            style={{
                                background: "#f8fafc",
                                border: "2px solid #e2e8f0",
                                padding: 12,
                                borderRadius: 10,
                                marginBottom: 12,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: "#64748b",
                                    marginBottom: 8,
                                    textAlign: "center",
                                }}
                            >
                                📊 Visual Guide
                            </div>

                            {/* Smaller 3x3 diagram */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: 3,
                                    maxWidth: 140,
                                    margin: "0 auto 8px",
                                }}
                            >
                                {[...Array(9)].map((_, i) => {
                                    const row = Math.floor(i / 3)
                                    const col = i % 3
                                    const isTarget = row === 1 && col === 1
                                    const hasConflict =
                                        hintExplanation.conflictingCells &&
                                        hintExplanation.conflictingCells
                                            .length > 0 &&
                                        (row === 1 || col === 1) &&
                                        !isTarget

                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                width: "100%",
                                                aspectRatio: "1",
                                                background: isTarget
                                                    ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                                                    : hasConflict
                                                        ? "rgba(239, 68, 68, 0.15)"
                                                        : "white",
                                                border: isTarget
                                                    ? "2px solid #f59e0b"
                                                    : hasConflict
                                                        ? "2px solid #ef4444"
                                                        : "1px solid #e2e8f0",
                                                borderRadius: 4,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: isTarget ? 16 : 12,
                                                fontWeight: isTarget
                                                    ? 700
                                                    : 600,
                                                color: isTarget
                                                    ? "#f59e0b"
                                                    : hasConflict
                                                        ? "#ef4444"
                                                        : "#cbd5e0",
                                            }}
                                        >
                                            {isTarget
                                                ? hintExplanation.value
                                                : hasConflict
                                                    ? "✕"
                                                    : ""}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Compact Legend */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    fontSize: 10,
                                    color: "#64748b",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        justifyContent: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 12,
                                            height: 12,
                                            background:
                                                "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                            border: "1px solid #f59e0b",
                                            borderRadius: 3,
                                        }}
                                    ></div>
                                    <span>
                                        Target: Place {hintExplanation.value}
                                    </span>
                                </div>
                                {hintExplanation.conflictingCells &&
                                    hintExplanation.conflictingCells.length >
                                    0 && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                justifyContent: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    background:
                                                        "rgba(239, 68, 68, 0.15)",
                                                    border: "1px solid #ef4444",
                                                    borderRadius: 3,
                                                }}
                                            ></div>
                                            <span>
                                                Conflicts block other options
                                            </span>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* What happens after clicking Apply */}
                        <div
                            style={{
                                background: "#f0fdf4",
                                padding: 10,
                                borderRadius: 8,
                                marginBottom: 12,
                                textAlign: "left",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: "#10b981",
                                    marginBottom: 6,
                                }}
                            >
                                ✨ After clicking "Apply Hint":
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    fontSize: 10,
                                    color: "#64748b",
                                }}
                            >
                                <div>
                                    • Yellow cell shows where{" "}
                                    <strong>{hintExplanation.value}</strong> was
                                    placed
                                </div>
                                {hintExplanation.conflictingCells &&
                                    hintExplanation.conflictingCells.length >
                                    0 && (
                                        <div>
                                            • Red cells show blocking numbers
                                        </div>
                                    )}
                                <div
                                    style={{
                                        color: "#10b981",
                                        fontWeight: 600,
                                        fontStyle: "italic",
                                        marginTop: 2,
                                    }}
                                >
                                    💡 Highlights stay for 3 seconds!
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            <button
                                onClick={applyHint}
                                style={{
                                    padding: "12px 20px",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    background:
                                        "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                    color: "white",
                                }}
                            >
                                ✓ Apply Hint & Show Visual Guide
                            </button>
                            <button
                                onClick={() => setHintExplanation(null)}
                                style={{
                                    padding: "10px 20px",
                                    border: "2px solid #e2e8f0",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    background: "white",
                                    color: "#64748b",
                                }}
                            >
                                Close
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
                            padding: isDesktop ? 40 : 20, // 🔥 MOBILE: Less padding
                            borderRadius: 20,
                            textAlign: "center",
                            maxWidth: isDesktop ? 400 : "90%", // 🔥 MOBILE: 90% width
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
                                marginBottom: isDesktop ? 30 : 15, // 🔥 MOBILE: Less margin
                                fontSize: isDesktop ? 28 : 22, // 🔥 MOBILE: Smaller text
                                fontWeight: 700,
                            }}
                        >
                            Game Paused
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: isDesktop ? 15 : 8, // 🔥 MOBILE: Tighter gap
                                marginBottom: isDesktop ? 30 : 15, // 🔥 MOBILE: Less margin
                            }}
                        >
                            <div
                                style={{
                                    background:
                                        "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", // 🎨 Light green!
                                    padding: isDesktop ? 15 : 10, // 🔥 MOBILE: Less padding
                                    borderRadius: 12,
                                    border: "2px solid #10b981", // Green border
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: isDesktop ? 11 : 9, // 🔥 MOBILE: Smaller
                                        color: "#047857", // Dark green
                                        marginBottom: 5,
                                        fontWeight: 600,
                                    }}
                                >
                                    Time
                                </div>
                                <div
                                    style={{
                                        fontSize: isDesktop ? 20 : 16, // 🔥 MOBILE: Smaller
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
                                        "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", // 🎨 Light green!
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
                                    Mistakes
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
                                        "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", // 🎨 Light green!
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
                                    Difficulty
                                </div>
                                <div
                                    style={{
                                        fontSize: isDesktop ? 16 : 13, // 🔥 MOBILE: Smaller to fit
                                        fontWeight: 700,
                                        color: "#064e3b",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {currentDifficulty}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: isDesktop ? 12 : 8, // 🔥 MOBILE: Tighter gap
                            }}
                        >
                            <button
                                onClick={() => setIsPaused(false)}
                                style={{
                                    padding: isDesktop
                                        ? "14px 24px"
                                        : "12px 20px", // 🔥 MOBILE: Compact
                                    border: "none",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: isDesktop ? 16 : 14, // 🔥 MOBILE: Smaller
                                    background:
                                        "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                    color: "white",
                                }}
                            >
                                ▶️ Resume Game
                            </button>
                            <button
                                onClick={() => {
                                    showConfirm(
                                        "Restart Game",
                                        "Are you sure you want to restart? Your progress will be lost.",
                                        () => {
                                            setIsPaused(false)
                                            newGame()
                                        }
                                    )
                                }}
                                style={{
                                    padding: isDesktop
                                        ? "12px 24px"
                                        : "10px 20px", // 🔥 MOBILE: Compact
                                    border: "2px solid #e2e8f0",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: isDesktop ? 14 : 12, // 🔥 MOBILE: Smaller
                                    background: "white",
                                    color: "#64748b",
                                }}
                            >
                                🔄 Restart Game
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
                            Well Done!
                        </h2>
                        <p
                            style={{
                                color: "#64748b",
                                marginBottom: 24,
                                fontSize: 16,
                            }}
                        >
                            You've completed the puzzle!
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
                                        Time
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
                                        Mistakes
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

                        {/* XP Earned Section */}
                        {lastGameXP > 0 && (
                            <div
                                style={{
                                    background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                                    padding: 16,
                                    borderRadius: 12,
                                    marginBottom: 24,
                                    color: "white",
                                    textAlign: "center",
                                }}
                            >
                                <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>
                                    {isLoggedIn ? "XP Earned" : "Potential XP"}
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 700 }}>
                                    +{lastGameXP} XP
                                </div>
                                {showLevelUp && (
                                    <div style={{
                                        fontSize: 14,
                                        marginTop: 8,
                                        fontWeight: 600,
                                        animation: "pulse 0.5s ease-in-out infinite alternate"
                                    }}>
                                        🎉 Level Up!
                                    </div>
                                )}
                                {!isLoggedIn && (
                                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
                                        Sign in to save XP
                                    </div>
                                )}
                            </div>
                        )}

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
                                        ]
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
                                    🚀 Try Harder Level
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
                                🔄 Play Again
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
                            Game Over
                        </h2>
                        <p
                            style={{
                                color: "#64748b",
                                marginBottom: 24,
                                fontSize: 16,
                            }}
                        >
                            You've made {maxMistakes} mistakes. Don't give up!
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
                                        Time
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
                                        Difficulty
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 700,
                                            color: "#ef4444",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {currentDifficulty}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Participation XP Section */}
                        {lastGameXP > 0 && isLoggedIn && (
                            <div
                                style={{
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    padding: 12,
                                    borderRadius: 10,
                                    marginBottom: 24,
                                    textAlign: "center",
                                }}
                            >
                                <div style={{ fontSize: 13, color: "#64748b" }}>
                                    Participation XP: <span style={{ fontWeight: 600, color: "#a855f7" }}>+{lastGameXP}</span>
                                </div>
                            </div>
                        )}

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
                                🔄 Try Again
                            </button>
                            {currentDifficulty !== "medium" && (
                                <button
                                    onClick={() => {
                                        setShowGameOverModal(false)
                                        const diffOrder = [
                                            "medium",
                                            "expert",
                                            "pro",
                                        ]
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
                                    ⬇️ Try Easier Level
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirm Modal - Glassmorphism Style */}
            {confirmModal?.show && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0, 0, 0, 0.6)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                    onClick={() => setConfirmModal(null)}
                >
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))",
                            borderRadius: 24,
                            padding: isDesktop ? "32px 28px" : "24px 20px",
                            maxWidth: 380,
                            width: "85%",
                            boxShadow:
                                "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            textAlign: "center",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Title */}
                        <h3
                            style={{
                                color: "#ffffff",
                                fontSize: isDesktop ? 20 : 18,
                                fontWeight: 700,
                                marginBottom: 12,
                                marginTop: 0,
                                background:
                                    "linear-gradient(135deg, #a855f7, #ec4899)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            {confirmModal.title}
                        </h3>

                        {/* Message */}
                        <p
                            style={{
                                color: "rgba(255, 255, 255, 0.7)",
                                fontSize: isDesktop ? 15 : 14,
                                lineHeight: 1.5,
                                marginBottom: 28,
                                marginTop: 0,
                            }}
                        >
                            {confirmModal.message}
                        </p>

                        {/* Buttons */}
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={() => setConfirmModal(null)}
                                style={{
                                    padding: isDesktop ? "12px 28px" : "10px 20px",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    borderRadius: 12,
                                    color: "rgba(255, 255, 255, 0.8)",
                                    fontSize: isDesktop ? 15 : 14,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    confirmModal.onConfirm()
                                    setConfirmModal(null)
                                }}
                                style={{
                                    padding: isDesktop ? "12px 28px" : "10px 20px",
                                    background:
                                        "linear-gradient(135deg, #a855f7, #ec4899)",
                                    border: "none",
                                    borderRadius: 12,
                                    color: "#ffffff",
                                    fontSize: isDesktop ? 15 : 14,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    boxShadow: "0 4px 15px rgba(168, 85, 247, 0.4)",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
