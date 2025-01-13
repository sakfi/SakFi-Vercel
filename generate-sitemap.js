const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://sakfi.vercel.app' // Replace with your website's URL

const staticPages = [
  '/', // Homepage
  '/about', // Example static pages
  '/contact',
  '/services',
]

const generateSitemap = () => {
  const sitemapContent = staticPages
    .map(page => {
      const url = `${BASE_URL}${page}`
      return `<url><loc>${url}</loc><priority>0.8</priority></url>`
    })
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapContent}
</urlset>`

  fs.writeFileSync(path.join(__dirname, 'public', 'sitemap.xml'), sitemap)
  console.log('✅ Sitemap generated successfully!')
}

generateSitemap()