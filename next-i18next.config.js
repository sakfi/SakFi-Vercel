const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en', // Default language
    locales: ['de-DE', 'en', 'es', 'fr', 'zh-CN', 'hi', 'id', 'tr-TR', 'zh-TW'], // Supported languages
  },
  localePath: path.resolve('./public/locales'), // Correct path for locales
  reloadOnPrerender: process.env.NODE_ENV === 'development', // Reload during development
  keySeparator: false, // Disable key separation
  namespaceSeparator: false, // Disable namespace separation
  pluralSeparator: '——', // Plural separator
  contextSeparator: '——', // Context separator
};
