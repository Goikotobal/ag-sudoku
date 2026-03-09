# 🎮 AG SUDOKU - DEVELOPMENT PLAN V6
**Goal:** Full-featured competitive Sudoku platform with avatar customization, achievements & monetization  
**Current Status:** Core game LIVE + Avatars integrated + Auth needs Google provider setup  
**URL:** sudoku.alexgoiko.com  
**Last Updated:** February 16, 2026 — 11:30 PM

---

## 📍 WHERE WE ARE NOW (Feb 16, 2026 — End of Day)

### ✅ Completed & Live on Production
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

### ✅ Completed Today (Feb 16, 2026) — TWO Claude Code Sessions
**Session 1: Stats + Settings + Auth Foundation**
- [x] Local Stats Tracking system (localStorage, mirrors Supabase schema)
- [x] Settings Menu (theme, timer toggle, highlight numbers, auto-remove notes, how-to-play)
- [x] Supabase Auth integration (same project as alexgoiko.com)
- [x] Database tables created in Supabase SQL Editor:
  - sudoku_profiles, sudoku_game_stats, sudoku_game_history
  - sudoku_achievements (14 seeded), sudoku_user_achievements
  - sudoku_leaderboard_weekly (view)
  - Row Level Security policies on all tables
- [x] Auth callback route (`app/auth/callback/route.ts`)
- [x] AuthContext provider (`src/context/AuthContext.tsx`)
- [x] LoginButton component (`app/components/auth/LoginButton.tsx`)
- [x] Environment variables set on Vercel (NEXT_PUBLIC_SUPABASE_URL + ANON_KEY)
- [x] Auth redirect URLs configured in Supabase

**Session 2: Auth Fix + Avatar Integration**
- [x] Fixed LoginButton — now uses direct Google OAuth (not redirect to main site)
- [x] 20 Monster Avatar PNGs copied to `public/avatars/` (kebab-case names)
- [x] Avatar data file created (`src/data/avatars.ts`) — 5 free + 15 premium
- [x] AvatarSelector component (`app/components/avatars/AvatarSelector.tsx`)
- [x] useAvatar hook for avatar state management
- [x] Welcome screen updated — shows avatar (72px) + "Sign In with Google" button
- [x] Avatar selector modal — grid layout, free/premium sections, ⭐ badges
- [x] Avatar translations added to all 12 languages
- [x] Auth translations added to all 12 languages
- [x] All deployed and LIVE ✅

### ⚠️ Known Issue: Google Auth Not Working Yet
- Error: "Unsupported provider: provider is not enabled"
- **Fix needed:** Enable Google OAuth provider in Supabase dashboard
- Requires: Google Cloud Console OAuth credentials (Client ID + Secret)
- **This is the #1 task for tomorrow**

### 🔜 Ready to Implement (prompts prepared)
- Cloud Profiles & Stats sync (prompt ready: CLAUDE_CODE_CLOUD_PROFILES.md)
- Stripe subscription integration
- Google AdMob ads

---

## 🎯 REMAINING PHASES (Updated Priority for Revenue by Early March)

| Phase | What | Status | Priority |
|-------|------|--------|----------|
| **Phase 5A** | ~~Avatar Integration~~ | ✅ DONE | — |
| **Phase 5B** | Avatar Colors + Frames (CSS) | Deferred | 🟡 After revenue |
| **Phase 6** | Google Auth Fix + Cloud Profiles | 🔜 TOMORROW | 🔴 CRITICAL |
| **Phase 7** | Stripe Subscriptions | Next | 🔴 CRITICAL |
| **Phase 8** | Google AdMob Ads | Next | 🔴 HIGH |
| **Phase 9** | Badges & XP/Levels | After revenue | 🟡 MEDIUM |
| **Phase 10** | Leaderboards | After revenue | 🟡 MEDIUM |
| **Phase 11** | Avatar Accessories + Animations | After revenue | 🟢 LATER |
| **Phase 12** | 1v1 Challenges | After revenue | 🟢 LATER |
| **Phase 13** | PWA + App Stores | After revenue | 🟢 LATER |

**Revenue-first strategy:** Get Stripe + Ads live ASAP, then build retention features.

---

## 📅 TOMORROW'S PLAN (Feb 17, 2026)

### 🔴 Block 1: Fix Google Auth (30-45 min) — MANUAL, NO Claude Code

**Step 1: Google Cloud Console Setup**
1. Go to https://console.cloud.google.com/apis/credentials
2. Select or create a project (e.g., "AlexGoiko" or "Antigravity Games")
3. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
4. Application type: **Web application**
5. Name: "AG Sudoku" (or "AlexGoiko Auth")
6. **Authorized JavaScript origins:** 
   - `https://sudoku.alexgoiko.com`
   - `https://alexgoiko.com` (if you want shared auth later)
7. **Authorized redirect URIs:**
   - `https://fkalzkyasthshhsxopmk.supabase.co/auth/v1/callback`
8. Click **Create** → copy **Client ID** and **Client Secret**

**Step 2: Enable Google in Supabase**
1. Go to Supabase → **Authentication** → **Sign In / Providers**
2. Find **Google** → toggle **Enable**
3. Paste the **Client ID** and **Client Secret** from Step 1
4. Save

**Step 3: Test**
1. Go to sudoku.alexgoiko.com
2. Click "Sign In with Google"
3. Should open Google login popup → redirect back to game
4. Welcome screen should show your Google name

**If alexgoiko.com already uses Google OAuth:**
- You can reuse the same Client ID/Secret
- Just add the Supabase callback URI to the existing OAuth client
- Check in Google Cloud Console → APIs & Services → Credentials → your existing OAuth client

---

### 🔴 Block 2: Cloud Profiles (60-90 min) — Claude Code

**Prompt file:** CLAUDE_CODE_CLOUD_PROFILES.md (already prepared)

What this does:
- Creates Supabase profile on first Google login
- Migrates localStorage stats → Supabase
- Saves every game result to cloud (for logged-in users)
- XP earning system (simple: play + win + bonuses)
- Level display on welcome screen (Level 5 — Learner, XP progress bar)
- Offline queue (saves locally if connection fails, syncs later)
- Guest mode still works perfectly

**After it finishes:**
```bash
git add app/ src/ messages/
git commit -m "Add cloud profiles, stats sync, XP system"
git push
```

**Test:** Sign in → play a game → check Supabase Table Editor → see your data in sudoku_profiles, sudoku_game_stats, sudoku_game_history

---

### 🟡 Block 3: Stripe Subscription Setup (60-90 min) — Claude Code

**If time permits — prepare Stripe prompt:**

What it needs to do:
- Create Stripe account (manual step)
- Create a product: "AG Games Premium" with price €2.49/month and €19.99/year
- Stripe Checkout integration (redirect to Stripe-hosted payment page)
- Webhook to update `profiles.subscription_tier` in Supabase
- Feature gating utility: `isPremium(user)` check
- Premium avatar lock (free users can only select 5 free avatars)
- "Upgrade to Premium" button on avatar selector and settings

**Revenue from Day 1:**
- Premium removes ads (when ads are added)
- Premium unlocks 15 monster avatars
- Premium unlocks all future colors/frames/accessories

---

### ⚡ Stretch Goal: Google AdMob Ads

If Blocks 1-3 are done:
- Add banner ad to bottom of welcome screen (free users only)
- Add interstitial ad after every 3-4 completed games
- Premium users: no ads
- This generates passive income from free users

---

## 📊 PROGRESS TRACKER

| Feature | Status | % |
|---------|--------|---|
| Core Gameplay | ✅ Live | 100% |
| Responsive Design | ✅ Live | 100% |
| 12-Language i18n | ✅ Live | 100% |
| AI Hints | ✅ Live | 100% |
| Auto-save | ✅ Live | 100% |
| Custom Modals | ✅ Live | 100% |
| Local Stats | ✅ Live | 100% |
| Settings Menu | ✅ Live | 100% |
| Supabase Tables | ✅ Created | 100% |
| Auth Foundation | ✅ Deployed | 95% (Google provider needed) |
| 20 Monster Avatars | ✅ Live | 100% |
| Avatar Selector UI | ✅ Live | 100% |
| **Google OAuth Login** | ⚠️ Blocked | **0% — FIX TOMORROW** |
| **Cloud Profiles** | 📋 Prompt Ready | **0% — DO TOMORROW** |
| **Stripe Subscriptions** | 📋 Planning | **0% — DO TOMORROW** |
| **AdMob Ads** | 📋 Planning | 0% |
| Avatar Colors (CSS) | Deferred | 0% |
| Avatar Frames (CSS) | Deferred | 0% |
| Avatar Accessories | Deferred | 0% |
| Badges & XP | Deferred | 0% |
| Leaderboards | Deferred | 0% |
| 1v1 Challenges | Deferred | 0% |

**Overall to Revenue:** ~70% done (auth + profiles + Stripe remaining)

---

## 💰 REVENUE TIMELINE (Aggressive)

| Date | Milestone | Revenue |
|------|-----------|---------|
| Feb 17 | Google Auth working | — |
| Feb 17-18 | Cloud profiles live | — |
| Feb 18-19 | Stripe integration | 💰 Subscriptions possible |
| Feb 19-20 | AdMob integration | 💰 Ad revenue starts |
| Feb 21-28 | Polish + marketing | Growing |
| Mar 1 | **Full revenue platform live** | €€€ |

---

## 🛠️ TECHNICAL STACK

| Component | Technology | Status |
|-----------|-----------|--------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS | ✅ |
| i18n | next-intl (12 languages) | ✅ |
| Auth | Supabase Auth (Google OAuth) | ⚠️ 95% |
| Database | Supabase (PostgreSQL) | ✅ |
| Avatars | 20 PNGs in public/avatars/ | ✅ |
| Hosting | Vercel | ✅ |
| Payments | Stripe (planned) | 📋 |
| Ads | Google AdMob (planned) | 📋 |
| Avatar Colors | CSS filters (planned) | 📋 |
| Avatar Frames | CSS borders/animations (planned) | 📋 |
| Domain | sudoku.alexgoiko.com | ✅ |

---

## 📝 FILES REFERENCE

### Key Project Files
| File | Purpose |
|------|---------|
| `app/[locale]/page.tsx` | Welcome screen (avatar, auth, difficulty select) |
| `app/[locale]/sudoku/play/page.tsx` | Game screen |
| `app/components/sudoku/AG_SUDOKU_ACTUAL.tsx` | Main game component |
| `app/components/auth/LoginButton.tsx` | Google OAuth button |
| `app/components/avatars/AvatarSelector.tsx` | Monster avatar picker |
| `src/data/avatars.ts` | 20 avatar definitions (free/premium) |
| `src/context/AuthContext.tsx` | Auth state management |
| `src/lib/supabase/client.ts` | Supabase browser client |
| `src/utils/statsManager.ts` | Local stats tracking |
| `src/utils/settingsManager.ts` | Local settings |
| `src/db/setup-sudoku-tables.sql` | Database schema (already executed) |
| `messages/*.json` | 12 language translation files |
| `public/avatars/*.png` | 20 monster avatar images |

### Prepared Claude Code Prompts
| Prompt | Purpose | When |
|--------|---------|------|
| CLAUDE_CODE_CLOUD_PROFILES.md | Stats sync + XP + levels | Tomorrow Block 2 |
| (To prepare) | Stripe + feature gating | Tomorrow Block 3 |
| (To prepare) | AdMob ads | This week |

### localStorage Keys
| Key | Data |
|-----|------|
| ag_sudoku_stats | Player statistics |
| ag_sudoku_settings | User preferences |
| ag_sudoku_avatar | Selected avatar ID |
| ag_sudoku_migrated | Whether stats migrated to cloud |
| ag_sudoku_pending_sync | Offline queue |

---

## 🎯 THIS WEEK'S TARGETS

- [ ] **Mon Feb 17:** Google Auth working + Cloud Profiles live + Start Stripe
- [ ] **Tue Feb 18:** Stripe subscriptions live (€2.49/mo, €19.99/yr)
- [ ] **Wed Feb 19:** AdMob ads for free users + Premium ad-free
- [ ] **Thu Feb 20:** Testing + bug fixes + avatar color tints (CSS)
- [ ] **Fri Feb 21:** Polish + soft launch marketing (friends, family, social)
- [ ] **Weekend:** Monitor, fix bugs, plan Week 2 (badges, leaderboards)

---

**Status:** 🟡 Auth blocked on Google provider setup → Fix first thing tomorrow  
**Next Action:** Enable Google OAuth in Supabase (30 min manual task)  
**Then:** Cloud Profiles prompt → Stripe prompt → Revenue!  
**Target:** Revenue-generating by Feb 19-20, 2026

---

**Last Updated:** February 16, 2026, 11:30 PM  
**Next Session:** February 17, 2026 — Fix Google Auth → Cloud Profiles → Stripe
