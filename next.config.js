const { i18n } = require('./next-i18next.config')

module.exports = {
  i18n,
  reactStrictMode: true,
  // Required by Next i18n with API routes, otherwise API routes 404 when fetching without trailing slash
  trailingSlash: true
}
module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || {};
      config.externals['plyr'] = 'commonjs plyr'; // Mock plyr on server-side
    }
    return config;
  },
};
