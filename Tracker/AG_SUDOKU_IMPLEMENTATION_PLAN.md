# 🎮 AG SUDOKU - FULL IMPLEMENTATION PLAN
## Profiles, Subscriptions, Monetization & Competition Features

**Created:** January 26, 2025  
**Project:** AG Sudoku - Antigravity Games  
**Current Status:** Core game working, ready for monetization features

---

## 📋 EXECUTIVE SUMMARY

### What We're Building
Transform AG Sudoku from a standalone game into a full-featured platform with:
1. **User Profiles** - Authentication, avatars, customization
2. **Subscription System** - Premium tiers with payment processing
3. **Statistics & Badges** - Track progress, unlock achievements
4. **Leaderboards** - Global and friend rankings
5. **Competitions** - Championships and 1v1 matches (future)

### Recommended Tech Stack
| Component | Recommendation | Why |
|-----------|---------------|-----|
| **Backend/Database** | Supabase | Free tier, real-time, auth built-in |
| **Authentication** | Supabase Auth | Social logins, email, easy setup |
| **Payments** | Stripe | Industry standard, web-friendly |
| **Hosting** | Vercel | Perfect for React/Next.js, free tier |
| **Analytics** | Mixpanel or Posthog | User behavior tracking |

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Framer)                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Game    │  │ Profile │  │ Shop    │  │ Leader- │        │
│  │ Board   │  │ System  │  │ /Subs   │  │ boards  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │               │
│       └────────────┴────────────┴────────────┘               │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Auth        │  │ Database    │  │ Storage     │         │
│  │ (Users)     │  │ (Profiles,  │  │ (Avatars)   │         │
│  │             │  │  Stats)     │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    STRIPE (Payments)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Checkout    │  │ Subscriptions│ │ Webhooks    │         │
│  │ Sessions    │  │ Management   │ │ (Events)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 DATABASE SCHEMA

### Users Table (extends Supabase auth.users)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nickname VARCHAR(15) NOT NULL,
  avatar_id VARCHAR(50) DEFAULT 'fox',
  avatar_color VARCHAR(7) DEFAULT '#4CAF50',
  avatar_accessories JSONB DEFAULT '[]',
  frame_id VARCHAR(50) DEFAULT 'basic',
  
  -- Subscription
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, premium, pro
  subscription_status VARCHAR(20) DEFAULT 'inactive',
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id VARCHAR(255),
  
  -- Progression
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  
  -- Pro Mode Access (requirements)
  expert_games_completed INTEGER DEFAULT 0,
  expert_win_rate DECIMAL(5,2) DEFAULT 0,
  pro_unlocked BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_played_at TIMESTAMPTZ
);
```

### Game Statistics Table
```sql
CREATE TABLE game_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  
  -- Per Difficulty Stats
  difficulty VARCHAR(10) NOT NULL, -- medium, expert, pro
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  avg_time_seconds INTEGER,
  total_time_seconds INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  mistakes_total INTEGER DEFAULT 0,
  perfect_games INTEGER DEFAULT 0, -- no mistakes
  
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_played_date DATE,
  
  UNIQUE(user_id, difficulty)
);
```

### Achievements/Badges Table
```sql
CREATE TABLE achievements (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  category VARCHAR(50), -- gameplay, social, milestone
  requirement_type VARCHAR(50), -- games_won, streak, time, etc.
  requirement_value INTEGER,
  xp_reward INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES profiles(id),
  achievement_id VARCHAR(50) REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);
```

### Game History Table (for leaderboards)
```sql
CREATE TABLE game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  difficulty VARCHAR(10) NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_seconds INTEGER NOT NULL,
  mistakes INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  is_perfect BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0
);
```

### Leaderboard View
```sql
CREATE VIEW leaderboard_weekly AS
SELECT 
  p.id,
  p.nickname,
  p.avatar_id,
  p.avatar_color,
  p.frame_id,
  p.subscription_tier,
  COUNT(gh.id) as games_won,
  MIN(gh.time_seconds) as best_time,
  SUM(gh.xp_earned) as weekly_xp
FROM profiles p
JOIN game_history gh ON p.id = gh.user_id
WHERE gh.completed_at > NOW() - INTERVAL '7 days'
GROUP BY p.id
ORDER BY weekly_xp DESC;
```

---

## 👤 USER PROFILES SYSTEM

### Profile Features by Tier

| Feature | Free | Premium ($4.99/mo) | Pro |
|---------|------|-------------------|-----|
| **Avatars** | 5 basic | All 20 | All 20 + Exclusive |
| **Colors** | 5 colors | 15 colors | 20+ colors |
| **Frames** | Basic only | Gold, Silver, Bronze | Diamond, Platinum |
| **Accessories** | None | Hats, Glasses | All + Exclusive |
| **Nickname Changes** | 1/month | Unlimited | Unlimited |
| **Statistics** | Basic | Detailed | Advanced Analytics |
| **Badges Display** | 3 max | 6 max | 10 max |

### Avatar System

#### Current Animals (10) → Keep as Legacy
- Free: Fox, Cat, Dog (3)
- Premium: Bear, Koala, Lion, Owl, Panda, Tiger, Wolf (7)

#### New Monster Avatars (20) → Primary System
**Free Tier (5):**
1. Blinky - One-eyed blue blob
2. Spiky - Green hedgehog
3. Puddles - Orange goo monster
4. Fuzzy - Purple furry monster
5. Squiggles - Pink tentacle creature

**Premium Tier (15):**
6. Professor Numbskull - Smart with glasses
7. Glitchy - Digital/pixel monster
8. Aurora - Rainbow iridescent
9. Chompy - Big mouth monster
10. Zappy - Electric blue spark
11. Bubbles - Transparent bubble
12. Crystallo - Geometric crystal
13. Fluffy Cloud - Cloud monster
14. Flame - Fire monster
15. Twinkle - Star-covered space
16. Leafy - Nature plant monster
17. Frosty - Ice crystal
18. Shadow - Dark mysterious
19. Glow - Bioluminescent
20. Sparky - Lightning bolt

---

## 💰 SUBSCRIPTION SYSTEM

### Pricing Tiers

#### Free Tier
- ✅ Full gameplay (Medium + Expert)
- ✅ 5 free avatars
- ✅ Basic statistics
- ✅ Leaderboard viewing
- ❌ Ads shown (banner + interstitial)
- ❌ Pro difficulty locked
- ❌ Premium customization

#### Premium Tier - $4.99/month (or $39.99/year)
- ✅ Everything in Free
- ✅ **AD-FREE** experience
- ✅ All 20 monster avatars
- ✅ All colors and accessories
- ✅ Premium frames (Gold, Silver, Bronze)
- ✅ Detailed statistics
- ✅ Priority support
- ❌ Pro difficulty (requires skill unlock)

#### Pro Access Requirements
To access Pro difficulty (even with Premium subscription):
1. ✅ Premium subscription active
2. ✅ Level 10+ (earned through XP)
3. ✅ 25+ Expert games completed
4. ✅ 50%+ win rate on Expert
5. ✅ Beat Expert in under 15 minutes at least once

### Stripe Integration

```javascript
// Subscription Products
const PRODUCTS = {
  premium_monthly: {
    price_id: 'price_xxxxx', // From Stripe Dashboard
    amount: 499, // $4.99
    interval: 'month',
    name: 'Premium Monthly'
  },
  premium_yearly: {
    price_id: 'price_yyyyy',
    amount: 3999, // $39.99 (33% off)
    interval: 'year',
    name: 'Premium Yearly'
  }
};

// Checkout Flow
async function createCheckoutSession(userId, priceId) {
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/pricing`,
    metadata: { userId }
  });
  return session;
}
```

### Webhook Handling

```javascript
// Handle subscription events
app.post('/webhooks/stripe', async (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body, sig, webhookSecret
  );

  switch (event.type) {
    case 'checkout.session.completed':
      // Activate subscription
      await activateSubscription(event.data.object);
      break;
    
    case 'customer.subscription.updated':
      // Update subscription status
      await updateSubscription(event.data.object);
      break;
    
    case 'customer.subscription.deleted':
      // Downgrade to free
      await cancelSubscription(event.data.object);
      break;
    
    case 'invoice.payment_failed':
      // Handle failed payment
      await handleFailedPayment(event.data.object);
      break;
  }
});
```

---

## 📊 STATISTICS & BADGES SYSTEM

### Statistics Dashboard

#### Overview Stats
- Total games played
- Overall win rate
- Total time played
- Favorite difficulty
- Current level & XP

#### Per-Difficulty Stats
- Games played / won
- Win rate %
- Best time
- Average time
- Hints used average
- Mistakes average
- Perfect games (0 mistakes)

#### Streaks & Trends
- Current winning streak
- Longest streak ever
- Daily play streak
- Weekly trend chart
- Monthly progress

### Achievement Badges

#### Beginner Badges 🌱
| Badge | Requirement | XP |
|-------|-------------|-----|
| First Steps | Complete 1 game | 10 |
| Getting Started | Complete 5 games | 25 |
| Dedicated | Complete 25 games | 50 |
| Committed | Complete 100 games | 100 |

#### Speed Badges ⚡
| Badge | Requirement | XP |
|-------|-------------|-----|
| Quick Thinker | Beat Medium in < 10 min | 25 |
| Speed Demon | Beat Expert in < 15 min | 50 |
| Lightning Fast | Beat Pro in < 20 min | 100 |
| Flash | Beat any in < 5 min | 150 |

#### Perfection Badges ✨
| Badge | Requirement | XP |
|-------|-------------|-----|
| No Mistakes | 1 perfect game | 25 |
| Consistent | 5 perfect games | 75 |
| Perfectionist | 25 perfect games | 150 |
| Flawless | 100 perfect games | 300 |

#### Streak Badges 🔥
| Badge | Requirement | XP |
|-------|-------------|-----|
| On Fire | 3 win streak | 20 |
| Hot Streak | 7 win streak | 50 |
| Unstoppable | 15 win streak | 100 |
| Legend | 30 win streak | 250 |

#### Special Badges 🏆
| Badge | Requirement | XP |
|-------|-------------|-----|
| Night Owl | Play 10 games after midnight | 30 |
| Early Bird | Play 10 games before 7am | 30 |
| Weekend Warrior | Complete 20 games on weekends | 50 |
| Pro Player | Unlock Pro difficulty | 200 |
| Subscriber | Become Premium member | 100 |

### XP & Leveling System

```javascript
const XP_REWARDS = {
  game_complete: {
    medium: 10,
    expert: 25,
    pro: 50
  },
  game_win: {
    medium: 15,
    expert: 35,
    pro: 75
  },
  perfect_game: 25, // bonus
  fast_completion: 15, // bonus for speed
  streak_bonus: (streak) => Math.min(streak * 5, 50)
};

// Level thresholds
const LEVELS = [
  { level: 1, xp_required: 0 },
  { level: 2, xp_required: 100 },
  { level: 3, xp_required: 250 },
  { level: 4, xp_required: 500 },
  { level: 5, xp_required: 1000 },
  { level: 6, xp_required: 1750 },
  { level: 7, xp_required: 2750 },
  { level: 8, xp_required: 4000 },
  { level: 9, xp_required: 5500 },
  { level: 10, xp_required: 7500 }, // Pro unlock threshold
  // ... continues
];
```

---

## 📢 ADVERTISEMENT STRATEGY

### Ad Placement (Free Users Only)

#### Banner Ads
- **Location:** Bottom of screen
- **Size:** 320x50 (mobile) / 728x90 (desktop)
- **Timing:** Always visible during menus
- **Hidden:** During active gameplay

#### Interstitial Ads
- **When:** After every 3-4 completed games
- **Skip:** After 5 seconds
- **Frequency cap:** Max 1 per 5 minutes
- **Never:** During gameplay or mid-action

#### Rewarded Video Ads (Optional)
- **Offer:** Watch ad for +1 hint
- **Offer:** Watch ad for 2x XP on next game
- **User choice:** Never forced

### Recommended Ad Networks

1. **Google AdMob** (Primary)
   - Best fill rates
   - Easy integration
   - Good CPM

2. **Unity Ads** (Backup)
   - Gaming-focused
   - Good for rewarded video

### Ad Implementation

```javascript
// Check if user should see ads
const shouldShowAds = (user) => {
  return user.subscription_tier === 'free';
};

// Track games for interstitial timing
const GameCounter = {
  count: 0,
  increment() {
    this.count++;
    if (this.count >= 4) {
      this.count = 0;
      return true; // Show interstitial
    }
    return false;
  }
};
```

---

## 🏆 LEADERBOARDS

### Leaderboard Types

#### Global Leaderboards
- **Weekly Top 100** - Resets every Monday
- **Monthly Champions** - Resets 1st of month
- **All-Time Best** - Permanent

#### Difficulty Leaderboards
- Best times per difficulty
- Most games won per difficulty
- Highest win rates

#### Friend Leaderboards (Future)
- Compare with friends
- Challenge system

### Leaderboard Display

```javascript
const LeaderboardEntry = {
  rank: 1,
  user: {
    nickname: "SpeedDemon",
    avatar_id: "zappy",
    avatar_color: "#FFD700",
    frame_id: "gold",
    subscription_tier: "premium"
  },
  stats: {
    games_won: 147,
    best_time: 245, // seconds
    weekly_xp: 2450
  }
};
```

---

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Backend Setup (Week 1)
- [ ] Set up Supabase project
- [ ] Create database tables
- [ ] Implement authentication
- [ ] Set up Stripe account
- [ ] Create basic API endpoints

### Phase 2: User Profiles (Week 2)
- [ ] Profile creation flow
- [ ] Avatar selection UI
- [ ] Profile editing
- [ ] LocalStorage → Database migration
- [ ] Guest mode handling

### Phase 3: Statistics System (Week 2-3)
- [ ] Implement stat tracking
- [ ] Create stats dashboard UI
- [ ] Achievement system
- [ ] Badge display
- [ ] XP and leveling

### Phase 4: Subscription System (Week 3)
- [ ] Stripe checkout integration
- [ ] Webhook handling
- [ ] Subscription management UI
- [ ] Feature gating logic
- [ ] Payment success/failure handling

### Phase 5: Ads Integration (Week 4)
- [ ] AdMob account setup
- [ ] Banner ad implementation
- [ ] Interstitial ad logic
- [ ] Rewarded video (optional)
- [ ] Ad-free for premium

### Phase 6: Leaderboards (Week 4-5)
- [ ] Weekly leaderboard
- [ ] Difficulty leaderboards
- [ ] Leaderboard UI
- [ ] Rank animations

### Phase 7: Polish & Launch (Week 5-6)
- [ ] Testing all flows
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Soft launch
- [ ] Marketing prep

---

## 🔧 TECHNICAL CONSIDERATIONS

### Guest vs Authenticated Users

```javascript
// Guest mode (no account)
const GuestUser = {
  isGuest: true,
  profile: {
    nickname: "Guest",
    avatar_id: "fox",
    subscription_tier: "free"
  },
  stats: localStorage.getItem('guest_stats'),
  // Limited features
  canAccessPro: false,
  canAccessLeaderboard: false
};

// Authenticated user
const AuthUser = {
  isGuest: false,
  profile: await supabase.from('profiles').select('*'),
  stats: await supabase.from('game_stats').select('*'),
  // Full features based on subscription
};
```

### Offline Support

```javascript
// Queue game results when offline
const offlineQueue = {
  games: [],
  add(gameResult) {
    this.games.push(gameResult);
    localStorage.setItem('offline_queue', JSON.stringify(this.games));
  },
  async sync() {
    if (navigator.onLine && this.games.length > 0) {
      await supabase.from('game_history').insert(this.games);
      this.games = [];
      localStorage.removeItem('offline_queue');
    }
  }
};
```

### Security Rules (Supabase RLS)

```sql
-- Users can only read/write their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Leaderboard is public read
CREATE POLICY "Leaderboard is public" 
  ON game_history FOR SELECT 
  USING (true);
```

---

## 💵 REVENUE PROJECTIONS

### Month 1-3 (Soft Launch)
- **Users:** 500-1,000
- **Premium conversion:** 3-5%
- **Ad revenue:** ~$50-100/month
- **Subscription revenue:** ~$100-250/month
- **Total:** ~$150-350/month

### Month 6 (Growth Phase)
- **Users:** 5,000-10,000
- **Premium conversion:** 5-7%
- **Ad revenue:** ~$300-600/month
- **Subscription revenue:** ~$1,500-3,500/month
- **Total:** ~$1,800-4,100/month

### Year 1 Target
- **Users:** 25,000-50,000
- **Premium conversion:** 7-10%
- **Monthly revenue:** ~$8,000-25,000

---

## ✅ NEXT STEPS

### Immediate Actions (This Session)
1. Decide on Supabase vs other backend
2. Create monster avatar designs
3. Set up project structure
4. Begin profile system implementation

### Questions to Discuss
1. Do you want guest mode (play without account)?
2. Social login options (Google, Apple, Facebook)?
3. Monster avatars vs keep animals vs both?
4. Tournament/competition timeline?
5. BGS integration timeline?

---

**Document Status:** Ready for review  
**Last Updated:** January 26, 2025
