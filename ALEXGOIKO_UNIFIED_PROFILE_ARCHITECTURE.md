# 🌐 ALEXGOIKO UNIFIED PROFILE ARCHITECTURE
**The "sign in once, play everywhere" ecosystem**
Last Updated: February 25, 2026

---

## 🎯 THE VISION

One profile. One avatar. One subscription.
Works across: alexgoiko.com · sudoku.alexgoiko.com · brainsharp.alexgoiko.com · all future products.

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (shared backend)                 │
│                                                             │
│   profiles table: user_id, avatar_id, color_id,            │
│                   loadout_json, subscription_tier,          │
│                   display_name, xp, level                   │
└──────────┬──────────────────────┬──────────────────────────┘
           │                      │                      │
           ▼                      ▼                      ▼
   alexgoiko.com          sudoku.alexgoiko.com    brainsharp.alexgoiko.com
   (goiko-avatar)         (ag-sudoku)             (coming soon)
   
   "Your home base"       Reads profile →          Reads profile →
   Set avatar here        shows YOUR avatar        shows YOUR avatar
   Manage subscription    on welcome screen        on welcome screen
   See all products
```

---

## 🔑 KEY PRINCIPLE: ONE SOURCE OF TRUTH

- **Auth**: Single Supabase project → session cookie works across all `*.alexgoiko.com` subdomains
- **Profile**: Stored once in `profiles` table → all games READ it, only alexgoiko.com WRITES it
- **Subscription**: Stored in `profiles.subscription_tier` → all games CHECK it for Pro features
- **Avatar customization**: Only editable at alexgoiko.com/profile (or modal from any product)

---

## 📍 CURRENT STATE vs TARGET STATE

### AG Sudoku Homepage — Current
```
[Shadow placeholder avatar]  ← hardcoded, not real
[Sign In with Google]        ← works but isolated
[PLAY NOW]
[Medium | Expert | Pro]
```

### AG Sudoku Homepage — Target
```
[YOUR actual avatar]         ← fetched from Supabase profiles
[Andre  · Level 7 ⭐]        ← your display name + XP level  
[PRO badge if subscribed]    ← reads subscription_tier
[PLAY NOW]
[Medium | Expert | Pro]      ← Pro unlocked if PRO tier
[Manage Profile →]           ← links to alexgoiko.com/profile
```

---

## 🏗️ WHAT NEEDS TO BE BUILT (Priority Order)

### Step 1: Central Profile System in goiko-avatar ✅ (in progress)
**Where:** `C:/Users/goiko/Projects/goiko-avatar/`
**What:**
- `AvatarDisplay` component (renders monster + color + accessories)
- Avatar selector modal (pick monster, color, accessories)
- Profile page (`/profile`) — the hub for all customization
- Saves to Supabase `profiles` table

**This is the ONLY place where you edit your avatar.**

---

### Step 2: Shared Avatar Component Package
**Two options:**

**Option A — Copy-sync (simpler, good for now)**
Copy `AvatarDisplay.tsx` + `avatarColors.ts` + `accessories.ts` 
into each game project manually when updated.
Good enough until you have 3+ products.

**Option B — npm package (scalable)**
Create `@alexgoiko/avatar` private npm package.
All products install it as a dependency.
Update once → all products get it.
Recommended when BrainSharp launches.

**For now → Option A. When BrainSharp launches → migrate to Option B.**

---

### Step 3: AG Sudoku — Connect to Central Profile
**Where:** `C:/Users/goiko/Projects/ag-sudoku/`
**Changes needed:**

**3a. Welcome screen (`app/[locale]/page.tsx`)**
- Remove hardcoded Shadow avatar placeholder
- On page load: check Supabase session
- If logged in → fetch `profiles` row → render their `AvatarDisplay`
- If not logged in → show generic "Guest" avatar + "Sign in to save"
- Show display_name + level below avatar
- Show PRO badge if `subscription_tier === 'pro'`
- "Manage Profile" link → `https://alexgoiko.com/profile`

**3b. Feature gating**
- Pro difficulty: check `subscription_tier` from profile
- If not Pro: show upgrade prompt linking to `https://alexgoiko.com/subscribe`
- Challenge Week: check `challenge_week_active` flag

**3c. Win modal**
- Show their actual avatar (the `AvatarDisplay` component) in celebration
- +XP animation → writes XP update back to Supabase profiles

---

### Step 4: Subscription lives on alexgoiko.com
**Where:** `C:/Users/goiko/Projects/goiko-avatar/`
- Stripe checkout at `/subscribe`
- After payment → webhook updates `profiles.subscription_tier = 'pro'`
- ALL products instantly see the Pro tier (they all read the same table)
- No need to set up Stripe separately in ag-sudoku

**This is the huge benefit of centralized auth:**
Set up Stripe ONCE in goiko-avatar → Sudoku, BrainSharp, everything gets Pro automatically.

---

## 🌊 USER JOURNEY (What it feels like)

```
1. User visits alexgoiko.com
   → Sees AG Sudoku, BrainSharp, BGS, coming soon games
   → Creates account (Google OAuth)
   → Picks their monster avatar (Zappy!) + color (Neon) + hat (Crown)
   → Their profile is set ✅

2. User clicks "Play AG Sudoku"
   → Goes to sudoku.alexgoiko.com
   → ALREADY logged in (same Supabase session)
   → Sees THEIR Zappy with Neon color and Crown right on the welcome screen
   → Feels like "this is MY game"

3. User wins Expert in 8:42
   → Win modal shows THEIR Zappy celebrating 🎉
   → +120 XP written to their profile
   → Rank updates on leaderboard with their Zappy avatar

4. User wants to upgrade to PRO
   → Clicks "Go Pro" anywhere (Sudoku, alexgoiko.com, anywhere)
   → Redirected to alexgoiko.com/subscribe
   → Pays once → €2.49/month
   → PRO badge appears everywhere instantly
   → All 20 monsters unlocked, all accessories, Pro difficulty in ALL future games
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1 — goiko-avatar (build first)
- [ ] `AvatarDisplay` component with CSS color system
- [ ] Avatar selector modal (monster + color + accessories tabs)
- [ ] Save loadout to Supabase `profiles` table
- [ ] `/profile` page showing current avatar + edit button
- [ ] Stripe subscription at `/subscribe`
- [ ] Free accessories (8) generated from Gemini
- [ ] Pro accessories (24) generated from Gemini

### Phase 2 — ag-sudoku (connect)
- [ ] Copy `AvatarDisplay` component into project
- [ ] Welcome screen fetches profile from Supabase
- [ ] Renders actual user avatar (not placeholder)
- [ ] Pro difficulty gates on `subscription_tier`
- [ ] Win modal uses `AvatarDisplay` for celebration
- [ ] "Manage Profile" link → alexgoiko.com/profile
- [ ] "Go Pro" link → alexgoiko.com/subscribe

### Phase 3 — BrainSharp (repeat pattern)
- [ ] Copy `AvatarDisplay` component
- [ ] Same profile fetch pattern as ag-sudoku
- [ ] Done in ~1 day since pattern is established

---

## 🗂️ SUPABASE TABLE REFERENCE

```sql
-- profiles table (already exists, may need columns added)
CREATE TABLE profiles (
  user_id       UUID PRIMARY KEY REFERENCES auth.users,
  display_name  TEXT,
  avatar_id     TEXT DEFAULT 'shadow',      -- which monster
  color_id      TEXT DEFAULT 'original',    -- which color filter
  loadout_json  JSONB DEFAULT '{}',         -- accessories per slot
  subscription_tier TEXT DEFAULT 'free',    -- 'free' | 'pro'
  xp            INTEGER DEFAULT 0,
  level         INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ⚡ FIRST CLAUDE CODE PROMPT (for goiko-avatar)

```
Read AG_SUDOKU_PLAN_V7_PRO_FEATURES.md and this architecture doc.

Build the central avatar system for alexgoiko.com:

1. Create src/components/avatar/AvatarDisplay.tsx
   - Props: avatarId, colorId, loadout, size (32|48|72|96|128), 
     animated, showFrame, showName, showBadge
   - Renders base avatar PNG from /public/avatars/{avatarId}.png
   - Applies CSS filter for colorId (use the filter values from the plan)
   - Stacks accessory PNGs as absolute-positioned layers
   - Renders frame as CSS border/gradient

2. Create src/data/avatarColors.ts
   - 5 free colors + 10 pro colors with CSS filter strings

3. Create src/data/accessories.ts  
   - Define 8 free + 24 pro accessory slots (no images yet, just data)

4. Update app/[locale]/profile/page.tsx
   - Show current avatar using AvatarDisplay (128px)
   - "Edit Avatar" button opens AvatarSelector modal
   - Saves to Supabase profiles table

5. Create AvatarSelector modal component
   - Tabs: Monster | Color | Accessories | Frame
   - Pro items show lock icon for free users
   - Live preview as user selects options
```

---

**Status:** Architecture defined — start with goiko-avatar Phase 1  
**Next:** Run the Claude Code prompt above in goiko-avatar project  
**Then:** Copy AvatarDisplay to ag-sudoku and connect to profile
