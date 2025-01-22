import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = 'https://sakfi.vercel.app';

  // Function to recursively get all routes from the pages directory
  const getRoutes = (directory: string, basePath = ''): string[] => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const routes: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Recursively get routes for subdirectories
        routes.push(...getRoutes(path.join(directory, entry.name), `${basePath}/${entry.name}`));
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        // Process file names to create routes
        const route = entry.name.replace('.tsx', '');
        if (route === 'index') {
          routes.push(basePath || '/');
        } else {
          routes.push(`${basePath}/${route}`);
        }
      }
    }

    return routes;
  };

  // Define the pages directory
  const pagesDir = path.join(process.cwd(), 'src/pages');
  const routes = getRoutes(pagesDir);

  // Generate the sitemap XML
  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${routes
        .map((route) => {
          const url = `${baseUrl}${route}`;
          return `
            <url>
              <loc>${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>daily</changefreq>
              <priority>0.8</priority>
            </url>
          `.trim();
        })
        .join('')}
    </urlset>
  `.trim();

  // Set the Content-Type to XML and send the response
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(sitemap);
}
