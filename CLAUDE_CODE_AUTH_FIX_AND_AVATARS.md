# AG SUDOKU - Fix Auth + Integrate Avatars

## CONTEXT
AG Sudoku is live at sudoku.alexgoiko.com (Next.js 14 + TypeScript + Tailwind).
Supabase Auth is connected but the LoginButton currently redirects to alexgoiko.com/en/auth/signin which doesn't exist (404).
We need to fix auth to work DIRECTLY on the Sudoku site AND integrate 20 monster avatar images.

## Project: C:/Users/goiko/Projects/Sudoku

---

## TASK 1: Fix Authentication (Google OAuth on Sudoku site)

### Problem
The current LoginButton at `app/components/auth/LoginButton.tsx` redirects to the main site for login. That page doesn't exist. We need login to happen directly on the Sudoku site.

### Fix LoginButton.tsx
Replace the redirect-to-main-site approach with direct Supabase Google OAuth:

```typescript
// The sign-in should call:
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

### LoginButton UI Requirements
- **Not logged in:** Show a "Sign In with Google" button
  - Google icon + text
  - Glassmorphism style matching the game theme (dark bg, blur, border)
  - Subtle, not aggressive — positioned near top of welcome screen
  - Below it: small text "Save progress & compete on leaderboards"
- **Logged in:** Show user info
  - User's avatar (monster image if set, or Google profile pic)
  - User's display name (from Google or nickname)
  - Small "Sign Out" text button
  - All in a compact row

### Also add Email/Password option (future)
For now, just Google OAuth. We can add email later.

### Verify the auth callback route works
Check `app/auth/callback/route.ts` — it should:
1. Exchange the code for a session
2. Redirect back to the game's home page (with locale)

---

## TASK 2: Integrate Monster Avatar Images

### Copy Avatar Images
The 20 monster PNGs are in `Avatars/` folder at the project root.
Copy them ALL to `public/avatars/` with kebab-case names:

| Source File | Destination |
|-------------|-------------|
| Avatars/Aurora.png | public/avatars/aurora.png |
| Avatars/Blinky.png | public/avatars/blinky.png |
| Avatars/Bubbles.png | public/avatars/bubbles.png |
| Avatars/Chompy.png | public/avatars/chompy.png |
| Avatars/Crystallo.png | public/avatars/crystallo.png |
| Avatars/Flame.png | public/avatars/flame.png |
| Avatars/Fluffy Cloud.png | public/avatars/fluffy-cloud.png |
| Avatars/Frosty.png | public/avatars/frosty.png |
| Avatars/Fuzzy.png | public/avatars/fuzzy.png |
| Avatars/Glitchy.png | public/avatars/glitchy.png |
| Avatars/Glow.png | public/avatars/glow.png |
| Avatars/Leafy.png | public/avatars/leafy.png |
| Avatars/Professor Numbskull.png | public/avatars/professor-numbskull.png |
| Avatars/Puddles.png | public/avatars/puddles.png |
| Avatars/Shadow.png | public/avatars/shadow.png |
| Avatars/Spiky.png | public/avatars/spiky.png |
| Avatars/Squiggles.png | public/avatars/squiggles.png |
| Avatars/Twinkle.png | public/avatars/twinkle.png |
| Avatars/Zappy.png | public/avatars/zappy.png |
| Avatars/Sparky.png | public/avatars/sparky.png |

### Create Avatar Data File: src/data/avatars.ts

```typescript
export interface MonsterAvatar {
  id: string;
  name: string;
  image: string;
  tier: 'free' | 'premium';
  personality: string;
  category: 'basic' | 'smart' | 'elemental' | 'quirky' | 'soft' | 'cool';
}

export const MONSTER_AVATARS: MonsterAvatar[] = [
  // FREE TIER (5)
  { id: 'blinky', name: 'Blinky', image: '/avatars/blinky.png', tier: 'free', personality: 'Curious & enthusiastic', category: 'basic' },
  { id: 'spiky', name: 'Spiky', image: '/avatars/spiky.png', tier: 'free', personality: 'Competitive & fun', category: 'basic' },
  { id: 'puddles', name: 'Puddles', image: '/avatars/puddles.png', tier: 'free', personality: 'Laid-back & chill', category: 'basic' },
  { id: 'fuzzy', name: 'Fuzzy', image: '/avatars/fuzzy.png', tier: 'free', personality: 'Encouraging coach', category: 'basic' },
  { id: 'squiggles', name: 'Squiggles', image: '/avatars/squiggles.png', tier: 'free', personality: 'Creative thinker', category: 'basic' },

  // PREMIUM TIER (15)
  { id: 'professor-numbskull', name: 'Professor Numbskull', image: '/avatars/professor-numbskull.png', tier: 'premium', personality: 'Wise & analytical', category: 'smart' },
  { id: 'glitchy', name: 'Glitchy', image: '/avatars/glitchy.png', tier: 'premium', personality: 'Fast & efficient', category: 'smart' },
  { id: 'aurora', name: 'Aurora', image: '/avatars/aurora.png', tier: 'premium', personality: 'Mystical & inspiring', category: 'elemental' },
  { id: 'chompy', name: 'Chompy', image: '/avatars/chompy.png', tier: 'premium', personality: 'Hungry for puzzles', category: 'quirky' },
  { id: 'zappy', name: 'Zappy', image: '/avatars/zappy.png', tier: 'premium', personality: 'Quick & exciting', category: 'elemental' },
  { id: 'bubbles', name: 'Bubbles', image: '/avatars/bubbles.png', tier: 'premium', personality: 'Dreamy & floating', category: 'soft' },
  { id: 'crystallo', name: 'Crystallo', image: '/avatars/crystallo.png', tier: 'premium', personality: 'Precise & perfect', category: 'elemental' },
  { id: 'fluffy-cloud', name: 'Fluffy Cloud', image: '/avatars/fluffy-cloud.png', tier: 'premium', personality: 'Gentle & supportive', category: 'soft' },
  { id: 'flame', name: 'Flame', image: '/avatars/flame.png', tier: 'premium', personality: 'Passionate & energetic', category: 'elemental' },
  { id: 'twinkle', name: 'Twinkle', image: '/avatars/twinkle.png', tier: 'premium', personality: 'Dreamer & ambitious', category: 'cool' },
  { id: 'leafy', name: 'Leafy', image: '/avatars/leafy.png', tier: 'premium', personality: 'Patient & growing', category: 'elemental' },
  { id: 'frosty', name: 'Frosty', image: '/avatars/frosty.png', tier: 'premium', personality: 'Cool & calculated', category: 'elemental' },
  { id: 'shadow', name: 'Shadow', image: '/avatars/shadow.png', tier: 'premium', personality: 'Strategic & quiet', category: 'cool' },
  { id: 'glow', name: 'Glow', image: '/avatars/glow.png', tier: 'premium', personality: 'Illuminating & helpful', category: 'cool' },
  { id: 'sparky', name: 'Sparky', image: '/avatars/sparky.png', tier: 'premium', personality: 'Explosive & exciting', category: 'elemental' },
];

export const FREE_AVATARS = MONSTER_AVATARS.filter(a => a.tier === 'free');
export const PREMIUM_AVATARS = MONSTER_AVATARS.filter(a => a.tier === 'premium');
export const getAvatarById = (id: string) => MONSTER_AVATARS.find(a => a.id === id) || MONSTER_AVATARS[0];
```

---

## TASK 3: Avatar Selection Component

### Create src/components/sudoku/AvatarSelector.tsx

A modal/panel where users pick their monster avatar:

**Layout:**
- Grid of avatar images (4 per row on desktop, 3 on mobile)
- Each avatar card shows: image (64x64), name below
- Free avatars: fully selectable
- Premium avatars: show a small ⭐ badge in corner, still selectable for now (we'll lock them when monetization is added)
- Selected avatar has a glowing purple border (matching game theme)
- Glassmorphism card style (matches stats/settings modals)

**Behavior:**
- Opens when user taps their avatar on the welcome screen
- Selecting an avatar saves to localStorage key: `ag_sudoku_avatar`
- If user is logged in, also saves to Supabase `sudoku_profiles.avatar_id`
- Close button (X) in top right
- Smooth fade-in animation

**Avatar Card Style:**
```css
/* Each avatar card */
background: rgba(255, 255, 255, 0.05);
border: 2px solid rgba(255, 255, 255, 0.1);
border-radius: 12px;
padding: 8px;
cursor: pointer;
transition: all 0.2s;

/* Selected state */
border-color: #a855f7; /* purple to match game theme */
box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);

/* Premium badge */
position: absolute;
top: 4px;
right: 4px;
font-size: 12px;
```

---

## TASK 4: Update Welcome Screen

### In the welcome screen (app/[locale]/sudoku/page.tsx):

1. **Avatar display at top:** Show selected monster avatar (64x64) next to the title
   - Clickable to open AvatarSelector
   - Default: Blinky (first free avatar)
   - Load from localStorage on mount

2. **Login button below avatar:**
   - If not logged in: "Sign In with Google" button (compact)
   - If logged in: "Welcome, [name]!" with small sign out link

3. **Layout order on welcome screen:**
   ```
   [Monster Avatar 64px] AG Sudoku
   [Sign In with Google] or [Welcome, Andre! | Sign Out]
   
   [Medium] [Expert] [Pro 🔒]
   
   [Stats] [Settings]
   [← alexgoiko.com]
   ```

---

## TASK 5: Show Avatar in Game Header

During gameplay (in AG_SUDOKU_ACTUAL.tsx or equivalent), show a small (32x32) version of the selected avatar next to the game title/timer area. This makes it feel personalized.

---

## TASK 6: Add Avatar Translations

Add to ALL 12 language files in `messages/` folder:

```json
"sudoku": {
  "avatars": {
    "title": "Choose Your Monster",
    "subtitle": "Pick your puzzle companion",
    "free": "Free",
    "premium": "Premium",
    "selected": "Selected",
    "blinky": "Blinky",
    "spiky": "Spiky",
    "puddles": "Puddles",
    "fuzzy": "Fuzzy",
    "squiggles": "Squiggles",
    "professor-numbskull": "Prof. Numbskull",
    "glitchy": "Glitchy",
    "aurora": "Aurora",
    "chompy": "Chompy",
    "zappy": "Zappy",
    "bubbles": "Bubbles",
    "crystallo": "Crystallo",
    "fluffy-cloud": "Fluffy Cloud",
    "flame": "Flame",
    "twinkle": "Twinkle",
    "leafy": "Leafy",
    "frosty": "Frosty",
    "shadow": "Shadow",
    "glow": "Glow",
    "sparky": "Sparky"
  },
  "auth": {
    "signInGoogle": "Sign In with Google",
    "signOut": "Sign Out",
    "welcome": "Welcome, {name}!",
    "saveProgress": "Sign in to save progress",
    "guest": "Playing as Guest"
  }
}
```

Translate appropriately for each language (ES, FR, DE, IT, PT, JA, KO, ZH, HI, TL, EU).
Monster names stay the same in all languages (they're proper names).
Only translate: title, subtitle, free, premium, selected, and auth strings.

---

## TASK 7: Verify & Build

1. Run `npm run build` and fix any TypeScript errors
2. Make sure auth flow works: click Sign In → Google OAuth popup → redirect back to game
3. Make sure avatar selection works and persists
4. Test that the welcome screen looks clean with avatar + auth

## IMPORTANT NOTES
- The Supabase project already has Google OAuth configured (it works on alexgoiko.com)
- The auth callback route is at `app/auth/callback/route.ts`
- DON'T redirect to alexgoiko.com for login — handle it directly on sudoku.alexgoiko.com
- Use `@supabase/ssr` if available, or `@supabase/supabase-js` createBrowserClient
- Keep guest mode working — game must work without login
- All UI should match the existing glassmorphism dark theme
- The existing `nul` file in the project is a Windows artifact — ignore it, don't try to add it to git
- When pushing to git, use specific paths: `git add app/ src/ messages/ public/avatars/` (NOT `git add .`)
