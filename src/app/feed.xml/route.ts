import { client } from '@/sanity/client'
import { rssFeedQuery } from '@/sanity/lib/queries'

export async function GET() {
  const baseUrl = 'https://findtruckdriver.com'

  const posts = await client.fetch<
    {
      title: string
      slug: string
      excerpt?: string
      publishedAt?: string
      authorName?: string
      categories?: string[]
    }[]
  >(rssFeedQuery)

  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      ${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ''}
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}
      ${post.authorName ? `<author>${post.authorName}</author>` : ''}
      ${post.categories?.map((cat) => `<category>${cat}</category>`).join('') || ''}
    </item>`
    )
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FindTruckDriver Blog</title>
    <link>${baseUrl}</link>
    <description>Trucking industry news, driver lifestyle tips, product reviews, and regulations. By truckers, for truckers.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
