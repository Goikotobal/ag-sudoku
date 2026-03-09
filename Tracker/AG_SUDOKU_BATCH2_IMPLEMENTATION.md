# 🎮 AG SUDOKU — IMPLEMENTATION BATCH 2
**Based on:** Live review of sudoku.alexgoiko.com — February 25, 2026  
**Status:** SSO partially working (name showing ✅, avatar not synced yet ⚠️)

---

## FIX 1 — Profile Sync (Avatar from Homepage)

**Problem:** Name shows "Alex Goikoetxea" but avatar still shows the local Sudoku placeholder, not the one chosen on alexgoiko.com.

**Fix:** When fetching the profile from Supabase on welcome screen load, also read `avatar_id`, `color_id`, and `loadout_json` from the `profiles` table and pass them to the avatar display component.

```ts
// In app/[locale]/page.tsx — profile fetch
const { data: profile } = await supabase
  .from('profiles')
  .select('display_name, avatar_id, color_id, loadout_json, subscription_tier, xp, level')
  .eq('user_id', session.user.id)
  .single()

// Then render:
<AvatarDisplay
  avatarId={profile.avatar_id ?? 'shadow'}
  colorId={profile.color_id ?? 'original'}
  loadout={profile.loadout_json ?? {}}
  size={72}
  showFrame={true}
  showBadge={profile.subscription_tier === 'pro'}
/>
```

**Also:** If `profiles` table doesn't have `avatar_id` column yet, add it:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT 'shadow';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS color_id TEXT DEFAULT 'original';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS loadout_json JSONB DEFAULT '{}';
```

---

## FIX 2 — Display Name + Avatar Click Behavior

**Problem A:** Showing full name "Alex Goikoetxea" — should show short/display name only.

**Fix:** Use `display_name` field from profiles table. If not set, use first name only from Google (`session.user.user_metadata.full_name?.split(' ')[0]`). Max 15 characters displayed.

```ts
const shortName = profile?.display_name 
  ?? session.user.user_metadata?.full_name?.split(' ')[0] 
  ?? 'Player'
```

**Problem B:** Clicking avatar opens old internal Sudoku avatar selector — this needs to be removed entirely.

**Fix:** 
- Remove the old AvatarSelector modal from the welcome screen
- Replace with a simple "✏️ Edit Avatar" text button below the name
- This button links to `https://alexgoiko.com/profile` (opens same tab)
- Tooltip or subtext: "Manage your profile on AlexGoiko.com"

```tsx
// Replace avatar click handler with:
<a href="https://alexgoiko.com/profile" className="text-xs text-white/50 hover:text-white/80 mt-1">
  ✏️ Edit Avatar & Profile
</a>
```

---

## FIX 3 — Button Labels: PLAY → then difficulty → PLAY NOW

**Welcome screen (first screen):**
- Change "PLAY NOW" button → **"PLAY"**
- Subtext below button: "Choose your difficulty"

**Difficulty selection screen (second screen, already exists):**
- Keep "PLAY NOW" here — this is correct, it actually starts the game

---

## FIX 4 — Avatar in Game Header

**Where:** Inside the active game (top right area, where the profile badge currently is)

**What to show:**
```
┌─────────────────────────────────────────────────┐
│  ⏱ 08:42          [Avatar 32px] Alex  ⭐ Lv7   │
│  ❌ 1/3 mistakes                    [PRO badge] │
└─────────────────────────────────────────────────┘
```

**Implementation:**
- Add `AvatarDisplay` (size=32) in top right of game header
- Show `shortName` next to it
- Show level badge if logged in
- Show PRO badge if `subscription_tier === 'pro'`
- Clicking it does NOT open selector — links to alexgoiko.com/profile
- If guest (not logged in) → show generic avatar icon, no name

---

## FIX 5 — Difficulty Rules & Hint System

### New Rules Table

| Difficulty | Tier | Max Errors | Hints Available | Notes |
|------------|------|-----------|-----------------|-------|
| Medium | Free & Pro | 3 | 3 | Everyone |
| Expert | Free | 1 | 1 | Standard free |
| Expert | Pro | 1 | 3 | Extra hints reward |
| Pro | **Pro ONLY** | 0 | 2 | One mistake = game over |

**Implementation:**
```ts
// src/utils/difficultyRules.ts
export function getDifficultyRules(difficulty: string, isPro: boolean) {
  if (difficulty === 'medium') return { maxErrors: 3, maxHints: 3 }
  if (difficulty === 'expert') return { maxErrors: 1, maxHints: isPro ? 3 : 1 }
  if (difficulty === 'pro') {
    if (!isPro) return null // blocked — show upgrade modal
    return { maxErrors: 0, maxHints: 2 }
  }
}
```

**Pro difficulty gate:**
- If user is free tier and clicks Pro → show UpgradeModal
- UpgradeModal explains Pro difficulty rules + link to alexgoiko.com/subscribe
- If user is Pro subscriber → unlocked immediately

### Hint Quality — Named Techniques

Each hint must explain the **named Sudoku technique** being used. The explanation should be educational and clear.

**Technique names to use (in order of complexity):**

| Technique | When to show | Explanation template |
|-----------|-------------|---------------------|
| **Naked Single** | Only one number can go in this cell | "This cell can only be [N] — all other numbers already appear in its row, column, or box." |
| **Hidden Single** | Only one cell in a row/col/box can take this number | "The number [N] can only go in this cell within this [row/column/box] — every other cell already has a conflict." |
| **Naked Pair** | Two cells share the same two candidates | "Cells [A] and [B] can only contain [X] or [Y]. This eliminates [X,Y] from all other cells in their [row/column/box]." |
| **Pointing Pair** | Candidates in a box all point to one line | "All possible [N]s in this box are in the same [row/column], so [N] can be removed from the rest of that [row/column]." |
| **Box/Line Reduction** | Line candidates confined to one box | "All [N]s in this [row/column] are within the same box, eliminating [N] from other cells in that box." |

**Hint modal design:**
```
┌──────────────────────────────────┐
│  💡 HINT — Naked Single          │  ← technique name
│                                   │
│  Cell [R4, C7]                   │
│                                   │
│  [Visual: 3x3 mini-grid showing  │
│   the target cell highlighted    │
│   yellow, conflicts in red]      │
│                                   │
│  "This cell can only be 6 —      │
│   all other numbers already      │
│   appear in its row, column,     │
│   and box."                      │
│                                   │
│  [  Got it ✓  ]                  │
└──────────────────────────────────┘
```

---

## FIX 6 — Monthly Challenge Week + 1v1 + Leaderboard

### A. Monthly Challenge Week (Last week of every month)

**Who:** Free tier players  
**When:** Last 7 days of each month  
**Difficulty:** Expert rules (1 error, 1 hint — same as free Expert)  
**Daily attempts:** 3 per day (resets at midnight)

**Qualifying condition:**  
Complete Expert puzzle in **under 9 minutes** → earn discount reward

**Rewards if qualified (under 9 min):**
- Monthly Pro: **€2.99/month** (regular €3.99, save €1)
- Yearly Pro: **€25.99/year** (regular €39.99, save €14)
- Discount valid for 48 hours after qualifying
- Shown as promo code or direct Stripe checkout with discount applied

**UI — Challenge Week Banner (shows during last week of month):**
```
┌──────────────────────────────────────────────┐
│  🏆 PRO CHALLENGE WEEK                        │
│  3 days left · Beat Expert in <9 min         │
│  → Unlock discounted PRO subscription        │
│  [  Enter Challenge  ]   Attempts today: 2/3 │
└──────────────────────────────────────────────┘
```

**Win modal variant during Challenge Week (qualified):**
```
┌──────────────────────────────────────────────┐
│  🎉 QUALIFIED!  Time: 7:43                   │
│                                              │
│  [User Avatar]  You beat the challenge!      │
│                                              │
│  ✅ Under 9 minutes — you've earned          │
│     discounted PRO access!                   │
│                                              │
│  Monthly: €2.99/mo  Yearly: €25.99/yr        │
│  (Offer expires in 47:52)                    │
│                                              │
│  [  Claim Discount  ]  [  Play Again  ]      │
└──────────────────────────────────────────────┘
```

**Win modal variant (not qualified — over 9 min):**
```
│  ⏱ Time: 11:22 — So close!                  │
│  Beat it in under 9:00 to earn PRO discount  │
│  Attempts remaining today: 1                  │
│  [  Try Again  ]  [  Back  ]                 │
```

**Database fields needed:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  challenge_attempts_today INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  challenge_attempts_reset_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  challenge_qualified_until TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  challenge_best_time INTEGER; -- seconds
```

**Helper function:**
```ts
export function isChallengeWeek(): boolean {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return now.getDate() >= lastDay - 6 // last 7 days
}

export function hasAttemptsLeft(profile: Profile): boolean {
  const today = new Date().toISOString().split('T')[0]
  if (profile.challenge_attempts_reset_date !== today) return true // new day
  return (profile.challenge_attempts_today ?? 0) < 3
}
```

---

### B. 1v1 Pro Challenge (Pro subscribers only)

**Who:** Pro subscribers only  
**Format:** Real-time or async — same puzzle, best time wins  
**Challenger chooses:** Which difficulty to use (Expert or Pro)

**Flow:**
```
Pro user → "Challenge a Friend" button
→ Choose difficulty (Expert or Pro)  
→ Share challenge link (https://sudoku.alexgoiko.com/challenge/[code])
→ Opponent clicks link → must be logged in (Pro or Free — TBD)
→ Both solve the SAME generated puzzle
→ Result shows: both avatars, both times, winner highlighted
```

**Challenge result screen:**
```
┌──────────────────────────────────┐
│  🥊 CHALLENGE RESULT             │
│                                   │
│  [Your Avatar]    [Their Avatar]  │
│  Andre            PuzzleKing      │
│  ⏱ 6:22          ⏱ 7:45         │
│                                   │
│  🏆 YOU WIN!                     │
│                                   │
│  [  Challenge Again  ]           │
│  [  Share Result     ]           │
└──────────────────────────────────┘
```

**Database:**
```sql
CREATE TABLE sudoku_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID REFERENCES profiles(user_id),
  opponent_id UUID REFERENCES profiles(user_id),
  puzzle_data JSONB NOT NULL,
  difficulty TEXT NOT NULL,
  challenger_time INTEGER, -- seconds, null until completed
  opponent_time INTEGER,
  status TEXT DEFAULT 'pending', -- pending | completed | expired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);
```

---

### C. Quarterly Leaderboard Competition (Pro subscribers)

**Frequency:** Every 3 months  
**Who:** Pro subscribers only  
**Prize:** 3 months free Pro subscription for top 3

**Format:**
- Track best Expert or Pro times over the full 3-month period
- Leaderboard visible to all, competing limited to Pro
- Countdown timer to end of quarter
- Top 3 at cutoff date get 3 months free automatically applied

**Leaderboard panel during competition:**
```
┌─────────────────────────────────────┐
│  🏆 QUARTERLY CHAMPIONSHIP          │
│  Q1 2026 · Ends March 31            │
│  Prize: 3 months FREE PRO           │
│  ─────────────────────────────────  │
│  🥇 [Avtr] AlexGoiko    4:22 Expert │
│  🥈 [Avtr] ProKing      5:11        │
│  🥉 [Avtr] NumbSharp    5:43        │
│  ─────────────────────────────────  │
│  #47 [Avtr] YOU         7:34        │
│  ─────────────────────────────────  │
│  43 days remaining                  │
└─────────────────────────────────────┘
```

---

## IMPLEMENTATION ORDER (for Claude Code)

Run these as separate Claude Code sessions:

**Session 1 — Quick fixes (1-2 hours):**
- Fix 1: Avatar sync from Supabase profiles
- Fix 2: Short display name + remove old avatar selector + Edit Profile link
- Fix 3: PLAY button label change

**Session 2 — Game improvements (2-3 hours):**
- Fix 4: Avatar in game header
- Fix 5: Difficulty rules table + hint technique names + hint modal redesign

**Session 3 — Challenge Week (3-4 hours):**
- Fix 6A: isChallengeWeek() utility
- Challenge Week banner on welcome screen
- Challenge game mode (3 attempts/day tracking)
- Qualified/not-qualified win modal variants
- Discount promo code generation

**Session 4 — 1v1 + Leaderboard (separate doc needed):**
- Fix 6B: 1v1 challenge system
- Fix 6C: Quarterly leaderboard
- These are bigger features — plan separately

---

## PRICING REFERENCE

| Plan | Regular | Challenge Week Discount | Savings |
|------|---------|------------------------|---------|
| Monthly Pro | €3.99/mo | €2.99/mo | -€1 |
| Yearly Pro | €39.99/yr | €25.99/yr | -€14 |

Discounts applied via Stripe coupon codes, valid 48h after qualifying.

---

**Status:** Ready for Claude Code — start with Session 1  
**Priority:** Fix 1 (avatar sync) is blocking the whole ecosystem feel  
**Biggest UX win:** Challenge Week — free taste of competition drives conversions
