# 🎮 AG SUDOKU - DEVELOPMENT PLAN V6
**Goal:** Full-featured competitive Sudoku platform with avatar customization, achievements & monetization  
**Current Status:** Core game LIVE + Supabase Auth connected + 20 Monster Avatars generated  
**URL:** sudoku.alexgoiko.com  
**Last Updated:** February 16, 2026

---

## 📍 WHERE WE ARE NOW (Feb 16, 2026)

### ✅ Completed & Live
- Core Sudoku gameplay (3 difficulties: Medium, Expert, Pro)
- 12-language internationalization (EN, ES, DE, FR, IT, PT, JA, KO, ZH, HI, TL, EU)
- Glassmorphism UI with aurora background
- AI-powered hints with educational explanations
- Auto-save to localStorage
- Custom confirm modals (styled, replacing native browser dialogs)
- Home button during gameplay + back to website link
- Favicon/branding
- Deployed on Vercel at sudoku.alexgoiko.com
- Pro unlock system (beat Expert < 15 min)
- Anti-cheat measures (screenshot blocking, tab detection)

### ✅ Just Completed (Feb 16, 2026)
- [x] Local Stats Tracking system (localStorage, mirrors Supabase schema)
- [x] Settings Menu (theme, timer toggle, highlight numbers, auto-remove notes, how-to-play)
- [x] Supabase Auth integration (same project as alexgoiko.com)
- [x] Database tables created (sudoku_profiles, sudoku_game_stats, sudoku_game_history, sudoku_achievements, sudoku_user_achievements)
- [x] Auth callback route + LoginButton component
- [x] Environment variables on Vercel
- [x] Auth redirect URLs configured
- [x] 20 Monster Avatar images generated (stored in Avatars/ folder)

### 🔜 Ready to Implement
- Avatar images need to be integrated into the game UI
- Avatar customization system (colors, accessories, frames)
- Cloud profiles & stats migration
- Badges & achievements
- Leaderboards
- Subscription integration

---

## 🎯 REMAINING PHASES

| Phase | What | Status | Priority |
|-------|------|--------|----------|
| **Phase 5** | Avatar Integration + Customization | 🔜 NEXT | 🔴 HIGH |
| **Phase 6** | Cloud Profiles & Stats | Pending | 🔴 HIGH |
| **Phase 7** | Badges & Achievements + XP/Levels | Pending | 🟡 MEDIUM |
| **Phase 8** | Leaderboards | Pending | 🟡 MEDIUM |
| **Phase 9** | 1v1 Challenges | Pending | 🟡 MEDIUM |
| **Phase 10** | Monetization (Stripe + Ads) | Pending | 🟢 LATER |
| **Phase 11** | PWA + App Stores | Pending | 🟢 LATER |

---

## 📅 PHASE 5: AVATAR INTEGRATION + CUSTOMIZATION SYSTEM 🎭
**Timeline:** 3-5 days  
**Priority:** HIGH — Visual identity for users

### 5A: Basic Avatar Integration (Day 1-2)

#### Copy & Optimize Images
- [ ] Copy 20 PNGs from `Avatars/` to `public/avatars/`
- [ ] Rename to kebab-case: `blinky.png`, `professor-numbskull.png`, `fluffy-cloud.png`, etc.
- [ ] Optimize file sizes (<100KB each)

#### Create Avatar Data System
- [ ] Create `src/data/avatars.ts` with all 20 monsters defined
- [ ] Each avatar: id, name, image path, tier (free/premium), personality, category

#### Avatar Selection UI
- [ ] Grid layout (4 per row desktop, 3 mobile)
- [ ] Free avatars selectable by all
- [ ] Premium avatars show ⭐ PRO badge (selectable for now, locked when monetization is live)
- [ ] Selected avatar has glowing border
- [ ] Saves to localStorage + Supabase (if logged in)

#### Welcome Screen & Game Header
- [ ] Replace generic profile icon with selected monster avatar
- [ ] Avatar clickable to open selector
- [ ] Small avatar in game header during gameplay

### 5B: Avatar Customization Layers (Day 3-5)

#### Layer System Architecture
The avatar is rendered as stacked layers, composited in the browser:

```
┌─────────────────────┐
│   Layer 4: Frame     │  ← Border around entire avatar
│  ┌─────────────────┐│
│  │ Layer 3: Acces. ││  ← Glasses, hats, items on top
│  │ ┌─────────────┐ ││
│  │ │ Layer 2:    │ ││  ← CSS filter color tint
│  │ │ Color Tint  │ ││
│  │ │ ┌─────────┐ │ ││
│  │ │ │ Layer 1 │ │ ││  ← Base monster PNG
│  │ │ │  Base   │ │ ││
│  │ │ └─────────┘ │ ││
│  │ └─────────────┘ ││
│  └─────────────────┘│
└─────────────────────┘
```

#### Layer 1: Base Monster (DONE ✅)
- 20 monster PNGs generated
- 5 free, 15 premium

#### Layer 2: Color Tint/Skin
**Implementation:** CSS `filter: hue-rotate()` + `saturate()` applied to base image  
**No extra images needed!**

| Color | CSS Filter | Unlock |
|-------|-----------|--------|
| Original | none | Free (default) |
| Blue | `hue-rotate(0deg)` | Free |
| Green | `hue-rotate(90deg)` | Free |
| Orange | `hue-rotate(30deg)` | Free |
| Purple | `hue-rotate(270deg)` | Free |
| Pink | `hue-rotate(320deg)` | Free |
| Gold | `hue-rotate(45deg) saturate(1.5)` | Premium |
| Silver | `grayscale(50%) brightness(1.3)` | Premium |
| Neon Cyan | `hue-rotate(180deg) saturate(2)` | Premium |
| Neon Pink | `hue-rotate(300deg) saturate(2)` | Premium |
| Rainbow | CSS animation cycling hue-rotate | Premium |
| Holographic | CSS shimmer animation | Achievement: 100 wins |
| Lava | CSS pulsing red-orange glow | Achievement: 30 win streak |
| Ice Crystal | CSS frost effect + brightness | Achievement: Perfect Game x10 |
| Midnight | `brightness(0.3) contrast(1.5)` | Achievement: Night Owl |

#### Layer 3: Accessories 🎩
**Implementation:** Small transparent PNG overlaid on avatar with absolute positioning

**Smart Items (Sudoku-themed):**
| Accessory | Image | Unlock |
|-----------|-------|--------|
| Round Glasses | `glasses-round.png` | Free |
| Square Glasses | `glasses-square.png` | Level 5 |
| Monocle | `monocle.png` | Level 15 |
| Pencil Behind Ear | `pencil.png` | Win 10 games |
| Calculator | `calculator.png` | Level 25 |
| Graduation Cap | `grad-cap.png` | Win 100 games |
| Crown | `crown.png` | Weekly #1 leaderboard |
| Diamond Crown | `diamond-crown.png` | Monthly #1 leaderboard |

**Fun Items:**
| Accessory | Image | Unlock |
|-----------|-------|--------|
| Party Hat | `party-hat.png` | First Win |
| Headband | `headband.png` | Level 3 |
| Bow Tie | `bow-tie.png` | Level 10 |
| Headphones | `headphones.png` | Play 50 games |
| Bandana | `bandana.png` | 5 win streak |
| Sunglasses | `sunglasses.png` | Premium |
| Top Hat | `top-hat.png` | Premium |
| Wizard Hat | `wizard-hat.png` | Level 50 |

**Generation Plan:** Create ~16 accessory PNGs with DALL-E/Gemini
- Small icons, transparent background
- Consistent style matching monsters
- Positioned relative to avatar (top of head for hats, eyes for glasses)

#### Layer 4: Frames/Borders 🖼️
**Implementation:** CSS border/SVG around the avatar container

| Frame | Style | Unlock |
|-------|-------|--------|
| Basic | Thin white border | Free (default) |
| Bronze | Bronze gradient border | Level 5 |
| Silver | Silver shimmer border | Level 10 |
| Gold | Gold gradient border | Level 25 |
| Platinum | Platinum glow border | Level 50 |
| Diamond | Diamond sparkle animation | Level 100 |
| 🔥 Fire | Animated fire border | 10 win streak |
| ❄️ Ice | Frosted crystal border | 50 Expert wins |
| ⚡ Electric | Crackling lightning border | 25 Pro wins |
| 🌈 Rainbow | Animated rainbow border | Premium |
| 👑 Champion | Crown + gold border | Weekly #1 |
| 🏆 Legend | Animated trophy border | Monthly #1 |
| ⭐ Perfect | Star sparkle border | 10 perfect games |

**Implementation:** Pure CSS — no images needed!
```css
.frame-gold { border: 3px solid transparent; background: linear-gradient(...) border-box; }
.frame-fire { animation: fire-glow 1s infinite; box-shadow: 0 0 10px orange; }
.frame-diamond { animation: sparkle 2s infinite; }
```

#### Avatar Preview Component
- [ ] Create `AvatarRenderer` component that composites all 4 layers
- [ ] Real-time preview as user customizes
- [ ] Shows locked items with lock icon + unlock requirement
- [ ] Smooth transitions when changing options

#### Avatar Data Structure (Supabase)
```typescript
// Already in sudoku_profiles table:
// avatar_id VARCHAR(50) — base monster
// avatar_color VARCHAR(7) — color code
// frame_id VARCHAR(50) — frame type

// Need to add:
// avatar_accessory VARCHAR(50) — accessory item
// avatar_color_filter VARCHAR(100) — CSS filter string
```

---

## 📅 PHASE 6: CLOUD PROFILES & STATS 👤
**Timeline:** 2-3 days  
**Priority:** HIGH — Core user experience  
**Requires:** Supabase Auth (✅ DONE)

### Tasks
- [ ] Profile creation flow on first login
  - Choose nickname (max 15 chars)
  - Select avatar
  - Optional: choose color + accessory
- [ ] Profile page/modal showing all user info
- [ ] Migrate localStorage stats → Supabase on login
- [ ] Real-time stat updates after each game (write to Supabase)
- [ ] Fallback: if offline, queue locally and sync when back online
- [ ] Profile editing (change nickname, avatar, colors anytime)
- [ ] Cross-device sync (play on phone, see stats on desktop)
- [ ] Guest mode still works — localStorage only, prompt to sign up

### Stats to Sync
- Games played/won per difficulty
- Best times per difficulty
- Current & longest streaks
- Total playtime
- Hints used, mistakes, perfect games

---

## 📅 PHASE 7: BADGES & ACHIEVEMENTS + XP/LEVELS 🏅
**Timeline:** 3-4 days  
**Priority:** MEDIUM — Engagement & retention  
**Requires:** Cloud Profiles (Phase 6)

### XP System

#### XP Earning
| Action | Medium | Expert | Pro |
|--------|--------|--------|-----|
| Play a game | 10 XP | 25 XP | 50 XP |
| Win a game | +15 XP | +35 XP | +75 XP |
| Perfect game (0 mistakes) | +25 bonus | +25 bonus | +25 bonus |
| No hints used | +10 bonus | +10 bonus | +10 bonus |
| Fast completion (<5 min) | +20 bonus | +30 bonus | +50 bonus |

#### Level Thresholds
| Level | Total XP | Title | Unlocks |
|-------|----------|-------|---------|
| 1 | 0 | Beginner | Basic frame, 5 free avatars |
| 3 | 150 | Novice | Headband accessory |
| 5 | 400 | Learner | Square glasses, Bronze frame |
| 10 | 1,000 | Player | Bow tie, Silver frame |
| 15 | 2,000 | Solver | Monocle |
| 20 | 3,500 | Expert | — |
| 25 | 5,500 | Master | Calculator, Gold frame |
| 30 | 8,000 | Champion | — |
| 40 | 12,000 | Grandmaster | — |
| 50 | 18,000 | Legend | Wizard hat, Platinum frame |
| 75 | 30,000 | Mythic | — |
| 100 | 50,000 | Immortal | Diamond frame |

### Achievement Badges (already seeded in database)

#### Gameplay Badges
| Badge | Icon | Requirement | XP Reward | Unlocks |
|-------|------|-------------|-----------|---------|
| First Win | 🏆 | Win 1 game | 10 | Party hat accessory |
| Getting Started | ⭐ | Win 5 games | 25 | — |
| Pencil Pusher | ✏️ | Win 10 games | 30 | Pencil accessory |
| Dedicated | 💪 | Win 25 games | 50 | — |
| Headphones Hero | 🎧 | Play 50 games | 40 | Headphones accessory |
| Master | 👑 | Win 100 games | 150 | Graduation cap |
| Perfect Game | 💎 | Win with 0 mistakes | 50 | — |
| Perfect Ten | 💎✨ | 10 perfect games | 100 | Perfect star frame |
| Speed Demon | ⚡ | Win Medium < 5 min | 75 | — |
| Expert Solver | 🧠 | Win Expert < 10 min | 100 | — |
| No Hints | 🎯 | Win without hints | 40 | — |

#### Streak Badges
| Badge | Icon | Requirement | XP Reward | Unlocks |
|-------|------|-------------|-----------|---------|
| On Fire | 🔥 | 3 win streak | 25 | Bandana accessory |
| Hot Streak | 🔥🔥 | 7 win streak | 50 | — |
| Unstoppable | 💥 | 10 win streak | 75 | Fire frame |
| Legend | 🌟 | 30 win streak | 250 | Lava color |

#### Special Badges
| Badge | Icon | Requirement | XP Reward | Unlocks |
|-------|------|-------------|-----------|---------|
| Polyglot | 🌍 | Play in 3+ languages | 30 | — |
| Night Owl | 🦉 | 10 games after midnight | 30 | Midnight color |
| Pro Player | 💀 | Unlock Pro difficulty | 200 | — |
| Ice Cold | ❄️ | 50 Expert wins | 150 | Ice frame |
| Pro Legend | ⚡ | 25 Pro wins | 200 | Electric frame |

### Implementation
- [ ] Achievement checking logic (runs after each game)
- [ ] Achievement unlock notification (animated popup in-game)
- [ ] Badge gallery on profile (show earned + locked with requirements)
- [ ] XP bar + level display on profile and welcome screen
- [ ] Level-up animation/notification
- [ ] Translate all badge names & descriptions (12 languages)

---

## 📅 PHASE 8: LEADERBOARDS 🏆
**Timeline:** 2-3 days  
**Priority:** MEDIUM — Competitive engagement  
**Requires:** Cloud Profiles (Phase 6)

### Leaderboard Types

#### Weekly Leaderboard (resets every Monday)
- Top 50 players by XP earned that week
- #1 gets: Crown accessory + Champion frame (for the week)
- Top 3 highlighted with gold/silver/bronze

#### Monthly Champions (resets 1st of month)
- Top 20 players by total XP earned that month
- #1 gets: Diamond crown + Legend frame (permanent!)
- Special monthly badge

#### Best Times (permanent)
- Fastest completion per difficulty
- Medium Top 20, Expert Top 20, Pro Top 20
- Shows: player name, avatar, time, date

#### All-Time Rankings
- Total XP (all time)
- Total wins
- Longest streak ever

### Leaderboard UI
- [ ] Tab-based view (Weekly | Monthly | Best Times | All-Time)
- [ ] Each entry shows: rank, avatar (with frame), nickname, score/time
- [ ] Current user always visible (even if not in top 50)
- [ ] Real-time updates (Supabase subscriptions)
- [ ] Difficulty filter for Best Times
- [ ] Pull-to-refresh on mobile
- [ ] Accessible from welcome screen

### Anti-Cheat for Leaderboards
- [ ] Server-side validation of game times (reject impossibly fast times)
- [ ] Minimum cell-fill rate check
- [ ] Flag suspicious patterns
- [ ] Manual review for top 10 positions

---

## 📅 PHASE 9: 1v1 CHALLENGES ⚔️
**Timeline:** 5-7 days  
**Priority:** MEDIUM — Social competitive feature  
**Requires:** Leaderboards (Phase 8)

### How 1v1 Works
1. Player A creates a challenge (selects difficulty)
2. System generates ONE puzzle
3. Player A plays it, time recorded
4. Player B receives the challenge (notification or link)
5. Player B plays the SAME puzzle
6. Whoever finishes faster (with fewer mistakes as tiebreaker) wins
7. Winner gets bonus XP

### Challenge Types

| Type | How It Works | XP Reward |
|------|-------------|-----------|
| **Friend Challenge** | Share link, specific opponent | Winner: 50 XP |
| **Random Match** | Matchmaking by level range | Winner: 75 XP |
| **Rematch** | Instant rematch after a game | Winner: 50 XP |

### Challenge Flow
```
Player A                          Player B
────────                          ────────
Create Challenge ──────────────── Receives notification
Select difficulty                 Views challenge details
Play puzzle ─────────────────────  Plays SAME puzzle
Wait for result                   Completes puzzle
        ← ─── Results shown to both ── →
        Winner announced, XP awarded
        Option to rematch
```

### Implementation
- [ ] Create `sudoku_challenges` table
- [ ] Challenge creation UI (from profile or welcome screen)
- [ ] Share challenge link (copy URL, social media)
- [ ] Challenge inbox (see pending challenges)
- [ ] Same-puzzle generation (seeded random for fairness)
- [ ] Results comparison screen
- [ ] Challenge history
- [ ] Premium only? Or limited free challenges (3/week free, unlimited premium)

### Database Table
```sql
CREATE TABLE sudoku_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID REFERENCES auth.users(id),
  opponent_id UUID REFERENCES auth.users(id), -- NULL for open challenges
  difficulty VARCHAR(10) NOT NULL,
  puzzle_seed VARCHAR(100) NOT NULL, -- Same puzzle for both
  puzzle_data JSONB NOT NULL, -- Board + solution
  challenger_time INTEGER, -- seconds
  challenger_mistakes INTEGER,
  opponent_time INTEGER,
  opponent_mistakes INTEGER,
  winner_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed, expired
  xp_reward INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '48 hours',
  completed_at TIMESTAMPTZ
);
```

---

## 📅 PHASE 10: MONETIZATION 💰
**Timeline:** 1-2 weeks  
**Priority:** Revenue generation  
**Requires:** All above features for maximum value

### Subscription Tiers

#### Free Tier
| Feature | Access |
|---------|--------|
| All 3 difficulties | ✅ Full |
| AI hints | ✅ Full |
| Auto-save | ✅ Full |
| 5 free monster avatars | ✅ |
| 5 basic colors | ✅ |
| 3 free accessories | ✅ |
| Basic frame | ✅ |
| Basic stats | ✅ |
| View leaderboards | ✅ |
| 3 challenges per week | ✅ |
| Ads | Banner + interstitial |

#### Premium Subscription (AG Games Premium)
**Pricing:** €3.99/month or €29.99/year (covers ALL AG Games)

| Feature | Access |
|---------|--------|
| Everything in Free | ✅ |
| All 20 monster avatars | ✅ |
| All 15+ colors (including animated) | ✅ |
| All accessories | ✅ (level-locked ones still require level) |
| Premium frames (Rainbow, animated) | ✅ |
| Advanced statistics & charts | ✅ |
| Compete on leaderboards (ranked) | ✅ |
| Unlimited 1v1 challenges | ✅ |
| Cloud sync across devices | ✅ |
| Ad-free experience | ✅ |
| Priority support | ✅ |
| **BGS comic series access** | ✅ (when launched) |
| **Future AG Games included** | ✅ |

### Key Monetization Principles
1. **Gameplay is NEVER paywalled** — all difficulties, hints, core game always free
2. **Cosmetics & convenience** are premium — avatars, colors, frames, ad-free
3. **Competition access** is premium — leaderboard ranking, unlimited challenges
4. **One subscription for ALL AG products** — Sudoku, BGS, future games
5. **Earned items stay earned** — level unlocks work for free AND premium users
6. **Premium = more options, not more power** — no gameplay advantage

### Implementation
- [ ] Stripe integration (checkout, webhooks, subscription management)
- [ ] Check `profiles.subscription_tier` from main site
- [ ] Feature gating utility (`canAccess(feature, user)`)
- [ ] Upgrade prompt UI (tasteful, not aggressive)
- [ ] Link to alexgoiko.com/pricing for subscription management
- [ ] Google AdMob for free tier (banner bottom, interstitial every 3-4 games)
- [ ] Ad-free for premium users

---

## 📅 PHASE 11: PWA + APP STORES 📱
**Timeline:** 1-2 weeks  
**Priority:** Growth & distribution

### Progressive Web App (PWA)
- [ ] Add manifest.json (app name, icons, colors)
- [ ] Service worker for offline caching
- [ ] "Add to Home Screen" prompt
- [ ] Splash screen with AG branding
- [ ] Works offline (already does with localStorage!)
- [ ] Push notifications for challenges (future)

### App Store Submissions (Later)
- **Google Play Store:** Wrap in TWA (Trusted Web Activity) or React Native
- **Apple App Store:** Requires native wrapper (Capacitor/React Native)
- **Cost:** $25 Google Play, $99/year Apple Developer
- **Revenue:** 30% platform cut on subscriptions

---

## 💡 SUBSCRIPTION STRATEGY (AG Games Platform)

### The Funnel
```
AG Sudoku (FREE)          → User plays, enjoys game
    ↓
Create Account (FREE)     → Signs up to save progress  
    ↓
Engage (FREE)            → Plays regularly, earns badges
    ↓
Hits Paywall Moment      → Wants premium avatar, ad-free, challenges
    ↓
AG Premium ($3.99/mo)    → Subscribes for Sudoku benefits
    ↓
Discovers BGS            → Premium includes comic series!
    ↓
Retained Long-term       → Multiple products keep them subscribed
```

### Revenue Projections

| Period | Users | Premium % | Subscribers | Monthly Revenue |
|--------|-------|-----------|-------------|-----------------|
| Month 1-2 | 500 | 0% | 0 | €0 (building base) |
| Month 3 | 1,000 | 3% | 30 | €120 |
| Month 6 | 3,000 | 5% | 150 | €600 |
| Month 12 | 10,000 | 7% | 700 | €2,800 |
| Year 2 | 25,000 | 8% | 2,000 | €8,000 |

**Plus ad revenue for free users:** ~€0.50 CPM × impressions

### Cross-Product Benefits
When BGS launches:
- Sudoku subscribers automatically get BGS access
- BGS subscribers automatically get Sudoku premium
- One subscription, entire AG Games ecosystem
- Higher retention (multiple reasons to stay subscribed)

---

## 📊 IMPLEMENTATION TIMELINE

### Week 1 (Feb 17-23): Avatar Integration
- Copy & optimize avatar images
- Build avatar selection UI
- Create AvatarRenderer component
- Color tint system (CSS filters)
- Basic frame system (CSS borders)

### Week 2 (Feb 24-Mar 2): Cloud Profiles
- Profile creation flow
- localStorage → Supabase migration
- Stats syncing after each game
- Profile page UI
- Offline queue system

### Week 3 (Mar 3-9): Badges & Levels
- XP earning system
- Level progression
- Achievement checking logic
- Badge gallery UI
- Unlock notifications
- Level-up animations

### Week 4 (Mar 10-16): Leaderboards
- Weekly/Monthly/All-Time views
- Leaderboard UI component
- Real-time updates
- Anti-cheat validation
- User's own rank display

### Week 5 (Mar 17-23): Accessories & Polish
- Generate accessory images (DALL-E)
- Accessory overlay system
- Avatar customization panel
- Integration with unlock system
- Testing & bug fixes

### Week 6 (Mar 24-30): 1v1 Challenges
- Challenge creation & sharing
- Same-puzzle generation
- Results comparison
- Challenge inbox
- Matchmaking

### Week 7-8 (Mar 31-Apr 13): Monetization
- Stripe integration
- Feature gating
- Ad integration
- Subscription UI
- Testing payment flows

### Week 9 (Apr 14-20): PWA + Launch
- PWA manifest & service worker
- Final testing
- Marketing prep
- Full launch! 🚀

---

## 🛠️ TECHNICAL STACK

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| i18n | next-intl (12 languages) |
| Auth | Supabase Auth (Google + Email) |
| Database | Supabase (PostgreSQL) |
| File Storage | Vercel static (avatars in public/) |
| Hosting | Vercel |
| Payments | Stripe |
| Ads | Google AdMob |
| Avatar Colors | CSS filters (no extra images) |
| Avatar Frames | CSS borders/animations |
| Avatar Accessories | PNG overlays |
| Real-time | Supabase subscriptions |
| Domain | sudoku.alexgoiko.com |

---

## 📝 CLEANUP TASKS (Ongoing)

- [ ] Remove old Framer-related files (AG_SUDOKU_FRAMER.tsx, etc.)
- [ ] Delete unused Codes/ folder
- [ ] Fix "nul" file issue in git
- [ ] Clean up .gitignore
- [ ] Remove dead imports
- [ ] Set up error tracking (Sentry free tier)

---

## 🎯 IMMEDIATE NEXT STEPS

### This Session / Next Session:
1. **Integrate 20 avatar images** into the game (Claude Code prompt ready)
2. **Test Supabase auth** on production (sign in, verify it works)
3. **Build avatar selection UI** with color tint system

### This Week:
4. **Cloud profile creation flow** (on first login → choose nickname + avatar)
5. **Migrate localStorage stats → Supabase** on login
6. **Start XP/Level system**

### Questions Still to Decide:
1. Should 1v1 challenges be premium-only or limited free?
2. Ad placement: banner only, or interstitial too?
3. Subscription price: €3.99 or €4.99/month?
4. Allow free users on leaderboards (visible but unranked)?
5. Generate accessories with DALL-E or keep as CSS/emoji for now?

---

**Status:** 🟢 Auth connected, avatars generated, ready for integration  
**Next Phase:** Avatar Integration + Customization  
**Target Full Platform:** Late March - Early April 2026  
**Target Monetization:** April 2026

---

**Last Updated:** February 16, 2026  
**Next Session:** Avatar integration into game UI
