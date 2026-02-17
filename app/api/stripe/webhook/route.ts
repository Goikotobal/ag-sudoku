import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
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

          console.log(`Premium subscription activated for user: ${userId}`);
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
              subscription_tier: isActive ? 'premium' : 'free',
            })
            .eq('id', userId);

          console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
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

          console.log(`Subscription cancelled for user: ${userId}`);
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
