import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Read preferred locale from cookie (set before OAuth in LoginButton)
  const cookieStore = await cookies()
  const preferredLocale = cookieStore.get('ag_preferred_locale')?.value || 'en'

  const redirectTo = requestUrl.searchParams.get('redirect') || `/${preferredLocale}/sudoku/play`

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect back to the game after OAuth with user's preferred locale
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
