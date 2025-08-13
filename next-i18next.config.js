module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'si', 'ta'],
  localeDetection: false,
  },
  fallbackLng: { default: ['en'] },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
