# 🎯 AG SUDOKU - TRANSLATION & QUIT BUTTON IMPLEMENTATION

## OVERVIEW
Add multilingual support (11 languages) and "Quit to Home" buttons to AG Sudoku game.

---

## STEP 1: Install next-intl (if not already installed)

```bash
npm install next-intl
```

---

## STEP 2: Create Translation Hook

Create `/app/[locale]/sudoku/hooks/useSudokuTranslations.ts`:

```typescript
import { useTranslations } from 'next-intl'

export function useSudokuTranslations() {
  const t = useTranslations('sudoku')
  
  return {
    // Title
    title: t('title'),
    subtitle: t('subtitle'),
    
    // Stats
    stats: {
      time: t('stats.time'),
      mistakes: t('stats.mistakes'),
      hints: t('stats.hints'),
    },
    
    // Difficulties
    difficulties: {
      medium: t('difficulties.medium'),
      expert: t('difficulties.expert'),
      pro: t('difficulties.pro'),
      locked: t('difficulties.locked'),
    },
    
    // Controls
    controls: {
      notes: t('controls.notes'),
      pause: t('controls.pause'),
      resume: t('controls.resume'),
      hint: t('controls.hint'),
      new: t('controls.new'),
      none: t('controls.none'),
    },
    
    // Modals
    modals: {
      pause: {
        title: t('modals.pause.title'),
        time: t('modals.pause.time'),
        mistakes: t('modals.pause.mistakes'),
        difficulty: t('modals.pause.difficulty'),
        resumeBtn: t('modals.pause.resumeBtn'),
        restartBtn: t('modals.pause.restartBtn'),
        quitBtn: t('modals.pause.quitBtn'),
        confirmRestart: t('modals.pause.confirmRestart'),
      },
      win: {
        title: t('modals.win.title'),
        message: t('modals.win.message'),
        time: t('modals.win.time'),
        mistakes: t('modals.win.mistakes'),
        tryHarderBtn: t('modals.win.tryHarderBtn'),
        playAgainBtn: t('modals.win.playAgainBtn'),
        quitBtn: t('modals.win.quitBtn'),
      },
      gameOver: {
        title: t('modals.gameOver.title'),
        message: t('modals.gameOver.message'),
        time: t('modals.gameOver.time'),
        difficulty: t('modals.gameOver.difficulty'),
        tryAgainBtn: t('modals.gameOver.tryAgainBtn'),
        tryEasierBtn: t('modals.gameOver.tryEasierBtn'),
        quitBtn: t('modals.gameOver.quitBtn'),
      },
      hint: {
        title: t('modals.hint.title'),
        placeHere: t('modals.hint.placeHere'),
        rowCol: t('modals.hint.rowCol'),
        technique: t('modals.hint.technique'),
        logicTitle: t('modals.hint.logicTitle'),
        visualTitle: t('modals.hint.visualTitle'),
        targetLabel: t('modals.hint.targetLabel'),
        conflictsLabel: t('modals.hint.conflictsLabel'),
        afterApplyTitle: t('modals.hint.afterApplyTitle'),
        afterApply1: t('modals.hint.afterApply1'),
        afterApply2: t('modals.hint.afterApply2'),
        afterApply3: t('modals.hint.afterApply3'),
        applyBtn: t('modals.hint.applyBtn'),
        closeBtn: t('modals.hint.closeBtn'),
        techniques: {
          nakedSingle: t('modals.hint.techniques.nakedSingle'),
          hiddenSingle: t('modals.hint.techniques.hiddenSingle'),
        },
      },
    },
    
    // Messages
    messages: {
      aiSolving: t('messages.aiSolving'),
      autoFinish: t('messages.autoFinish'),
    },
  }
}
```

---

## STEP 3: Add Translations to All Language Files

Add the "sudoku" section from `AG_SUDOKU_TRANSLATIONS.json` to each language file:
- `/messages/en.json`
- `/messages/es.json`
- `/messages/eu.json`
- `/messages/fr.json`
- `/messages/it.json`
- `/messages/de.json`
- `/messages/pt.json`
- `/messages/ja.json`
- `/messages/tl.json`
- `/messages/ko.json`
- `/messages/zh.json`

**Example for `/messages/en.json`:**
```json
{
  "navigation": { ... },
  "home": { ... },
  "sudoku": {
    "title": "AG Sudoku",
    "subtitle": "AI-Powered",
    "stats": {
      "time": "TIME",
      "mistakes": "MISTAKES",
      "hints": "HINTS"
    },
    ... (rest from AG_SUDOKU_TRANSLATIONS.json)
  }
}
```

---

## STEP 4: Update AISudoku Component

### A. Add imports at the top:

```typescript
import { useRouter } from 'next/navigation'
import { useSudokuTranslations } from './hooks/useSudokuTranslations'
```

### B. Add hooks in component:

```typescript
export default function AISudoku() {
    const router = useRouter()
    const t = useSudokuTranslations()
    
    // ... existing state ...
```

### C. Add quit function:

```typescript
const quitToHome = useCallback(() => {
    router.push('/') // Navigate to home
}, [router])
```

### D. Replace ALL hardcoded text with translations:

**Example replacements:**

```typescript
// BEFORE:
<div>TIME</div>

// AFTER:
<div>{t.stats.time}</div>

// BEFORE:
<button>Notes</button>

// AFTER:
<button>{t.controls.notes}</button>

// BEFORE:
<h2>Game Paused</h2>

// AFTER:
<h2>{t.modals.pause.title}</h2>
```

---

## STEP 5: Add "Quit" Button to Each Modal

### Pause Modal - Add after Restart button:

```typescript
<button
    onClick={quitToHome}
    style={{
        padding: isDesktop ? "12px 24px" : "10px 20px",
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
```

### Win Modal - Add after Play Again button:

```typescript
<button
    onClick={quitToHome}
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
```

### Game Over Modal - Add after Try Easier button:

```typescript
<button
    onClick={quitToHome}
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
```

---

## STEP 6: Special Cases - Dynamic Text

### Game Over modal message with dynamic count:

```typescript
// BEFORE:
<p>You've made {maxMistakes} mistakes. Don't give up!</p>

// AFTER:
<p>{t.modals.gameOver.message.replace('{count}', maxMistakes.toString())}</p>
```

### Hint modal row/col display:

```typescript
// BEFORE:
<div>Row {hintExplanation.cell.row + 1}, Col {hintExplanation.cell.col + 1}</div>

// AFTER:
<div>
    {t.modals.hint.rowCol
        .replace('{row}', (hintExplanation.cell.row + 1).toString())
        .replace('{col}', (hintExplanation.cell.col + 1).toString())}
</div>
```

### Hint modal value placeholders:

```typescript
// BEFORE:
<span>Target: Place {hintExplanation.value}</span>

// AFTER:
<span>{t.modals.hint.targetLabel.replace('{value}', hintExplanation.value.toString())}</span>
```

---

## STEP 7: Difficulty Button Capitalization

Capitalize first letter of difficulty names:

```typescript
// In difficulty selector buttons:
{["medium", "expert", "pro"].map((diff) => {
    // ...
    return (
        <button ...>
            {diff === "pro" && !isProUnlocked && "🔒 "}
            {t.difficulties[diff as keyof typeof t.difficulties]}
        </button>
    )
})}
```

---

## STEP 8: Testing Checklist

Test in ALL 11 languages:

- [ ] Header title & subtitle translate
- [ ] Stats bar (TIME, MISTAKES, HINTS) translates
- [ ] Difficulty buttons translate
- [ ] Control buttons translate (Notes, Pause, Hint, New)
- [ ] Pause modal translates + Quit button works
- [ ] Win modal translates + Quit button works
- [ ] Game Over modal translates + Quit button works
- [ ] Hint modal translates (all text)
- [ ] Dynamic text works (row/col, mistake count)
- [ ] Quit buttons navigate to homepage

---

## FILE STRUCTURE

```
/app/[locale]/sudoku/
├── page.tsx (main Sudoku page)
├── components/
│   └── AISudoku.tsx (updated with translations)
└── hooks/
    └── useSudokuTranslations.ts (new file)

/messages/
├── en.json (add "sudoku" section)
├── es.json (add "sudoku" section)
├── eu.json (add "sudoku" section)
├── fr.json (add "sudoku" section)
├── it.json (add "sudoku" section)
├── de.json (add "sudoku" section)
├── pt.json (add "sudoku" section)
├── ja.json (add "sudoku" section)
├── tl.json (add "sudoku" section)
├── ko.json (add "sudoku" section)
└── zh.json (add "sudoku" section)
```

---

## 🎯 COMPLETION CRITERIA

✅ All 11 languages work perfectly
✅ No hardcoded English text remains
✅ "Quit to Home" buttons in all 3 modals
✅ Quit buttons navigate to homepage
✅ Dynamic text (counts, row/col) translates correctly
✅ Game fully playable in any language

---

## 🚀 READY TO IMPLEMENT!

Copy `AG_SUDOKU_TRANSLATIONS.json` content into each language file under the "sudoku" key, then systematically replace all hardcoded text with translation references. Test thoroughly in all languages!
