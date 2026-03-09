# Framer Code Analysis

## Source File
`src/components/sudoku/AG_SUDOKU_ACTUAL.tsx`

## Layout Structure

### Desktop (isDesktop = true, width >= 1024px)
- Horizontal layout: Board LEFT, Controls RIGHT
- Board: 500px fixed width
- Controls: 350px fixed width
- Gap: 1.5rem between board and controls
- Center aligned vertically

### Mobile (isDesktop = false, width < 1024px)
- Vertical layout: Board TOP, Controls BOTTOM
- Board: 92vw width
- Controls: 92vw width
- No gap between sections
- Top aligned

## Cell Interaction
```tsx
onClick={() => {
    setSelectedCell({ row: rowIndex, col: colIndex })
    if (cell !== 0) {
        setSelectedNumber(cell)
    } else {
        setSelectedNumber(null)
    }
}}
```

**Key properties:**
- cursor: "pointer"
- touchAction: "manipulation" (prevents zoom)
- WebkitTapHighlightColor: "transparent"

## Aurora Background
Uses 3 animated CSS gradient layers:
1. Green: `rgba(16, 185, 129, 0.15)` - aurora1 animation
2. Darker green: `rgba(5, 150, 105, 0.12)` - aurora2 animation
3. Purple: `rgba(168, 85, 247, 0.08)` - aurora3 animation

All positioned with `position: fixed, inset: 0, zIndex: 0`

## Key Colors
- Green gradient: `linear-gradient(135deg, #10b981 0%, #059669 100%)`
- Purple gradient: `linear-gradient(135deg, #a855f7 0%, #ec4899 100%)`
- Selected cell (normal): `#e6fffa` with `3px solid #10b981` outline
- Selected cell (notes): `#e9d5ff` with `3px solid #a855f7` outline
- Error: `#e53e3e` text, `#fff5f5` background

## Board Styling
- Border: `3px solid #2d3748`
- Cell gap: 1px
- 3x3 box borders: `2px solid #2d3748`
- Square corners (borderRadius: 0)

## Responsive Breakpoint
```tsx
const checkDesktop = () => {
    setIsDesktop(window.innerWidth >= 1024)
}
```

## Render Functions
- `renderHeader()` - Logo + title
- `renderStats()` - TIME, MISTAKES, HINTS badges
- `renderDifficultySelector()` - medium/expert/pro buttons
- `renderSudokuGrid()` - 9x9 board
- `renderControls()` - Number pad + action buttons
