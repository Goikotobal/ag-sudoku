# 🧩 AG SUDOKU — Email Auth + Guest Button Brief
## Repo: ag-sudoku | sudoku.alexgoiko.com
## Date: March 9, 2026

---

## CONTEXT

goiko-avatar (www.alexgoiko.com) already has:
- ✅ Email/password login + signup connected to Supabase
- ✅ "Continue as Guest →" button on login and signup pages
- ✅ Guest session stored in localStorage as `goiko_guest_session: { isGuest: true, isPro: false }`

AG Sudoku currently only has Google Sign In. It needs the same email/password auth and guest button added to match the rest of the platform.

Same Supabase project: `fkalzkyasthshhsxopmk`

---

## TASK 1 — Email/password sign in

On the AG Sudoku sign-in screen, below the existing Google button, add:

- An "or" divider
- Email input field
- Password input field  
- "Sign In" button → calls `supabase.auth.signInWithPassword({ email, password })`
- Inline error message if login fails (e.g. "Invalid email or password")
- "Don't have an account? Sign up" link → leads to signup screen

Read the existing login component/page before touching anything.

---

## TASK 2 — Email/password sign up

Add a signup screen/modal if one doesn't exist yet, or connect any existing UI to Supabase:

- Email + password + confirm password fields
- "Create Account" button → calls `supabase.auth.signUp({ email, password })`
- On success: show "Check your email to confirm your account ✉️"
- On error: show inline error
- "Already have an account? Sign in" link

---

## TASK 3 — "Play as Guest →" button

Below all auth options, add a subtle guest link:

```
Play as Guest →
(limited features — no progress saved)
```

- Smaller text, muted gray color
- On click: store `{ isGuest: true, isPro: false }` in localStorage key `goiko_guest_session`
- Then dismiss the auth screen and allow play

**Guest access in AG Sudoku:**
- ✅ Medium and Expert difficulties
- ❌ Pro difficulty (show "Pro subscribers only" if they try)
- ❌ AI hints (show "Create free account for AI hints")
- ❌ Progress saved (show "Create account to save your progress" nudge after completing a game)
- ❌ Leaderboard

Check where `isPro` and auth state are currently read in the codebase and add `isGuest` handling consistently. Guest = `isGuest: true, isPro: false`.

---

## TASK 4 — Auth callback route

Check if `app/auth/callback/route.ts` (or equivalent) exists and handles both:
1. OAuth code exchange (`?code=xxx`) → existing Google flow
2. Email confirmation (`?token_hash=xxx&type=email`) → call `supabase.auth.verifyOtp({ token_hash, type: 'email' })` then redirect to the game

If the callback route only handles OAuth, add the email confirmation case.

---

## EXECUTION ORDER

```
Task 4 first (auth foundation) → Task 1 → Task 2 → Task 3
Commit after each task. Push after each commit.
```

---

## DEFINITION OF DONE

- [ ] Email/password sign in works on sudoku.alexgoiko.com
- [ ] Email/password sign up works + confirmation email sent
- [ ] "Play as Guest →" button visible below auth options
- [ ] Guest can play Medium + Expert, blocked from Pro + AI hints
- [ ] Auth callback handles email confirmation tokens
- [ ] All committed and pushed

---

*Brief prepared: March 9, 2026*
*Repo: github.com/Goikotobal/ag-sudoku*
