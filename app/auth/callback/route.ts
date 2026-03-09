import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const redirectTo = requestUrl.searchParams.get('redirect') || '/en'

  const supabase = await createClient()

  // Handle OAuth code exchange (Google Sign-In)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Handle email confirmation link
  if (token_hash && type === 'email') {
    await supabase.auth.verifyOtp({
      token_hash,
      type: 'email',
    })
  }

  // Redirect back to the game after authentication
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
