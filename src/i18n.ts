import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales
export const locales = ['en', 'es', 'eu', 'fr', 'it', 'de', 'pt', 'ja', 'tl', 'ko', 'zh', 'hi'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

// Locale display names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  eu: 'Euskara',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
  pt: 'Português',
  ja: '日本語',
  tl: 'Tagalog',
  ko: '한국어',
  zh: '中文',
  hi: 'हिन्दी'
};

export default getRequestConfig(async ({ requestLocale }) => {
  // Wait for the locale to be resolved
  const locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
