import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Read cookies from document.cookie
          const value = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1];
          console.log(`🍪 Getting cookie: ${name} = ${value ? 'found' : 'not found'}`);
          return value;
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

          console.log(`🍪 Setting cookie: ${cookie}`);
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

          console.log(`🍪 Removing cookie: ${cookie}`);
          document.cookie = cookie;
        },
      }
    }
  )
}
