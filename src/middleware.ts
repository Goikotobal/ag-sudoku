import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Default locale when no locale is detected
  defaultLocale,

  // Locale detection based on Accept-Language header
  localeDetection: true,

  // Prefix strategy: 'always' | 'as-needed' | 'never'
  // 'as-needed' means the default locale won't have a prefix
  localePrefix: 'as-needed'
});

export const config = {
  // Match all pathnames except for
  // - ... if they start with `/api`, `/_next` or `/_vercel`
  // - ... if they contain a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
