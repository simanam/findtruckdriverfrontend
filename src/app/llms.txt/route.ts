export async function GET() {
  const content = `# FindTruckDriver

> Trucking industry news, driver lifestyle tips, product reviews, regulations, and real-time driver tools.

## About
FindTruckDriver is a trucking community platform that provides:
- Blog content covering trucking industry news, regulations, driver lifestyle, product reviews, and trucking tips
- A real-time driver map tool where truck drivers can check in with their status (rolling, waiting, parked) and see nearby drivers
- Anonymous, privacy-focused driver network

## Content Categories
- Industry News: Latest trucking industry developments, market trends, and company news
- Driver Lifestyle: Tips for life on the road, health, food, entertainment, and family
- Regulations: CDL requirements, ELD compliance, FMCSA updates, hours of service rules
- Product Reviews: Truck accessories, GPS devices, dash cams, CB radios, and gear
- Trucking Tips: Driving tips, fuel savings, route planning, and career advice

## Key Pages
- Homepage: /
- Blog Posts: /blog/[slug]
- Categories: /category/[slug]
- Search: /search?q=[query]
- Driver Map Tool: /map
- About: /about
- RSS Feed: /feed.xml

## Contact
- Website: https://findtruckdriver.com
- Email: support@logixtecs.com
- Company: Logixtecs Solutions LLC
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  })
}
