import { useState, useEffect, useCallback } from "react"

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
    const [currentDifficulty, setCurrentDifficulty] = useState("hard")
    const [showWinModal, setShowWinModal] = useState(false)
    // Auto-check removed - mistakes are always tracked automatically
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

    const difficulties = {
        medium: 50,
        hard: 56,
        expert: 60,
        pro: 64,
    }

    const difficultyRules = {
        medium: { maxMistakes: 3, hints: 3, aiSolve: true, undo: false },
        hard: { maxMistakes: 3, hints: 3, aiSolve: true, undo: false },
        expert: { maxMistakes: 1, hints: 1, aiSolve: false, undo: true },
        pro: { maxMistakes: 0, hints: 0, aiSolve: false, undo: true },
    }

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
        setSelectedCell(null)
        setIsAISolving(false)
        setNotes(
            Array(9)
                .fill(null)
                .map(() =>
                    Array(9)
                        .fill(null)
                        .map(() => new Set<number>())
                )
        )
    }, [currentDifficulty, generateSolution, createPuzzle])

    // Timer effect
    useEffect(() => {
        if (showWinModal || isPaused || isAISolving) return

        const interval = setInterval(() => {
            setTimer((t) => t + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [showWinModal, isPaused, isAISolving])

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

            // Notes mode
            if (notesMode && num !== 0) {
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
                return
            }

            // Regular number placement
            const newBoard = board.map((r) => [...r])
            const oldValue = newBoard[row][col]

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
                        alert(`Game Over! You made ${maxMistakes} mistakes.`)
                        newGame()
                    }, 100)
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
        ]
    )

    // Give hint
    const giveHint = useCallback(() => {
        const rules = difficultyRules[currentDifficulty]
        if (rules.hints === 0 || hintsRemaining <= 0) return

        const emptyCells: { row: number; col: number }[] = []
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    emptyCells.push({ row, col })
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell =
                emptyCells[Math.floor(Math.random() * emptyCells.length)]
            const newBoard = board.map((r) => [...r])
            const num = solution[randomCell.row][randomCell.col]
            newBoard[randomCell.row][randomCell.col] = num
            setBoard(newBoard)
            setHintsRemaining((h) => h - 1)
            
            // Clear notes after hint
            clearNotesAfterPlacement(randomCell.row, randomCell.col, num)
        }
    }, [board, solution, hintsRemaining, currentDifficulty, clearNotesAfterPlacement])

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

    return (
        <div
            style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
            }}
        >
            <div
                style={{
                    background: "rgba(255, 255, 255, 0.98)",
                    borderRadius: 20,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                    padding: 15,
                    maxWidth: 500,
                    width: "100%",
                }}
            >
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                    <div
                        style={{
                            marginBottom: 8,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        <img
                            src="https://i.imgur.com/yQMrFMl.png"
                            crossOrigin="anonymous"
                            alt="AG Logo"
                            style={{
                                height: 55,
                                width: "auto",
                                objectFit: "contain",
                                display: "block",
                                filter: "drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))",
                                animation: "logoShine 10s ease-in-out infinite",
                            }}
                        />
                    </div>

                    <h1
                        style={{
                            color: "#2d3748",
                            fontSize: 24,
                            marginBottom: 4,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
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
                        <span style={{ color: "#2d3748" }}>Sudoku</span>
                    </h1>
                    <div
                        style={{
                            color: "#718096",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                        }}
                    >
                        <span>Built with AI Engineering</span>
                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                padding: "4px 12px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 600,
                            }}
                        >
                            ⚡ AI-Powered
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 8,
                        marginBottom: 10,
                    }}
                >
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            padding: 10,
                            borderRadius: 12,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: 10, opacity: 0.9 }}>TIME</div>
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                marginTop: 2,
                            }}
                        >
                            {formatTime(timer)}
                        </div>
                    </div>
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            padding: 10,
                            borderRadius: 12,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: 10, opacity: 0.9 }}>
                            MISTAKES
                        </div>
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                marginTop: 2,
                            }}
                        >
                            {mistakes}/{maxMistakes || "∞"}
                        </div>
                    </div>
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            padding: 10,
                            borderRadius: 12,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: 10, opacity: 0.9 }}>HINTS</div>
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                marginTop: 2,
                            }}
                        >
                            {hintsRemaining}/{rules.hints || 0}
                        </div>
                    </div>
                </div>

                {/* AI Solving Indicator */}
                {isAISolving && (
                    <div
                        style={{
                            background: "#667eea",
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

                {/* Pause Button */}
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    disabled={isAISolving}
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: 10,
                        border: "2px solid #667eea",
                        background: isPaused ? "#667eea" : "white",
                        color: isPaused ? "white" : "#667eea",
                        borderRadius: 10,
                        cursor: isAISolving ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        opacity: isAISolving ? 0.5 : 1,
                    }}
                >
                    {isPaused ? "▶️ Resume" : "⏸️ Pause Game"}
                </button>

                {/* Difficulty Selector */}
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        marginBottom: 10,
                        background: "#f7fafc",
                        padding: 4,
                        borderRadius: 10,
                    }}
                >
                    {["medium", "hard", "expert", "pro"].map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setCurrentDifficulty(diff)}
                            disabled={isAISolving}
                            style={{
                                flex: 1,
                                padding: "14px 12px",
                                border: "none",
                                background:
                                    currentDifficulty === diff
                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        : "transparent",
                                borderRadius: 8,
                                cursor: isAISolving ? "not-allowed" : "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                                color:
                                    currentDifficulty === diff
                                        ? "white"
                                        : "#4a5568",
                                textTransform: "capitalize",
                                transition: "all 0.2s ease",
                                opacity: isAISolving ? 0.5 : 1,
                            }}
                        >
                            {diff}
                        </button>
                    ))}
                </div>

                {/* Sudoku Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(9, 1fr)",
                        gap: 1,
                        background: "#cbd5e0",
                        border: "3px solid #2d3748",
                        borderRadius: 12,
                        overflow: "hidden",
                        marginBottom: 10,
                        aspectRatio: "1",
                        filter: isPaused ? "blur(8px)" : "none",
                        pointerEvents: isPaused || isAISolving ? "none" : "auto",
                        opacity: isPaused ? 0.5 : 1,
                        transition: "all 0.3s ease",
                    }}
                >
                    {board.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            const index = rowIndex * 9 + colIndex
                            const isSelected =
                                selectedCell?.row === rowIndex &&
                                selectedCell?.col === colIndex
                            const isGiven =
                                initialBoard[rowIndex][colIndex] !== 0
                            const isError =
                                cell !== 0 &&
                                cell !== solution[rowIndex][colIndex] &&
                                !isGiven
                            const isSameNumber =
                                selectedCell &&
                                cell !== 0 &&
                                cell ===
                                    board[selectedCell.row][selectedCell.col]
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

                            return (
                                <div
                                    key={index}
                                    onClick={() =>
                                        setSelectedCell({
                                            row: rowIndex,
                                            col: colIndex,
                                        })
                                    }
                                    style={{
                                        aspectRatio: "1",
                                        background: isSelected
                                            ? "#e6fffa"
                                            : isSameNumber
                                              ? "#dbeafe"
                                              : isInSameRow ||
                                                  isInSameCol ||
                                                  isInSameBox
                                                ? "#f7fafc"
                                                : isGiven
                                                  ? "#f7fafc"
                                                  : isError
                                                    ? "#fff5f5"
                                                    : "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 20,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        color: isGiven
                                            ? "#2d3748"
                                            : isError
                                              ? "#e53e3e"
                                              : isCorrectNumber
                                                ? "#10b981"
                                                : "#667eea",
                                        borderRight:
                                            colIndex === 2 || colIndex === 5
                                                ? "2px solid #2d3748"
                                                : "none",
                                        borderBottom:
                                            rowIndex === 2 || rowIndex === 5
                                                ? "2px solid #2d3748"
                                                : "none",
                                        outline: isSelected
                                            ? "3px solid #38b2ac"
                                            : "none",
                                        outlineOffset: "-3px",
                                        boxSizing: "border-box",
                                        transition: "background 0.2s ease",
                                        position: "relative",
                                    }}
                                >
                                    {cell ? (
                                        cell
                                    ) : notes[rowIndex][colIndex].size > 0 ? (
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(3, 1fr)",
                                                gridTemplateRows:
                                                    "repeat(3, 1fr)",
                                                gap: "0px",
                                                width: "100%",
                                                height: "100%",
                                                padding: "2px",
                                            }}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(
                                                (n) => (
                                                    <div
                                                        key={n}
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: "10px",
                                                            fontWeight: 600,
                                                            color: "#6b7280",
                                                            lineHeight: 1,
                                                        }}
                                                    >
                                                        {notes[rowIndex][
                                                            colIndex
                                                        ].has(n)
                                                            ? n
                                                            : ""}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Number Controls */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 8,
                        marginBottom: 15,
                        opacity: isPaused || isAISolving ? 0.5 : 1,
                        pointerEvents: isPaused || isAISolving ? "none" : "auto",
                        transition: "opacity 0.3s ease",
                    }}
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => {
                        const remaining = getRemainingCount(num)
                        const isComplete = num !== 0 && remaining === 0

                        return (
                            <button
                                key={num}
                                onClick={() => placeNumber(num)}
                                disabled={isComplete}
                                style={{
                                    padding: "10px 14px",
                                    border: "2px solid #e2e8f0",
                                    background: isComplete
                                        ? "#f7fafc"
                                        : "white",
                                    borderRadius: 10,
                                    cursor: isComplete
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: isComplete ? "#cbd5e0" : "#2d3748",
                                    transition: "all 0.15s ease",
                                    opacity: isComplete ? 0.5 : 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <span>{num === 0 ? "✕" : num}</span>
                                {num !== 0 && (
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 500,
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

                {/* Toggle Buttons */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 10,
                        marginBottom: 15,
                    }}
                >
                    <button
                        onClick={() => setNotesMode(!notesMode)}
                        disabled={isAISolving}
                        style={{
                            padding: 10,
                            border: "2px solid #e2e8f0",
                            background: notesMode ? "#667eea" : "white",
                            borderRadius: 10,
                            cursor: isAISolving ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                            color: notesMode ? "white" : "#4a5568",
                            opacity: isAISolving ? 0.5 : 1,
                        }}
                    >
                        ✏️ Notes: {notesMode ? "ON" : "OFF"}
                    </button>
                </div>

                {/* Action Buttons */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: rules.undo ? "repeat(2, 1fr)" : "1fr",
                        gap: 8,
                    }}
                >
                    <button
                        onClick={giveHint}
                        disabled={rules.hints === 0 || hintsRemaining === 0 || isAISolving}
                        style={{
                            padding: "10px 16px",
                            border: "none",
                            borderRadius: 10,
                            cursor:
                                rules.hints === 0 || hintsRemaining === 0 || isAISolving
                                    ? "not-allowed"
                                    : "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            opacity:
                                rules.hints === 0 || hintsRemaining === 0 || isAISolving
                                    ? 0.3
                                    : 1,
                        }}
                    >
                        💡 {rules.hints === 0 ? "No Hints" : `Hint (${hintsRemaining})`}
                    </button>
                    <button
                        onClick={solvePuzzle}
                        disabled={!rules.aiSolve || isAISolving || hintsRemaining > 0}
                        style={{
                            padding: "12px 20px",
                            border: "none",
                            borderRadius: 10,
                            cursor: !rules.aiSolve || isAISolving || hintsRemaining > 0
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            opacity: !rules.aiSolve || isAISolving || hintsRemaining > 0 ? 0.3 : 1,
                        }}
                    >
                        🤖 {!rules.aiSolve ? "Disabled" : hintsRemaining > 0 ? "Use Hints First" : "AI Solve"}
                    </button>
                    {rules.undo && (
                        <button
                            onClick={undo}
                            disabled={isAISolving}
                            style={{
                                padding: "12px 20px",
                                border: "2px solid #e2e8f0",
                                borderRadius: 10,
                                cursor: isAISolving ? "not-allowed" : "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                                background: "white",
                                color: "#4a5568",
                                opacity: isAISolving ? 0.5 : 1,
                            }}
                        >
                            ↶ Undo
                        </button>
                    )}
                    <button
                        onClick={newGame}
                        disabled={isAISolving}
                        style={{
                            padding: "12px 20px",
                            border: "2px solid #e2e8f0",
                            borderRadius: 10,
                            cursor: isAISolving ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            background: "white",
                            color: "#4a5568",
                            opacity: isAISolving ? 0.5 : 1,
                        }}
                    >
                        🎮 New Game
                    </button>
                </div>
            </div>

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
                            padding: 40,
                            borderRadius: 20,
                            textAlign: "center",
                            maxWidth: 400,
                            width: "100%",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: 48, marginBottom: 20 }}>⏸️</div>
                        <h2
                            style={{
                                color: "#2d3748",
                                marginBottom: 30,
                                fontSize: 28,
                                fontWeight: 700,
                            }}
                        >
                            Game Paused
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 15,
                                marginBottom: 30,
                            }}
                        >
                            <div
                                style={{
                                    background: "#f7fafc",
                                    padding: 15,
                                    borderRadius: 12,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#94a3b8",
                                        marginBottom: 5,
                                        fontWeight: 600,
                                    }}
                                >
                                    Time
                                </div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 700,
                                        color: "#2d3748",
                                    }}
                                >
                                    {formatTime(timer)}
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "#f7fafc",
                                    padding: 15,
                                    borderRadius: 12,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#94a3b8",
                                        marginBottom: 5,
                                        fontWeight: 600,
                                    }}
                                >
                                    Mistakes
                                </div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 700,
                                        color: "#2d3748",
                                    }}
                                >
                                    {mistakes}/{maxMistakes || "∞"}
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "#f7fafc",
                                    padding: 15,
                                    borderRadius: 12,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#94a3b8",
                                        marginBottom: 5,
                                        fontWeight: 600,
                                    }}
                                >
                                    Difficulty
                                </div>
                                <div
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "#2d3748",
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
                                gap: 12,
                            }}
                        >
                            <button
                                onClick={() => setIsPaused(false)}
                                style={{
                                    padding: "14px 24px",
                                    border: "none",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    background:
                                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                }}
                            >
                                ▶️ Resume Game
                            </button>
                            <button
                                onClick={() => {
                                    if (
                                        confirm(
                                            "Are you sure you want to restart? Your progress will be lost."
                                        )
                                    ) {
                                        setIsPaused(false)
                                        newGame()
                                    }
                                }}
                                style={{
                                    padding: "12px 24px",
                                    border: "2px solid #e2e8f0",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 14,
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
                        background: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: 20,
                    }}
                    onClick={() => setShowWinModal(false)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: 30,
                            borderRadius: 20,
                            textAlign: "center",
                            maxWidth: 400,
                            width: "100%",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: 60, marginBottom: 15 }}>🏆</div>
                        <h2
                            style={{
                                color: "#2d3748",
                                marginBottom: 15,
                                fontSize: 24,
                            }}
                        >
                            Congratulations!
                        </h2>
                        <p style={{ color: "#718096", marginBottom: 10 }}>
                            You've mastered this puzzle!
                        </p>
                        <p style={{ color: "#718096", marginBottom: 10 }}>
                            <strong>Time:</strong> {formatTime(timer)}
                        </p>
                        <p style={{ color: "#718096", marginBottom: 20 }}>
                            <strong>Mistakes:</strong> {mistakes}
                        </p>
                        <button
                            onClick={() => {
                                setShowWinModal(false)
                                newGame()
                            }}
                            style={{
                                padding: "12px 20px",
                                border: "none",
                                borderRadius: 10,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                                background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                            }}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
