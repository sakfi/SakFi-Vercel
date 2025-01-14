const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  reactStrictMode: true,
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || {};
      config.externals['plyr'] = 'commonjs plyr'; // Mock plyr on server-side
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap',
      },
    ];
  },
};