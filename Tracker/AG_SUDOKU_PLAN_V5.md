# 🎮 AG SUDOKU - DEVELOPMENT PLAN V5
**Goal:** Complete feature-rich Sudoku platform with profiles, stats & competition  
**Current Status:** Core game LIVE at sudoku.alexgoiko.com ✅  
**Last Updated:** February 10, 2026

---

## 📍 WHERE WE ARE NOW

### ✅ Completed & Live
- Core Sudoku gameplay (3 difficulties: Medium, Expert, Pro)
- 12-language internationalization (EN, ES, DE, FR, IT, PT, JA, KO, ZH, HI, TL, EU)
- Glassmorphism UI with aurora background
- AI-powered hints with educational explanations
- Auto-save to localStorage
- Custom confirm modals (replacing native browser dialogs)
- Home button during gameplay
- Back to website link (alexgoiko.com)
- Favicon/branding
- Deployed on Vercel at sudoku.alexgoiko.com
- Pro unlock system (beat Expert < 15 min)
- Anti-cheat measures (screenshot blocking, tab detection)

### 🔧 Just Fixed (Feb 10, 2026)
- [x] Custom styled confirm modal (replaces ugly "sudoku.alexgoiko.com says")
- [x] Home button in game header
- [x] "← alexgoiko.com" back button on welcome screen
- [x] Favicon from main site
- [x] Build error fix (TypeScript confirm modal types)

---

## 🎯 STRATEGIC DECISION: BUILD ORDER

### ❌ Wrong Approach: Build everything with localStorage first
Building stats, badges, leaderboards with localStorage means rebuilding them entirely when adding Supabase. Double work.

### ✅ Right Approach: Phased implementation

| Phase | What | Why | Backend Needed? |
|-------|------|-----|-----------------|
| **Phase 1** | Monster Avatars | Visual only, no backend needed | ❌ No |
| **Phase 2** | Local Stats Tracking | Track data locally, migrate later | ❌ No |
| **Phase 3** | Settings Menu | UI preferences, localStorage fine | ❌ No |
| **Phase 4** | Supabase + Auth | Foundation for everything else | ✅ Setup |
| **Phase 5** | Cloud Profiles & Stats | Migrate localStorage → database | ✅ Yes |
| **Phase 6** | Badges & Achievements | Needs persistent storage | ✅ Yes |
| **Phase 7** | Leaderboards | Needs database + multiple users | ✅ Yes |
| **Phase 8** | Monetization (Stripe + Ads) | Needs auth + feature gating | ✅ Yes |

**Key Insight:** Phases 1-3 can happen NOW without any backend. Phase 4 unlocks everything else.

---

## 📅 PHASE 1: MONSTER AVATARS (No Backend) 🎭
**Timeline:** 2-3 days  
**Priority:** HIGH — Visual upgrade, no dependencies

### Avatar Creation Strategy
**Recommended: AI Generation + Polish**
- Use DALL-E 3 / Midjourney for base designs
- Upscale to 512×512px
- Export optimized PNGs (<100KB each)
- Cost: ~$20-30

### Monster Characters (20 Total)

**Free Tier (5):**
1. **Blinky** — One-eyed blue blob
2. **Spiky** — Green hedgehog with puzzle spikes
3. **Puddles** — Orange goo monster
4. **Fuzzy** — Purple furry monster
5. **Squiggles** — Pink tentacle creature

**Premium Tier (15):**
6-20. Professor Numbskull, Glitchy, Aurora, Chompy, Zappy, Bubbles, Crystallo, Fluffy Cloud, Flame, Twinkle, Leafy, Frosty, Shadow, Glow, Sparky

### Implementation Tasks
- [ ] Generate 20 monster designs with AI
- [ ] Optimize images (512×512, <100KB, PNG with transparency)
- [ ] Add to `public/avatars/` folder
- [ ] Replace animal avatar system with monsters
- [ ] Update avatar selection UI
- [ ] Add monster names/descriptions
- [ ] Free vs premium avatar gating (visual only for now — all accessible until monetization)
- [ ] Test on all devices
- [ ] Translate avatar names for all 12 languages

---

## 📅 PHASE 2: LOCAL STATS TRACKING (No Backend) 📊
**Timeline:** 2-3 days  
**Priority:** HIGH — Adds engagement, easy to migrate later

### What to Track (localStorage for now)
```javascript
const localStats = {
  gamesPlayed: { medium: 0, expert: 0, pro: 0 },
  gamesWon: { medium: 0, expert: 0, pro: 0 },
  bestTime: { medium: null, expert: null, pro: null },
  avgTime: { medium: null, expert: null, pro: null },
  totalPlaytime: 0,
  hintsUsed: 0,
  totalMistakes: 0,
  perfectGames: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayDate: null,
};
```

### Implementation Tasks
- [ ] Create stats tracking utility (increment on game events)
- [ ] Hook into win/loss/game complete events in AISudoku.tsx
- [ ] Save to localStorage after each game
- [ ] Create Stats display tab/modal
- [ ] Show: games played, win rate, best times, streaks
- [ ] Simple visual cards (no charts needed yet)
- [ ] Translate all stat labels for 12 languages

### Design Note
Structure the stats data EXACTLY like the future Supabase schema, so migration is a simple copy:
```javascript
// localStorage key: 'ag_sudoku_stats'
// Structure mirrors future game_stats table
```

---

## 📅 PHASE 3: SETTINGS MENU (No Backend) ⚙️
**Timeline:** 1-2 days  
**Priority:** MEDIUM — Nice polish

### Settings to Implement
- [ ] **Theme:** Dark mode (current) / Light mode
- [ ] **Timer:** Show/hide toggle
- [ ] **Notifications:** On/off (for future)
- [ ] **How to Play:** Tutorial/rules modal
- [ ] **Clear Data:** Reset stats with confirmation (uses custom confirm modal)
- [ ] **Language:** Quick language switch (already have selector, add to settings too)
- [ ] **About:** Version, credits, links

### Implementation
- [ ] Create Settings modal/page
- [ ] Store preferences in localStorage
- [ ] Apply theme changes globally
- [ ] Translate all settings labels

---

## 📅 PHASE 4: SUPABASE + AUTH (Backend Foundation) 🔐
**Timeline:** 3-5 days  
**Priority:** CRITICAL — Unlocks all remaining features

### Why Supabase?
- Free tier generous (500MB database, 50K auth users)
- Built-in auth (Google, Apple, email)
- Real-time subscriptions for leaderboards
- PostgreSQL = powerful queries
- Works perfectly with Next.js/Vercel

### Setup Tasks
- [ ] Create Supabase project
- [ ] Create database tables (profiles, game_stats, game_history, achievements, user_achievements)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Install `@supabase/supabase-js` in project
- [ ] Create Supabase client utility
- [ ] Set up environment variables on Vercel

### Auth Implementation
- [ ] Add login/signup UI (modal or page)
- [ ] Google OAuth login
- [ ] Email/password login
- [ ] Guest mode (play without account, limited features)
- [ ] Auth state management (context/provider)
- [ ] Protected routes for profile pages
- [ ] Session persistence
- [ ] Translate all auth UI for 12 languages

### Database Schema
```sql
-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nickname VARCHAR(15) NOT NULL,
  avatar_id VARCHAR(50) DEFAULT 'blinky',
  avatar_color VARCHAR(7) DEFAULT '#4CAF50',
  frame_id VARCHAR(50) DEFAULT 'basic',
  subscription_tier VARCHAR(20) DEFAULT 'free',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  pro_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Statistics (per difficulty)
CREATE TABLE game_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  difficulty VARCHAR(10) NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  avg_time_seconds INTEGER,
  hints_used INTEGER DEFAULT 0,
  mistakes_total INTEGER DEFAULT 0,
  perfect_games INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  UNIQUE(user_id, difficulty)
);

-- Game History (individual games, for leaderboards)
CREATE TABLE game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  difficulty VARCHAR(10) NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_seconds INTEGER NOT NULL,
  mistakes INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  is_win BOOLEAN DEFAULT FALSE,
  is_perfect BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0
);
```

### Guest → Authenticated Migration
When a guest user creates an account:
1. Read localStorage stats
2. Create profile in Supabase
3. Upload stats to database
4. Clear localStorage (or keep as cache)
5. All future stats go to cloud

---

## 📅 PHASE 5: CLOUD PROFILES & STATS (Needs Auth) 👤
**Timeline:** 2-3 days  
**Priority:** HIGH — Core user experience

### Tasks
- [ ] Profile creation flow (nickname, avatar selection)
- [ ] Profile editing UI
- [ ] Migrate localStorage stats → Supabase on login
- [ ] Real-time stat updates after each game
- [ ] Profile page showing all stats
- [ ] Cross-device sync (play on phone, see stats on desktop)
- [ ] Offline queue (save games locally, sync when online)

---

## 📅 PHASE 6: BADGES & ACHIEVEMENTS (Needs Auth) 🏅
**Timeline:** 2-3 days  
**Priority:** MEDIUM — Engagement & retention

### Badge Categories

**Gameplay Badges:**
| Badge | Requirement | XP |
|-------|-------------|-----|
| First Win | Win 1 game | 10 |
| Getting Started | Win 5 games | 25 |
| Dedicated | Win 25 games | 50 |
| Master | Win 100 games | 150 |
| Perfect Game | Win with 0 mistakes | 50 |
| Speed Demon | Win Medium in < 5 min | 75 |
| Expert Solver | Win Expert in < 10 min | 100 |
| No Hints | Win without using hints | 40 |

**Streak Badges:**
| Badge | Requirement | XP |
|-------|-------------|-----|
| On Fire | 3 win streak | 25 |
| Unstoppable | 10 win streak | 75 |
| Legend | 30 win streak | 250 |

**Special Badges:**
| Badge | Requirement | XP |
|-------|-------------|-----|
| Polyglot | Play in 3+ languages | 30 |
| Night Owl | Play 10 games after midnight | 30 |
| Pro Player | Unlock Pro difficulty | 200 |

### XP & Leveling
```javascript
const XP_PER_GAME = { medium: 10, expert: 25, pro: 50 };
const XP_PER_WIN = { medium: 15, expert: 35, pro: 75 };
const PERFECT_BONUS = 25;

// Levels: 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000...
```

### Implementation
- [ ] Create achievements table with seed data
- [ ] Achievement checking logic (after each game)
- [ ] Badge display on profile
- [ ] Achievement unlock notification/animation
- [ ] Badge gallery/collection view
- [ ] Translate all badge names & descriptions

---

## 📅 PHASE 7: LEADERBOARDS (Needs Auth + Multiple Users) 🏆
**Timeline:** 2-3 days  
**Priority:** MEDIUM — Social/competitive engagement

### Leaderboard Types
- **Weekly Top 50** — Resets every Monday
- **Monthly Champions** — Resets 1st of month  
- **All-Time Best** — Permanent
- **Per Difficulty** — Best times for each level

### Implementation
- [ ] Create leaderboard database views
- [ ] Leaderboard UI component
- [ ] Real-time updates (Supabase subscriptions)
- [ ] Top 3 highlighted with special styling
- [ ] User's own rank always visible
- [ ] Filter by difficulty
- [ ] Anti-cheat validation on server side

---

## 📅 PHASE 8: MONETIZATION (Needs Auth) 💰
**Timeline:** 1-2 weeks  
**Priority:** LOWER — Revenue, but needs user base first

### Stripe Subscription
- [ ] Set up Stripe account
- [ ] Create Premium product ($4.99/month or $39.99/year)
- [ ] Checkout integration
- [ ] Webhook handling (subscription events)
- [ ] Feature gating (premium avatars, ad-free, etc.)
- [ ] Subscription management UI
- [ ] Restore purchase

### Ad Integration (Free Users)
- [ ] Google AdMob setup
- [ ] Banner ads (bottom, non-intrusive)
- [ ] Interstitial ads (after every 3-4 games)
- [ ] Never during active gameplay
- [ ] Ad-free for premium subscribers

### Premium Benefits
- ✅ Ad-free experience
- ✅ All 20 monster avatars
- ✅ Premium color palettes
- ✅ Advanced statistics
- ✅ Tournament access (future)
- ✅ Priority support

---

## 📊 TIMELINE SUMMARY

| Week | Phase | What | Backend? |
|------|-------|------|----------|
| **Week 1** | Phase 1 | Monster Avatars | No |
| **Week 1-2** | Phase 2 | Local Stats Tracking | No |
| **Week 2** | Phase 3 | Settings Menu | No |
| **Week 3-4** | Phase 4 | Supabase + Auth Setup | **YES** |
| **Week 4** | Phase 5 | Cloud Profiles & Stats | YES |
| **Week 5** | Phase 6 | Badges & Achievements | YES |
| **Week 5-6** | Phase 7 | Leaderboards | YES |
| **Week 7-8** | Phase 8 | Monetization | YES |

**Total estimated time: 6-8 weeks to full platform**

---

## 🧹 CLEANUP TASKS (Do alongside phases)

### Code Cleanup
- [ ] Remove old Framer-related code files (AG_SUDOKU_FRAMER.tsx etc.)
- [ ] Delete unused Codes/ folder files (old versions)
- [ ] Fix the "nul" file issue in git (Windows reserved filename)
- [ ] Add proper .gitignore entries
- [ ] Clean up any dead imports

### DevOps
- [ ] Set up staging environment on Vercel (preview branches)
- [ ] Add environment variables for Supabase (when ready)
- [ ] Consider adding error tracking (Sentry free tier)

---

## 🎯 IMMEDIATE NEXT STEPS (This Week)

### Tomorrow's Session Goals:
1. **Start Phase 1: Monster Avatars**
   - Choose AI generation tool
   - Generate first 5 free-tier monsters
   - Integrate into game
   
2. **Start Phase 2: Local Stats**
   - Create stats tracking utility
   - Hook into game events
   - Basic stats display

### Questions to Decide:
1. Generate avatars yourself with AI tools, or commission an artist?
2. Guest mode — should users play without account, or require signup?
3. Google login only, or email + Google?
4. Monthly subscription price: $4.99 or lower for launch?

---

## 💡 NOTES

### Why This Order Works
- **Phases 1-3 (No Backend):** Improve the game immediately. Users see visual upgrades and new features right away. No infrastructure needed.
- **Phase 4 (Auth):** One-time setup that unlocks everything. Do it once, do it right.
- **Phases 5-8 (Backend Features):** Build on solid foundation. No rebuilding, no migration headaches.

### Revenue Strategy
- **Month 1-2:** Build user base, all features free
- **Month 3:** Enable ads for free users
- **Month 4:** Launch Premium subscription
- **Month 6+:** Tournaments, competitions

---

**Status:** 🟢 Core game LIVE, ready for feature expansion  
**Next Phase:** Monster Avatars → Local Stats → Settings → Auth  
**Target Full Platform:** Late March 2026

---

**Last Updated:** February 10, 2026  
**Next Session:** Phase 1 - Monster Avatar Creation
