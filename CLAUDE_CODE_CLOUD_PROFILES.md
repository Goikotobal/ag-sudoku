# AG SUDOKU - Phase 6: Cloud Profiles & Stats Sync

## CONTEXT
AG Sudoku at sudoku.alexgoiko.com now has:
- Supabase Auth with Google OAuth (just implemented)
- Local stats tracking in localStorage (key: ag_sudoku_stats)
- Local settings in localStorage (key: ag_sudoku_settings)
- Local avatar selection in localStorage (key: ag_sudoku_avatar)
- 20 monster avatars integrated
- Database tables already created in Supabase (sudoku_profiles, sudoku_game_stats, sudoku_game_history)

## Project: C:/Users/goiko/Projects/Sudoku

## GOAL
When a user signs in with Google, their local data migrates to Supabase and all future game results save to the cloud. Guest mode (no login) continues to work with localStorage only.

---

## TASK 1: Create Supabase Profile on First Login

### Create src/hooks/useProfile.ts

A hook that manages the user's Sudoku profile:

```typescript
// On auth state change (user logs in):
// 1. Check if sudoku_profiles row exists for this user
// 2. If NOT: Create profile with data from localStorage
//    - nickname: Google display name (truncated to 15 chars)
//    - avatar_id: from localStorage ag_sudoku_avatar (or 'blinky' default)
//    - avatar_color: from localStorage or default
//    - frame_id: 'basic'
//    - level: 1, xp: 0
// 3. If YES: Load profile from Supabase, update local state
// 4. Provide profile data to components

interface SudokuProfile {
  user_id: string;
  nickname: string;
  avatar_id: string;
  avatar_color: string;
  frame_id: string;
  level: number;
  xp: number;
  total_games_played: number;
  total_games_won: number;
  total_playtime_seconds: number;
  pro_unlocked: boolean;
}
```

### Profile Creation Flow:
- Automatic on first Google sign-in (no extra form/modal needed for now)
- Use Google display name as default nickname
- Use currently selected avatar from localStorage
- Migrate any existing localStorage stats

---

## TASK 2: Migrate localStorage Stats to Supabase

### Create src/utils/statsSyncManager.ts

When user logs in for the first time AND has localStorage stats:

```typescript
async function migrateLocalStatsToCloud(userId: string) {
  // 1. Read localStorage stats (ag_sudoku_stats)
  const localStats = JSON.parse(localStorage.getItem('ag_sudoku_stats') || '{}');
  
  // 2. For each difficulty that has data (medium, expert, pro):
  //    INSERT or UPDATE sudoku_game_stats row
  //    Fields: games_played, games_won, best_time_seconds, avg_time_seconds,
  //            total_time_seconds, hints_used, mistakes_total, perfect_games,
  //            current_streak, longest_streak, last_played_date
  
  // 3. Update sudoku_profiles totals:
  //    total_games_played, total_games_won, total_playtime_seconds
  
  // 4. Mark migration as done: localStorage.setItem('ag_sudoku_migrated', 'true')
  //    So we don't re-migrate on next login
}
```

### Important: Don't delete localStorage after migration
Keep it as a local cache for faster reads. Only mark it as migrated.

---

## TASK 3: Save Game Results to Supabase

### Modify the game completion flow

Currently in AG_SUDOKU_ACTUAL.tsx (or wherever win/loss is handled), the game calls statsManager to save locally. Add cloud saving:

```typescript
// After a game ends (win or loss):
async function saveGameResult(result: GameResult) {
  // 1. Always save to localStorage (works for guests too)
  statsManager.recordGame(result);
  
  // 2. If user is logged in, also save to Supabase:
  if (user) {
    // a. Insert into sudoku_game_history
    await supabase.from('sudoku_game_history').insert({
      user_id: user.id,
      difficulty: result.difficulty,
      time_seconds: result.timeSeconds,
      mistakes: result.mistakes,
      hints_used: result.hintsUsed,
      is_win: result.isWin,
      is_perfect: result.mistakes === 0 && result.isWin,
      xp_earned: calculateXP(result)
    });
    
    // b. Update sudoku_game_stats (upsert for this difficulty)
    // Increment games_played, games_won (if win), update best_time, etc.
    
    // c. Update sudoku_profiles totals
    // Increment total_games_played, total_games_won, total_playtime_seconds, xp
  }
}
```

### XP Calculation (simple for now):
```typescript
function calculateXP(result: GameResult): number {
  if (!result.isWin) return 10; // participation XP
  
  let xp = 0;
  // Base XP by difficulty
  if (result.difficulty === 'medium') xp = 25;
  else if (result.difficulty === 'expert') xp = 60;
  else if (result.difficulty === 'pro') xp = 125;
  
  // Bonuses
  if (result.mistakes === 0) xp += 25; // perfect game
  if (result.hintsUsed === 0) xp += 10; // no hints
  if (result.difficulty === 'medium' && result.timeSeconds < 300) xp += 20; // fast
  if (result.difficulty === 'expert' && result.timeSeconds < 600) xp += 30;
  
  return xp;
}
```

---

## TASK 4: Update Stats Display to Show Cloud Data

### When user is logged in:
- Stats modal should read from Supabase (most up-to-date)
- Show XP and Level on the stats display
- Show total across all devices

### When user is guest:
- Stats modal reads from localStorage (current behavior)
- No XP/Level shown (or show "Sign in to track XP")

### Level calculation:
```typescript
function getLevelFromXP(xp: number): { level: number; title: string; nextLevelXP: number } {
  const levels = [
    { level: 1, xp: 0, title: 'Beginner' },
    { level: 3, xp: 150, title: 'Novice' },
    { level: 5, xp: 400, title: 'Learner' },
    { level: 10, xp: 1000, title: 'Player' },
    { level: 15, xp: 2000, title: 'Solver' },
    { level: 20, xp: 3500, title: 'Expert' },
    { level: 25, xp: 5500, title: 'Master' },
    { level: 30, xp: 8000, title: 'Champion' },
    { level: 40, xp: 12000, title: 'Grandmaster' },
    { level: 50, xp: 18000, title: 'Legend' },
    { level: 75, xp: 30000, title: 'Mythic' },
    { level: 100, xp: 50000, title: 'Immortal' },
  ];
  
  let current = levels[0];
  let next = levels[1];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) {
      current = levels[i];
      next = levels[i + 1] || levels[i];
      break;
    }
  }
  return { level: current.level, title: current.title, nextLevelXP: next.xp };
}
```

---

## TASK 5: Show Level & XP on Welcome Screen

When logged in, show below the avatar on the welcome screen:
```
[Monster Avatar]
Level 5 - Learner
[===████░░░░░░░] 400/1000 XP
```

- XP progress bar with purple gradient (matches theme)
- Level number and title
- Compact, doesn't take much space
- Only visible when logged in

---

## TASK 6: Profile Editing

### Add a simple profile edit capability:
- Tap on nickname → editable text field (max 15 chars)
- Changes save to Supabase immediately
- Avatar changes (from AvatarSelector) also sync to Supabase
- Keep it simple — no separate profile page needed yet

---

## TASK 7: Offline Queue (Simple Version)

If the user is logged in but temporarily offline:
```typescript
// When saving to Supabase fails:
// 1. Save the game result to a localStorage queue: ag_sudoku_pending_sync
// 2. On next successful Supabase operation, flush the queue
// 3. Simple array of pending game results

// On app load, if user is logged in:
// Check for pending sync items and flush them
```

This doesn't need to be perfect — just prevent data loss if they briefly lose connection.

---

## TASK 8: Add Cloud-Related Translations

Add to all 12 language files:

```json
"sudoku": {
  "profile": {
    "level": "Level {level}",
    "xp": "{current}/{next} XP",
    "guest": "Playing as Guest",
    "signInToSave": "Sign in to save progress across devices",
    "statsSynced": "Stats synced to cloud",
    "editNickname": "Edit nickname"
  }
}
```

Translate for all 12 languages.

---

## TASK 9: Verify Build

1. Run `npm run build` — fix any TypeScript errors
2. Check that guest mode still works (no errors without login)
3. Check that the auth flow works (login → profile created → stats display)

## IMPORTANT NOTES
- The Supabase client files are at `src/lib/supabase/client.ts` and `server.ts`
- The AuthContext is at `src/context/AuthContext.tsx`
- The stats manager is at `src/utils/statsManager.ts`
- Guest mode MUST keep working — never require login
- Use `upsert` for sudoku_game_stats (ON CONFLICT user_id, difficulty)
- The sudoku_profiles table already exists with the right schema
- Don't modify the SQL or Supabase tables — they're already set up
- When pushing: `git add app/ src/ messages/` (NOT `git add .` — the nul file breaks it)
