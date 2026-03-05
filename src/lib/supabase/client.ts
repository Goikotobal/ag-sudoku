import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [key, ...val] = cookie.trim().split('=');
            if (key === name) {
              return decodeURIComponent(val.join('='));
            }
          }
          return undefined;
        },
        set(name: string, value: string, options: any) {
          // Set cookie with cross-subdomain options
          const cookieOptions = {
            ...options,
            domain: '.alexgoiko.com',
            path: '/',
            sameSite: 'lax',
            secure: true,
          };

          let cookie = `${name}=${value}`;
          if (cookieOptions.maxAge) cookie += `; max-age=${cookieOptions.maxAge}`;
          if (cookieOptions.domain) cookie += `; domain=${cookieOptions.domain}`;
          if (cookieOptions.path) cookie += `; path=${cookieOptions.path}`;
          if (cookieOptions.sameSite) cookie += `; samesite=${cookieOptions.sameSite}`;
          if (cookieOptions.secure) cookie += `; secure`;

          document.cookie = cookie;
        },
        remove(name: string, options: any) {
          // Remove cookie with cross-subdomain options
          const cookieOptions = {
            ...options,
            domain: '.alexgoiko.com',
            path: '/',
            sameSite: 'lax',
            secure: true,
          };

          let cookie = `${name}=; max-age=0`;
          if (cookieOptions.domain) cookie += `; domain=${cookieOptions.domain}`;
          if (cookieOptions.path) cookie += `; path=${cookieOptions.path}`;
          if (cookieOptions.sameSite) cookie += `; samesite=${cookieOptions.sameSite}`;
          if (cookieOptions.secure) cookie += `; secure`;

          document.cookie = cookie;
        },
      }
    }
  )
}
