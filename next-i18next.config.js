const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en', // Default language
    locales: ['de-DE', 'en', 'es', 'fr', 'zh-CN', 'hi', 'id', 'tr-TR', 'zh-TW'] // Add 'fr' for French
  },
  localePath: path.resolve('public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  keySeparator: false,
  namespaceSeparator: false,
  pluralSeparator: '——',
  contextSeparator: '——'
}
