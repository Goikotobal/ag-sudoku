# AG SUDOKU - Phase 7: Stripe Subscription + Feature Gating

## CONTEXT
AG Sudoku at sudoku.alexgoiko.com now has:
- Supabase Auth with Google OAuth (working)
- Cloud profiles saving to Supabase (sudoku_profiles table)
- XP/Level system working
- 20 monster avatars (5 free, 15 premium)
- The `profiles` table has a `subscription_tier` column (text, default 'free')
- The `sudoku_profiles` table has user data

## Project: C:/Users/goiko/Projects/Sudoku

## GOAL
Add Stripe subscription so users can upgrade to Premium (€2.49/month or €19.99/year). Premium unlocks all 15 premium avatars and will later remove ads and unlock more features.

---

## TASK 1: Install Stripe

```bash
npm install stripe @stripe/stripe-js
```

Add to `.env.local` and `.env.example`:
```
STRIPE_SECRET_KEY=sk_test_... 
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
```

NOTE: Don't fill in actual values — just add the placeholder keys. Andre will fill them in manually from the Stripe dashboard.

---

## TASK 2: Create Stripe Checkout API Route

### Create `app/api/stripe/checkout/route.ts`

```typescript
// POST /api/stripe/checkout
// Body: { priceId: string, userId: string }
// Returns: { url: string } (Stripe Checkout URL)

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await request.json();
    
    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sudoku.alexgoiko.com'}/en?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sudoku.alexgoiko.com'}/en?upgraded=false`,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## TASK 3: Create Stripe Webhook API Route

### Create `app/api/stripe/webhook/route.ts`

```typescript
// POST /api/stripe/webhook
// Handles Stripe events to update subscription status in Supabase

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Use service role key for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId) {
          // Update profiles table
          await supabaseAdmin
            .from('profiles')
            .update({ 
              subscription_tier: 'premium',
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId);
            
          // Also update sudoku_profiles if it exists
          await supabaseAdmin
            .from('sudoku_profiles')
            .update({ pro_unlocked: true })
            .eq('user_id', userId);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          const isActive = ['active', 'trialing'].includes(subscription.status);
          await supabaseAdmin
            .from('profiles')
            .update({ 
              subscription_tier: isActive ? 'premium' : 'free' 
            })
            .eq('id', userId);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', userId);
            
          await supabaseAdmin
            .from('sudoku_profiles')
            .update({ pro_unlocked: false })
            .eq('user_id', userId);
        }
        break;
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Disable body parsing for webhook (Stripe needs raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};
```

**IMPORTANT:** Also add `SUPABASE_SERVICE_ROLE_KEY` to `.env.example`:
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## TASK 4: Create Stripe Customer Portal Route (for managing subscription)

### Create `app/api/stripe/portal/route.ts`

```typescript
// POST /api/stripe/portal
// Body: { customerId: string }
// Returns: { url: string } (Stripe Customer Portal URL)

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();
    
    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sudoku.alexgoiko.com'}/en`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## TASK 5: Add stripe_customer_id to profiles table

Check if the `profiles` table has a `stripe_customer_id` column. If not, we need to note it for Andre to add manually via Supabase SQL Editor:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
```

Don't run this — just add a comment in the code or a note.

---

## TASK 6: Create Premium Feature Gating Utility

### Create `src/utils/premium.ts`

```typescript
export function isPremium(subscriptionTier: string | null | undefined): boolean {
  return subscriptionTier === 'premium';
}

export function canAccessAvatar(avatarTier: 'free' | 'premium', userSubscription: string | null | undefined): boolean {
  if (avatarTier === 'free') return true;
  return isPremium(userSubscription);
}
```

---

## TASK 7: Create Upgrade Modal Component

### Create `app/components/premium/UpgradeModal.tsx`

A modal that shows when users try to select a premium avatar (or click "Upgrade"):

Design:
- Glassmorphism style (matches the game's look)
- Title: "Upgrade to Premium" / "⭐ AG Games Premium"
- Two pricing cards side by side:
  - Monthly: €2.49/month (highlighted as "Most Popular")  
  - Yearly: €19.99/year (shows "Save 33%" badge)
- Benefits list:
  - ⭐ All 20 Monster Avatars
  - 🎨 Premium Colors & Frames (coming soon)
  - 📊 Advanced Statistics (coming soon)
  - 🏆 Leaderboard Rankings (coming soon)
  - 🚫 Ad-Free Experience (coming soon)
- "Subscribe" button that calls the checkout API
- "Maybe Later" close button
- If user is not logged in, show "Sign in first" message instead

The modal should:
1. Accept `onClose` prop
2. Get user from AuthContext
3. On subscribe click: POST to /api/stripe/checkout with priceId + userId + userEmail
4. Redirect to Stripe Checkout URL
5. Use translations for all text

### Style guidelines:
- Background: dark semi-transparent overlay
- Modal: glassmorphism card (backdrop-blur, semi-transparent background)
- Purple/magenta gradient for CTA buttons (matches AG Sudoku branding)
- Green accent for "Save 33%" badge
- Responsive: stack cards vertically on mobile

---

## TASK 8: Update AvatarSelector with Premium Gating

### Modify `app/components/avatars/AvatarSelector.tsx`

When a free user taps a premium avatar:
1. Show a small lock icon overlay on premium avatars (for free users)
2. Instead of selecting it, open the UpgradeModal
3. If user is premium, selecting works normally (current behavior)

Get subscription status from the `profiles` table or AuthContext.

Simple approach:
- Add a `subscriptionTier` prop or fetch from Supabase using the user's ID
- Check `canAccessAvatar(avatar.tier, subscriptionTier)` before allowing selection
- Show 🔒 overlay on locked avatars with slight opacity reduction

---

## TASK 9: Add "Upgrade" Button to Welcome Screen

### Modify `app/[locale]/page.tsx`

For free users who are logged in, show a subtle "⭐ Upgrade to Premium" button below the Play button.

- Small, non-intrusive (not blocking gameplay)
- Purple gradient text or small outlined button
- Opens UpgradeModal on click
- Hidden for premium users and guests

---

## TASK 10: Handle Upgrade Success

When user returns from Stripe with `?upgraded=true`:
1. Show a brief success message/toast: "🎉 Welcome to Premium!"
2. Refresh the user's profile data from Supabase
3. Clear the URL parameter

When `?upgraded=false` (cancelled):
- Just clear the parameter, no message needed

---

## TASK 11: Add "Manage Subscription" to Settings

If the user is premium, add a "Manage Subscription" option in the settings menu that:
1. Fetches their `stripe_customer_id` from profiles table
2. POSTs to /api/stripe/portal
3. Redirects to Stripe Customer Portal (where they can cancel/change plan)

---

## TASK 12: Add Translations

Add to all 12 language files:

```json
"sudoku": {
  "premium": {
    "title": "AG Games Premium",
    "subtitle": "Unlock the full experience",
    "monthly": "Monthly",
    "yearly": "Yearly",
    "monthlyPrice": "€2.49/month",
    "yearlyPrice": "€19.99/year",
    "save": "Save 33%",
    "mostPopular": "Most Popular",
    "subscribe": "Subscribe",
    "maybeLater": "Maybe Later",
    "signInFirst": "Sign in to upgrade",
    "benefits": {
      "avatars": "All 20 Monster Avatars",
      "colors": "Premium Colors & Frames",
      "stats": "Advanced Statistics",
      "leaderboard": "Leaderboard Rankings",
      "adFree": "Ad-Free Experience"
    },
    "upgraded": "Welcome to Premium!",
    "manage": "Manage Subscription",
    "locked": "Premium avatar"
  }
}
```

Translate for all 12 languages (EN, ES, DE, FR, IT, PT, JA, KO, ZH, HI, TL, EU).

---

## TASK 13: Verify Build

1. Run `npm run build` — fix any TypeScript errors
2. Check that guest mode still works
3. Check that free users see lock icons on premium avatars
4. Check that the upgrade modal renders correctly
5. Verify API routes exist (checkout, webhook, portal)

## IMPORTANT NOTES
- The Supabase client is at `src/lib/supabase/client.ts`
- The AuthContext is at `src/context/AuthContext.tsx`
- The AvatarSelector is at `app/components/avatars/AvatarSelector.tsx`
- DO NOT hardcode Stripe keys — they go in .env.local only
- Use test mode keys (sk_test_, pk_test_) — Andre will add them manually
- The webhook needs the raw body (not parsed JSON) for signature verification
- The `profiles` table (not sudoku_profiles) has subscription_tier
- For the Stripe API version, use whatever is latest/compatible — the version string in examples is a guide
- When pushing: `git add app/ src/ messages/` (NOT `git add .` — the nul file breaks it)
- Add SUPABASE_SERVICE_ROLE_KEY to .env.example but NOT .env.local (Andre adds manually)
