import { useState, useEffect } from "react"

// ===== TYPES =====
type Difficulty = "Medium" | "Hard" | "Expert" | "Pro"

interface Cell {
    value: number
    isFixed: boolean
    notes: number[]
}

// ===== AURORA BACKGROUND =====
function AuroraBackground() {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                background: `
          radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 20% 60%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
          radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
          linear-gradient(180deg, #000814 0%, #001d3d 50%, #000814 100%)
        `,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "20%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80%",
                    height: "60%",
                    background:
                        "radial-gradient(ellipse, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
                    animation: "pulse 8s ease-in-out infinite",
                    filter: "blur(60px)",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "100%",
                    background: `
            linear-gradient(90deg, 
              transparent 0%, 
              rgba(16, 185, 129, 0.03) 25%,
              rgba(59, 130, 246, 0.03) 50%,
              rgba(16, 185, 129, 0.03) 75%,
              transparent 100%)
          `,
                    animation: "wave 20s ease-in-out infinite",
                    opacity: 0.5,
                }}
            />

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateX(-50%) scale(1.1); }
        }
        @keyframes wave {
          0%, 100% { transform: translateX(-5%) rotate(0deg); }
          50% { transform: translateX(5%) rotate(0.5deg); }
        }
      `}</style>
        </div>
    )
}

// ===== MAIN COMPONENT =====
export default function AGSudoku() {
    const [board, setBoard] = useState<Cell[][]>([])
    const [solution, setSolution] = useState<number[][]>([])
    const [selected, setSelected] = useState<[number, number] | null>(null)
    const [difficulty, setDifficulty] = useState<Difficulty>("Medium")
    const [mistakes, setMistakes] = useState(0)
    const [maxMistakes, setMaxMistakes] = useState(3)
    const [timer, setTimer] = useState(0)
    const [gameWon, setGameWon] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const [notesMode, setNotesMode] = useState(false)
    const [hintsLeft, setHintsLeft] = useState(3)
    const [undoStack, setUndoStack] = useState<any[]>([])
    const [showRightPanel, setShowRightPanel] = useState(true)

    const profile = {
        nickname: "Player",
        avatarUrl: "https://i.postimg.cc/mZYW8LsZ/fox.png",
        isPro: false,
    }

    // Initialize game
    useEffect(() => {
        generateNewGame()
    }, [])

    // Timer
    useEffect(() => {
        if (gameWon || gameOver) return
        const interval = setInterval(() => setTimer((t) => t + 1), 1000)
        return () => clearInterval(interval)
    }, [gameWon, gameOver])

    // ===== SMART AUTO-COMPLETE LOGIC =====
    const getEmptyCellsCount = (): number => {
        let count = 0
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j].value === 0) count++
            }
        }
        return count
    }

    const canShowAutoComplete = (): boolean => {
        const emptyCells = getEmptyCellsCount()
        const allowedDifficulties: Difficulty[] = [
            "Medium",
            "Hard",
            "Expert",
        ]
        return (
            emptyCells > 0 &&
            emptyCells <= 3 &&
            allowedDifficulties.includes(difficulty) &&
            !gameWon &&
            !gameOver
        )
    }

    const handleAutoComplete = () => {
        const newBoard = [...board]
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (newBoard[i][j].value === 0) {
                    newBoard[i][j] = {
                        value: solution[i][j],
                        isFixed: false,
                        notes: [],
                    }
                }
            }
        }
        setBoard(newBoard)
        setGameWon(true)
    }

    // ===== GAME GENERATION =====
    const generateNewGame = () => {
        const newSolution = generateSudoku()
        setSolution(newSolution)

        const cellsToRemove = {
            Medium: 40,
            Hard: 50,
            Expert: 55,
            Pro: 60,
        }[difficulty]

        const newBoard = newSolution.map((row) =>
            row.map((val) => ({ value: val, isFixed: true, notes: [] }))
        )

        let removed = 0
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9)
            const col = Math.floor(Math.random() * 9)
            if (newBoard[row][col].value !== 0) {
                newBoard[row][col] = { value: 0, isFixed: false, notes: [] }
                removed++
            }
        }

        setBoard(newBoard)
        setMistakes(0)
        setMaxMistakes({ Medium: 3, Hard: 3, Expert: 2, Pro: 1 }[difficulty])
        setHintsLeft({ Medium: 3, Hard: 3, Expert: 1, Pro: 0 }[difficulty])
        setTimer(0)
        setGameWon(false)
        setGameOver(false)
        setSelected(null)
        setUndoStack([])
    }

    const generateSudoku = (): number[][] => {
        const board = Array(9)
            .fill(0)
            .map(() => Array(9).fill(0))

        const isValid = (
            board: number[][],
            row: number,
            col: number,
            num: number
        ): boolean => {
            for (let x = 0; x < 9; x++) {
                if (board[row][x] === num || board[x][col] === num)
                    return false
            }

            const boxRow = Math.floor(row / 3) * 3
            const boxCol = Math.floor(col / 3) * 3
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[boxRow + i][boxCol + j] === num) return false
                }
            }
            return true
        }

        const solve = (board: number[][]): boolean => {
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
    }

    // ===== GAME LOGIC =====
    const handleCellClick = (row: number, col: number) => {
        if (board[row][col].isFixed || gameWon || gameOver) return
        setSelected([row, col])
    }

    const handleNumberClick = (num: number) => {
        if (!selected || gameWon || gameOver) return
        const [row, col] = selected

        if (board[row][col].isFixed) return

        if (notesMode) {
            const newBoard = [...board]
            const notes = newBoard[row][col].notes
            const index = notes.indexOf(num)
            if (index > -1) {
                notes.splice(index, 1)
            } else {
                notes.push(num)
                notes.sort()
            }
            setBoard(newBoard)
            return
        }

        if (difficulty === "Expert" || difficulty === "Pro") {
            setUndoStack([
                ...undoStack,
                { row, col, prevValue: board[row][col].value },
            ])
        }

        const newBoard = [...board]
        newBoard[row][col] = {
            ...newBoard[row][col],
            value: num,
            notes: [],
        }

        for (let i = 0; i < 9; i++) {
            newBoard[row][i].notes = newBoard[row][i].notes.filter(
                (n) => n !== num
            )
            newBoard[i][col].notes = newBoard[i][col].notes.filter(
                (n) => n !== num
            )
        }
        const boxRow = Math.floor(row / 3) * 3
        const boxCol = Math.floor(col / 3) * 3
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                newBoard[boxRow + i][boxCol + j].notes = newBoard[
                    boxRow + i
                ][boxCol + j].notes.filter((n) => n !== num)
            }
        }

        setBoard(newBoard)

        if (solution[row][col] !== num) {
            setMistakes(mistakes + 1)
            if (mistakes + 1 >= maxMistakes) {
                setGameOver(true)
            }
        }

        if (checkWin(newBoard)) {
            setGameWon(true)
        }
    }

    const checkWin = (board: Cell[][]): boolean => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j].value !== solution[i][j]) return false
            }
        }
        return true
    }

    const handleHint = () => {
        if (hintsLeft === 0 || !selected || gameWon || gameOver) return
        const [row, col] = selected
        if (board[row][col].isFixed) return

        const newBoard = [...board]
        newBoard[row][col] = {
            value: solution[row][col],
            isFixed: false,
            notes: [],
        }
        setBoard(newBoard)
        setHintsLeft(hintsLeft - 1)

        if (checkWin(newBoard)) {
            setGameWon(true)
        }
    }

    const handleUndo = () => {
        if (undoStack.length === 0) return
        const last = undoStack[undoStack.length - 1]
        const newBoard = [...board]
        newBoard[last.row][last.col].value = last.prevValue
        setBoard(newBoard)
        setUndoStack(undoStack.slice(0, -1))
    }

    const getNumberCount = (num: number): number => {
        let count = 0
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j].value === num) count++
            }
        }
        return 9 - count
    }

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`
    }

    // ===== RENDER =====
    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            <AuroraBackground />

            {/* Profile Badge */}
            <div
                onClick={() => setShowRightPanel(!showRightPanel)}
                style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 30,
                    padding: "10px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    zIndex: 1000,
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
            >
                <img
                    src={profile.avatarUrl}
                    alt={profile.nickname}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(16, 185, 129, 0.3)",
                    }}
                />
                <span
                    style={{
                        color: "white",
                        fontSize: 15,
                        fontWeight: 600,
                    }}
                >
                    {profile.nickname}
                </span>
            </div>

            {/* Main Container */}
            <div
                style={{
                    display: "flex",
                    gap: 24,
                    maxWidth: 1400,
                    width: "100%",
                    alignItems: "flex-start",
                    justifyContent: "center",
                }}
            >
                {/* Game Panel */}
                <div
                    style={{
                        flex: "0 1 600px",
                        background: "rgba(0, 0, 0, 0.4)",
                        backdropFilter: "blur(24px)",
                        borderRadius: 24,
                        padding: 32,
                        border: "1px solid rgba(16, 185, 129, 0.1)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    background:
                                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    borderRadius: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 24,
                                }}
                            >
                                🧩
                            </div>
                            <div>
                                <h1
                                    style={{
                                        margin: 0,
                                        fontSize: 28,
                                        fontWeight: 700,
                                        background:
                                            "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    AG Sudoku
                                </h1>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 13,
                                        color: "rgba(255, 255, 255, 0.5)",
                                    }}
                                >
                                    Built with AI Engineering
                                </p>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12 }}>
                            <div
                                style={{
                                    background: "rgba(0, 0, 0, 0.4)",
                                    padding: "10px 16px",
                                    borderRadius: 10,
                                    color: "white",
                                    fontSize: 15,
                                    fontWeight: 600,
                                    border: "1px solid rgba(16, 185, 129, 0.15)",
                                }}
                            >
                                ⏱️ {formatTime(timer)}
                            </div>
                            <div
                                style={{
                                    background:
                                        mistakes >= maxMistakes - 1
                                            ? "rgba(239, 68, 68, 0.2)"
                                            : "rgba(0, 0, 0, 0.4)",
                                    padding: "10px 16px",
                                    borderRadius: 10,
                                    color:
                                        mistakes >= maxMistakes - 1
                                            ? "#ef4444"
                                            : "white",
                                    fontSize: 15,
                                    fontWeight: 600,
                                    border: `1px solid ${
                                        mistakes >= maxMistakes - 1
                                            ? "rgba(239, 68, 68, 0.3)"
                                            : "rgba(16, 185, 129, 0.15)"
                                    }`,
                                }}
                            >
                                ❌ {mistakes}/{maxMistakes}
                            </div>
                        </div>
                    </div>

                    {/* Difficulty Selector */}
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginBottom: 24,
                        }}
                    >
                        {(["Medium", "Hard", "Expert", "Pro"] as Difficulty[]).map(
                            (d) => (
                                <button
                                    key={d}
                                    onClick={() => {
                                        setDifficulty(d)
                                        setTimeout(generateNewGame, 0)
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "12px 16px",
                                        border: "none",
                                        borderRadius: 10,
                                        background:
                                            difficulty === d
                                                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                                : "rgba(255, 255, 255, 0.05)",
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: "pointer",
                                    }}
                                >
                                    {d}
                                </button>
                            )
                        )}
                    </div>

                    {/* Smart Auto-Complete Banner */}
                    {canShowAutoComplete() && (
                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                borderRadius: 12,
                                padding: "12px 16px",
                                marginBottom: 16,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <div style={{ fontSize: 24 }}>✨</div>
                                <div>
                                    <div
                                        style={{
                                            color: "white",
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Almost there!
                                    </div>
                                    <div
                                        style={{
                                            color: "rgba(255, 255, 255, 0.7)",
                                            fontSize: 12,
                                        }}
                                    >
                                        Only {getEmptyCellsCount()} cell
                                        {getEmptyCellsCount() > 1 ? "s" : ""}{" "}
                                        remaining
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleAutoComplete}
                                style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: 8,
                                    background:
                                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "white",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    boxShadow:
                                        "0 4px 12px rgba(16, 185, 129, 0.3)",
                                }}
                            >
                                Complete Puzzle
                            </button>
                        </div>
                    )}

                    {/* Sudoku Board */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(9, 1fr)",
                            gap: 2,
                            background: "rgba(0, 0, 0, 0.3)",
                            padding: 6,
                            borderRadius: 16,
                            marginBottom: 24,
                            maxWidth: 540,
                            margin: "0 auto 24px",
                            border: "1px solid rgba(16, 185, 129, 0.1)",
                        }}
                    >
                        {board.map((row, i) =>
                            row.map((cell, j) => {
                                const isSelected =
                                    selected &&
                                    selected[0] === i &&
                                    selected[1] === j
                                const boxRow = Math.floor(i / 3)
                                const boxCol = Math.floor(j / 3)
                                const isOddBox = (boxRow + boxCol) % 2 === 1

                                return (
                                    <div
                                        key={`${i}-${j}`}
                                        onClick={() => handleCellClick(i, j)}
                                        style={{
                                            aspectRatio: "1",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: isSelected
                                                ? "rgba(16, 185, 129, 0.25)"
                                                : isOddBox
                                                ? "rgba(255, 255, 255, 0.04)"
                                                : "rgba(0, 0, 0, 0.2)",
                                            cursor: cell.isFixed
                                                ? "default"
                                                : "pointer",
                                            borderRadius: 6,
                                            fontSize: 20,
                                            fontWeight: cell.isFixed
                                                ? 700
                                                : 600,
                                            color: cell.isFixed
                                                ? "rgba(255, 255, 255, 0.9)"
                                                : cell.value === 0
                                                ? "transparent"
                                                : solution[i][j] === cell.value
                                                ? "#10b981"
                                                : "#ef4444",
                                            border: isSelected
                                                ? "2px solid #10b981"
                                                : "1px solid rgba(255, 255, 255, 0.05)",
                                            position: "relative",
                                        }}
                                    >
                                        {cell.value || ""}
                                        {cell.notes.length > 0 && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: 3,
                                                    left: 3,
                                                    right: 3,
                                                    fontSize: 9,
                                                    color: "rgba(255, 255, 255, 0.4)",
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 2,
                                                }}
                                            >
                                                {cell.notes.map((n) => (
                                                    <span key={n}>{n}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Number Pad */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: 10,
                            maxWidth: 540,
                            margin: "0 auto 20px",
                        }}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "X"].map((n) => (
                            <button
                                key={n}
                                onClick={() =>
                                    typeof n === "number"
                                        ? handleNumberClick(n)
                                        : setSelected(null)
                                }
                                style={{
                                    padding: 18,
                                    border: "1px solid rgba(16, 185, 129, 0.15)",
                                    borderRadius: 12,
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "white",
                                    fontSize: 22,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    position: "relative",
                                }}
                            >
                                {n}
                                {typeof n === "number" && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 6,
                                            right: 6,
                                            fontSize: 11,
                                            color: "rgba(16, 185, 129, 0.6)",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {getNumberCount(n)}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginBottom: 10,
                        }}
                    >
                        <button
                            onClick={() => setNotesMode(!notesMode)}
                            style={{
                                flex: 1,
                                padding: 14,
                                border: "1px solid rgba(16, 185, 129, 0.15)",
                                borderRadius: 10,
                                background: notesMode
                                    ? "rgba(16, 185, 129, 0.2)"
                                    : "rgba(255, 255, 255, 0.05)",
                                color: "white",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            ✏️ Notes
                        </button>

                        {hintsLeft > 0 && (
                            <button
                                onClick={handleHint}
                                style={{
                                    flex: 1,
                                    padding: 14,
                                    border: "1px solid rgba(16, 185, 129, 0.15)",
                                    borderRadius: 10,
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "white",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                💡 Hint ({hintsLeft})
                            </button>
                        )}

                        {(difficulty === "Expert" || difficulty === "Pro") &&
                            undoStack.length > 0 && (
                                <button
                                    onClick={handleUndo}
                                    style={{
                                        flex: 1,
                                        padding: 14,
                                        border: "1px solid rgba(16, 185, 129, 0.15)",
                                        borderRadius: 10,
                                        background:
                                            "rgba(255, 255, 255, 0.05)",
                                        color: "white",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    ↩️ Undo
                                </button>
                            )}
                    </div>

                    <button
                        onClick={generateNewGame}
                        style={{
                            width: "100%",
                            padding: 14,
                            border: "1px solid rgba(16, 185, 129, 0.15)",
                            borderRadius: 10,
                            background: "rgba(255, 255, 255, 0.05)",
                            color: "white",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        🎲 New Game
                    </button>
                </div>

                {/* Right Panel */}
                {showRightPanel && (
                    <div
                        style={{
                            width: 360,
                            background: "rgba(0, 0, 0, 0.4)",
                            backdropFilter: "blur(24px)",
                            borderRadius: 24,
                            padding: 32,
                            border: "1px solid rgba(16, 185, 129, 0.1)",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 24,
                            }}
                        >
                            <div style={{ fontSize: 28 }}>🏆</div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "white",
                                }}
                            >
                                Leaderboard
                            </h3>
                        </div>

                        <div
                            style={{
                                color: "rgba(255, 255, 255, 0.5)",
                                fontSize: 14,
                                textAlign: "center",
                                padding: "60px 20px",
                                background: "rgba(255, 255, 255, 0.02)",
                                borderRadius: 12,
                                border: "1px solid rgba(16, 185, 129, 0.05)",
                            }}
                        >
                            Complete games to see rankings!
                            <div
                                style={{
                                    marginTop: 16,
                                    fontSize: 12,
                                    opacity: 0.7,
                                }}
                            >
                                Coming soon: Daily & weekly tournaments
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Win Modal */}
            {gameWon && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(12px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                    }}
                >
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            borderRadius: 24,
                            padding: 48,
                            textAlign: "center",
                            maxWidth: 420,
                        }}
                    >
                        <div style={{ fontSize: 72, marginBottom: 20 }}>
                            🎉
                        </div>
                        <h2
                            style={{
                                margin: "0 0 12px",
                                fontSize: 32,
                                fontWeight: 700,
                                color: "white",
                            }}
                        >
                            Congratulations!
                        </h2>
                        <p
                            style={{
                                margin: "0 0 24px",
                                fontSize: 18,
                                color: "rgba(255, 255, 255, 0.9)",
                            }}
                        >
                            Completed in {formatTime(timer)}
                        </p>
                        <button
                            onClick={generateNewGame}
                            style={{
                                padding: "14px 32px",
                                border: "none",
                                borderRadius: 12,
                                background: "white",
                                color: "#059669",
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Game Over Modal */}
            {gameOver && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(12px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                    }}
                >
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                            borderRadius: 24,
                            padding: 48,
                            textAlign: "center",
                            maxWidth: 420,
                        }}
                    >
                        <div style={{ fontSize: 72, marginBottom: 20 }}>
                            😢
                        </div>
                        <h2
                            style={{
                                margin: "0 0 12px",
                                fontSize: 32,
                                fontWeight: 700,
                                color: "white",
                            }}
                        >
                            Game Over
                        </h2>
                        <p
                            style={{
                                margin: "0 0 24px",
                                fontSize: 18,
                                color: "rgba(255, 255, 255, 0.9)",
                            }}
                        >
                            Too many mistakes!
                        </p>
                        <button
                            onClick={generateNewGame}
                            style={{
                                padding: "14px 32px",
                                border: "none",
                                borderRadius: 12,
                                background: "white",
                                color: "#dc2626",
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
