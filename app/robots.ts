import { MetadataRoute } from 'next'

const APP_URL = 'https://sophie1028.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
