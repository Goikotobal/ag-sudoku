import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Shared cookie options for cross-subdomain SSO with alexgoiko.com
const sharedCookieOptions = {
  domain: '.alexgoiko.com',   // dot prefix = all subdomains
  path: '/',
  sameSite: 'lax' as const,
  secure: true,
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options, ...sharedCookieOptions })
          } catch (error) {
            // Server component - can't set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, ...sharedCookieOptions })
          } catch (error) {
            // Server component - can't set cookies
          }
        },
      },
    }
  )
}
